import { JWT_CLAIM_PATH } from "./constants.ts";

function decodeJwtPayload(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) {
    throw new Error(
      "OpenAI Codex auth token is not a JWT. Run /login for openai-codex again.",
    );
  }
  try {
    return JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `Failed to decode OpenAI Codex auth token: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export function extractChatGptAccountId(token: string) {
  const payload = decodeJwtPayload(token);
  const authClaims = payload[JWT_CLAIM_PATH];
  if (!authClaims || typeof authClaims !== "object") {
    throw new Error(
      "OpenAI Codex auth token does not contain ChatGPT auth claims. Run /login for openai-codex again.",
    );
  }
  const accountId = (authClaims as Record<string, unknown>)[
    "chatgpt_account_id"
  ];
  if (typeof accountId !== "string" || accountId.length === 0) {
    throw new Error(
      "OpenAI Codex auth token does not contain chatgpt_account_id. Run /login for openai-codex again.",
    );
  }
  return accountId;
}
