import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { MAX_EDIT_IMAGES, type OutputFormat } from "./constants.ts";
import { resolveUnderCwd, sanitizePathPart } from "./config.ts";
import type { ToolParams } from "./schema.ts";
import type { InputImage } from "./types.ts";

function extensionForFormat(outputFormat: OutputFormat) {
  return outputFormat === "jpeg" ? "jpg" : outputFormat;
}

export function mimeForFormat(outputFormat: OutputFormat) {
  return outputFormat === "jpeg" ? "image/jpeg" : `image/${outputFormat}`;
}

export function imagePath(
  outputFormat: OutputFormat,
  outputDir: string,
  imageCallId: string,
) {
  const filename = `${sanitizePathPart(imageCallId, "image_generation")}.${extensionForFormat(outputFormat)}`;
  return join(outputDir, filename);
}

export function decodeImageData(
  base64Data: string,
  outputFormat: OutputFormat,
) {
  const value = base64Data.trim();
  if (
    !value ||
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    throw new Error("Codex returned invalid base64 image data.");
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.length === 0 || bytes.toString("base64") !== value) {
    throw new Error("Codex returned invalid base64 image data.");
  }
  const validSignature =
    (outputFormat === "png" &&
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(
          Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        )) ||
    (outputFormat === "jpeg" &&
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff) ||
    (outputFormat === "webp" &&
      bytes.length >= 12 &&
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP");
  if (!validSignature) {
    throw new Error(
      `Codex returned image data that does not match ${outputFormat}.`,
    );
  }
  return bytes;
}

export async function saveImage(
  bytes: Buffer,
  outputFormat: OutputFormat,
  outputDir: string,
  imageCallId: string,
) {
  const filePath = imagePath(outputFormat, outputDir, imageCallId);
  await withFileMutationQueue(filePath, async () => {
    await mkdir(outputDir, { recursive: true });
    await writeFile(filePath, bytes);
  });
  return filePath;
}

export function selectRecentImages(messages: unknown[], count: number) {
  const images: InputImage[] = [];
  for (
    let index = messages.length - 1;
    index >= 0 && images.length < count;
    index--
  ) {
    const message = messages[index] as { content?: unknown };
    if (!Array.isArray(message?.content)) continue;
    for (
      let contentIndex = message.content.length - 1;
      contentIndex >= 0 && images.length < count;
      contentIndex--
    ) {
      const block = message.content[contentIndex] as {
        type?: unknown;
        data?: unknown;
        mimeType?: unknown;
      };
      if (
        block.type === "image" &&
        typeof block.data === "string" &&
        typeof block.mimeType === "string"
      ) {
        images.push({ data: block.data, mimeType: block.mimeType });
      }
    }
  }
  return images.reverse();
}

function mimeFromBytes(bytes: Buffer, path: string) {
  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  throw new Error(`Referenced image is unavailable or unsupported: ${path}`);
}

export async function resolveInputImages(
  params: ToolParams,
  cwd: string,
  messages: unknown[],
) {
  const paths = params.referencedImagePaths ?? [];
  if (paths.length > 0 && params.numLastImagesToInclude !== undefined) {
    throw new Error(
      "Provide only one of referencedImagePaths or numLastImagesToInclude.",
    );
  }
  if (paths.length > MAX_EDIT_IMAGES) {
    throw new Error(
      `referencedImagePaths accepts at most ${MAX_EDIT_IMAGES} paths.`,
    );
  }
  if (paths.length > 0) {
    return Promise.all(
      paths.map(async (path) => {
        const normalized = path.startsWith("@") ? path.slice(1) : path;
        const absolutePath = resolveUnderCwd(cwd, normalized);
        let bytes: Buffer;
        try {
          bytes = await readFile(absolutePath);
        } catch (error) {
          throw new Error(
            `Unable to read referenced image at ${absolutePath}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        return {
          data: bytes.toString("base64"),
          mimeType: mimeFromBytes(bytes, absolutePath),
        };
      }),
    );
  }
  if (params.numLastImagesToInclude !== undefined) {
    const count = params.numLastImagesToInclude;
    if (!Number.isInteger(count) || count < 1 || count > MAX_EDIT_IMAGES) {
      throw new Error(
        `numLastImagesToInclude must be between 1 and ${MAX_EDIT_IMAGES}.`,
      );
    }
    const images = selectRecentImages(messages, count);
    if (images.length !== count) {
      throw new Error(
        `Requested the last ${count} conversation images, but only ${images.length} were available.`,
      );
    }
    return images;
  }
  return [];
}
