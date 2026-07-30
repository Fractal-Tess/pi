import {
  CODEX_RESPONSES_URL,
  MAX_RETRIES,
  OPENAI_BETA_HEADER,
  type OutputFormat,
} from "./constants.ts";
import { abortableDelay, isRetryableStatus, retryDelayMs } from "./retry.ts";
import type { ToolParams } from "./schema.ts";
import type { InputImage, ParsedCodexResponse } from "./types.ts";

type CodexSseEvent =
  | { type: "error"; message?: string; code?: string }
  | { type: "response.failed"; response?: { error?: { message?: string } } }
  | { type: "response.created"; response?: { id?: string } }
  | { type: "response.output_text.delta"; delta?: string }
  | {
      type: "response.output_item.done";
      item?: {
        type?: string;
        id?: string | number;
        status?: string;
        result?: string;
        revised_prompt?: string;
      };
    }
  | {
      type: "response.completed";
      response?: { id?: string; usage?: unknown };
    };

export function buildRequestBody(
  params: ToolParams,
  model: string,
  outputFormat: OutputFormat,
  sessionId: string,
  inputImages: InputImage[] = [],
) {
  return {
    model,
    store: false,
    stream: true,
    prompt_cache_key: sessionId,
    instructions:
      "You are generating bitmap image assets. For this request, call the image_generation tool exactly once. Do not answer with only text unless image generation is unavailable.",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: params.prompt },
          ...inputImages.map((image) => ({
            type: "input_image",
            image_url: `data:${image.mimeType};base64,${image.data}`,
          })),
        ],
      },
    ],
    tools: [{ type: "image_generation", output_format: outputFormat }],
    tool_choice: "auto",
    parallel_tool_calls: false,
    text: { verbosity: "low" },
  };
}

function parseSseDataLines(chunk: string) {
  const data = chunk
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n")
    .trim();
  return data && data !== "[DONE]" ? data : undefined;
}

function handleCodexEvent(event: CodexSseEvent, parsed: ParsedCodexResponse) {
  switch (event.type) {
    case "error":
      throw new Error(
        `Codex error: ${event.message || event.code || JSON.stringify(event)}`,
      );
    case "response.failed":
      throw new Error(
        event.response?.error?.message || "Codex response failed.",
      );
    case "response.created":
      if (typeof event.response?.id === "string") {
        parsed.responseId = event.response.id;
      }
      break;
    case "response.output_text.delta":
      if (typeof event.delta === "string") parsed.text.push(event.delta);
      break;
    case "response.output_item.done": {
      const item = event.item;
      if (item?.type !== "image_generation_call") break;
      if (typeof item.result !== "string" || item.result.length === 0) {
        throw new Error(
          "Codex image_generation_call did not contain image data.",
        );
      }
      parsed.image = {
        id: String(item.id || "image_generation"),
        status: String(item.status || "completed"),
        result: item.result,
        revisedPrompt:
          typeof item.revised_prompt === "string"
            ? item.revised_prompt
            : undefined,
      };
      break;
    }
    case "response.completed":
      if (typeof event.response?.id === "string") {
        parsed.responseId = event.response.id;
      }
      if (event.response?.usage) parsed.usage = event.response.usage;
      break;
  }
}

async function parseCodexSse(response: Response, signal?: AbortSignal) {
  if (!response.body) {
    throw new Error("Codex response did not include a stream body.");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const parsed: ParsedCodexResponse = { text: [] };

  try {
    while (true) {
      if (signal?.aborted) throw new Error("Image generation was aborted.");
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let separator = buffer.indexOf("\n\n");
      while (separator !== -1) {
        const chunk = buffer.slice(0, separator);
        buffer = buffer.slice(separator + 2);
        const data = parseSseDataLines(chunk);
        if (data) handleCodexEvent(JSON.parse(data) as CodexSseEvent, parsed);
        separator = buffer.indexOf("\n\n");
      }
    }
    const remaining = parseSseDataLines(buffer);
    if (remaining) {
      handleCodexEvent(JSON.parse(remaining) as CodexSseEvent, parsed);
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      // The stream may already be closed.
    }
    reader.releaseLock();
  }

  return parsed;
}

export async function requestImage(
  params: ToolParams,
  token: string,
  accountId: string,
  model: string,
  outputFormat: OutputFormat,
  sessionId: string,
  inputImages: InputImage[],
  signal?: AbortSignal,
) {
  const body = JSON.stringify(
    buildRequestBody(params, model, outputFormat, sessionId, inputImages),
  );
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "chatgpt-account-id": accountId,
    originator: "pi",
    "OpenAI-Beta": OPENAI_BETA_HEADER,
    accept: "text/event-stream",
    "content-type": "application/json",
  };

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    if (signal?.aborted) throw new Error("Image generation was aborted.");
    const response = await fetch(CODEX_RESPONSES_URL, {
      method: "POST",
      headers,
      body,
      signal,
    });

    if (response.ok) return parseCodexSse(response, signal);

    const errorText = await response.text();
    if (
      attempt <= MAX_RETRIES &&
      isRetryableStatus(response.status, errorText)
    ) {
      await abortableDelay(
        retryDelayMs(attempt, response.headers.get("retry-after")),
        signal,
      );
      continue;
    }
    throw new Error(
      `Codex image generation request failed (${response.status}): ${errorText}`,
    );
  }

  throw new Error("Codex image generation request failed after all retries.");
}
