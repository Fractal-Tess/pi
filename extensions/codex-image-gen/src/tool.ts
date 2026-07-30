import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { extractChatGptAccountId } from "./auth.ts";
import { DEFAULT_MODEL, PROVIDER, type OutputFormat } from "./constants.ts";
import { loadConfig, resolveSaveConfig } from "./config.ts";
import { requestImage } from "./codex.ts";
import {
  decodeImageData,
  imagePath,
  mimeForFormat,
  resolveInputImages,
  saveImage,
} from "./images.ts";
import {
  PROMPT_GUIDELINES,
  PROMPT_SNIPPET,
  TOOL_DESCRIPTION,
} from "./prompt.ts";
import { TOOL_PARAMS, type ToolParams } from "./schema.ts";

export function registerCodexImageTool(pi: ExtensionAPI) {
  pi.registerTool({
    name: "codex_generate_image",
    label: "Codex Image",
    description: TOOL_DESCRIPTION,
    promptSnippet: PROMPT_SNIPPET,
    promptGuidelines: [...PROMPT_GUIDELINES],
    parameters: TOOL_PARAMS,
    executionMode: "parallel",
    async execute(toolCallId, params: ToolParams, signal, onUpdate, ctx) {
      const outputFormat: OutputFormat = params.outputFormat || "png";
      const config = loadConfig(ctx.cwd, ctx.isProjectTrusted());
      const requestedModel = params.model || config.model || DEFAULT_MODEL;
      const model =
        ctx.modelRegistry.find(PROVIDER, requestedModel)?.id || requestedModel;
      const token = await ctx.modelRegistry.getApiKeyForProvider(PROVIDER);
      if (!token) {
        throw new Error(
          `Missing ${PROVIDER} credentials. Run /login and select ChatGPT Plus/Pro (Codex).`,
        );
      }

      const accountId = extractChatGptAccountId(token);
      const sessionId = ctx.sessionManager.getSessionId();
      const messages: unknown[] = [];
      for (const entry of ctx.sessionManager.getBranch()) {
        if (entry.type === "message") messages.push(entry.message);
        if (entry.type === "custom_message") messages.push(entry);
      }
      const inputImages = await resolveInputImages(params, ctx.cwd, messages);

      onUpdate?.({
        content: [
          {
            type: "text",
            text: `Requesting gpt-image-2 ${inputImages.length > 0 ? "edit" : "generation"} through ${PROVIDER}/${model}...`,
          },
        ],
        details: {
          provider: PROVIDER,
          model,
          outputFormat,
          inputImageCount: inputImages.length,
        },
      });

      const parsed = await requestImage(
        params,
        token,
        accountId,
        model,
        outputFormat,
        sessionId,
        inputImages,
        signal,
      );
      if (!parsed.image) {
        const text = parsed.text.join("").trim();
        throw new Error(
          text
            ? `Codex did not return an image. Response text: ${text}`
            : "Codex did not return an image.",
        );
      }

      const imageBytes = decodeImageData(parsed.image.result, outputFormat);
      const saveConfig = resolveSaveConfig(params, ctx.cwd, sessionId, config);
      let savedPath: string | undefined;
      let attemptedPath: string | undefined;
      let saveWarning: string | undefined;
      if (saveConfig.mode !== "none" && saveConfig.outputDir) {
        attemptedPath = imagePath(
          outputFormat,
          saveConfig.outputDir,
          parsed.image.id || toolCallId,
        );
        try {
          savedPath = await saveImage(
            imageBytes,
            outputFormat,
            saveConfig.outputDir,
            parsed.image.id || toolCallId,
          );
          onUpdate?.({
            content: [{ type: "text", text: `Image saved to ${savedPath}.` }],
            details: {
              provider: PROVIDER,
              model,
              savedPath,
              byteCount: imageBytes.length,
            },
          });
        } catch (error) {
          saveWarning = `Image generation succeeded, but the image could not be saved to disk: ${error instanceof Error ? error.message : String(error)}`;
        }
      }

      const summary = [
        `Generated image via ${PROVIDER}/${model} using backend gpt-image-2.`,
        `Status: ${parsed.image.status}.`,
        parsed.image.revisedPrompt
          ? `Revised prompt: ${parsed.image.revisedPrompt}`
          : undefined,
        savedPath
          ? `Saved image to: ${savedPath}`
          : "Image was not saved to disk.",
        saveWarning ? `Warning: ${saveWarning}` : undefined,
      ]
        .filter(Boolean)
        .join(" ");

      return {
        content: [
          { type: "text", text: summary },
          {
            type: "image",
            data: parsed.image.result,
            mimeType: mimeForFormat(outputFormat),
          },
        ],
        details: {
          provider: PROVIDER,
          model,
          backendImageModel: "gpt-image-2",
          outputFormat,
          saveMode: saveConfig.mode,
          savedPath,
          attemptedPath,
          saveWarning,
          inputImageCount: inputImages.length,
          responseId: parsed.responseId,
          imageGenerationId: parsed.image.id,
          revisedPrompt: parsed.image.revisedPrompt,
          usage: parsed.usage,
        },
      };
    },
  });
}
