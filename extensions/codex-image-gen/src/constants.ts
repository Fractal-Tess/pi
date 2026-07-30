export const PROVIDER = "openai-codex";
export const DEFAULT_MODEL = "gpt-5.6-sol";
export const CODEX_RESPONSES_URL =
  "https://chatgpt.com/backend-api/codex/responses";
export const JWT_CLAIM_PATH = "https://api.openai.com/auth";
export const DEFAULT_SAVE_MODE = "global";
export const OPENAI_BETA_HEADER = "responses=experimental";
export const MAX_RETRIES = 3;
export const BASE_DELAY_MS = 1_000;
export const MAX_RETRY_DELAY_MS = 30_000;
export const MAX_EDIT_IMAGES = 5;

export const SAVE_MODES = ["none", "project", "global", "custom"] as const;
export type SaveMode = (typeof SAVE_MODES)[number];

export const OUTPUT_FORMATS = ["png", "jpeg", "webp"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
