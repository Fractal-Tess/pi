import assert from "node:assert/strict";
import test from "node:test";
import { buildRequestBody } from "./codex.ts";
import { resolveUnderCwd, sanitizePathPart } from "./config.ts";
import { decodeImageData, selectRecentImages } from "./images.ts";
import { PROMPT_GUIDELINES } from "./prompt.ts";
import { parseRetryAfter, retryDelayMs } from "./retry.ts";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

test("retry helpers honor numeric retry-after values", () => {
  assert.equal(parseRetryAfter("2"), 2_000);
  assert.equal(
    retryDelayMs(1, null, () => 0.5),
    1_000,
  );
});

test("path helpers resolve workspace and home paths", () => {
  assert.equal(
    resolveUnderCwd("/workspace", "asset.png"),
    "/workspace/asset.png",
  );
  assert.equal(
    resolveUnderCwd("/workspace", "~/asset.png", "/home/test"),
    "/home/test/asset.png",
  );
  assert.equal(sanitizePathPart("call:id!", "fallback"), "call_id");
});

test("image helpers validate signatures and preserve recent-image order", () => {
  assert.deepEqual(
    decodeImageData(PNG_SIGNATURE.toString("base64"), "png"),
    PNG_SIGNATURE,
  );
  const messages = [
    { content: [{ type: "image", data: "first", mimeType: "image/png" }] },
    { content: [{ type: "image", data: "second", mimeType: "image/webp" }] },
  ];
  assert.deepEqual(selectRecentImages(messages, 2), [
    { data: "first", mimeType: "image/png" },
    { data: "second", mimeType: "image/webp" },
  ]);
});

test("request construction includes image inputs", () => {
  const body = buildRequestBody(
    { prompt: "Edit this image" },
    "gpt-5.6-sol",
    "png",
    "session",
    [{ data: "abc", mimeType: "image/png" }],
  );
  assert.equal(body.model, "gpt-5.6-sol");
  assert.equal(body.input[0]?.content[1]?.type, "input_image");
});

test("tool guidance explicitly supports transparent-background requests", () => {
  assert.ok(
    PROMPT_GUIDELINES.some((line) =>
      line.includes("Transparent-background requests are possible"),
    ),
  );
});
