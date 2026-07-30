import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { CONFIG_DIR_NAME, getAgentDir } from "@earendil-works/pi-coding-agent";
import { DEFAULT_SAVE_MODE, SAVE_MODES, type SaveMode } from "./constants.ts";
import type { ToolParams } from "./schema.ts";
import type { ExtensionConfig, SaveConfig } from "./types.ts";

function readConfigFile(path: string) {
  try {
    const value: unknown = JSON.parse(readFileSync(path, "utf8"));
    return value && typeof value === "object" ? (value as ExtensionConfig) : {};
  } catch {
    return {};
  }
}

export function loadConfig(
  cwd: string,
  projectTrusted: boolean,
  agentDir = getAgentDir(),
) {
  const globalConfig = readConfigFile(
    join(agentDir, "extensions", "codex-image-gen.json"),
  );
  if (!projectTrusted) return globalConfig;
  const projectConfig = readConfigFile(
    join(cwd, CONFIG_DIR_NAME, "extensions", "codex-image-gen.json"),
  );
  return { ...globalConfig, ...projectConfig };
}

export function resolveUnderCwd(
  cwd: string,
  path: string,
  homeDir = homedir(),
) {
  if (path === "~") return homeDir;
  if (path.startsWith("~/")) return resolve(homeDir, path.slice(2));
  return isAbsolute(path) ? path : resolve(cwd, path);
}

export function sanitizePathPart(value: string, fallback: string) {
  const sanitized = value
    .split("")
    .map((character) => (/[a-zA-Z0-9_-]/.test(character) ? character : "_"))
    .join("")
    .replace(/_+$/g, "");
  return sanitized || fallback;
}

function isSaveMode(value: string): value is SaveMode {
  return SAVE_MODES.includes(value as SaveMode);
}

export function resolveSaveConfig(
  params: ToolParams,
  cwd: string,
  sessionId: string,
  config: ExtensionConfig,
): SaveConfig {
  const candidate =
    params.save ||
    process.env.PI_CODEX_IMAGE_SAVE_MODE?.toLowerCase() ||
    config.save ||
    DEFAULT_SAVE_MODE;
  if (!isSaveMode(candidate)) {
    throw new Error(
      `Invalid save mode: ${candidate}. Expected one of ${SAVE_MODES.join(", ")}.`,
    );
  }

  const safeSessionId = sanitizePathPart(sessionId, "session");
  if (candidate === "project") {
    return {
      mode: candidate,
      outputDir: join(cwd, CONFIG_DIR_NAME, "generated-images", safeSessionId),
    };
  }
  if (candidate === "global") {
    return {
      mode: candidate,
      outputDir: join(getAgentDir(), "generated-images", safeSessionId),
    };
  }
  if (candidate === "custom") {
    const configuredDir =
      params.saveDir || process.env.PI_CODEX_IMAGE_SAVE_DIR || config.saveDir;
    if (!configuredDir?.trim()) {
      throw new Error(
        "save=custom requires saveDir or PI_CODEX_IMAGE_SAVE_DIR.",
      );
    }
    return {
      mode: candidate,
      outputDir: join(resolveUnderCwd(cwd, configuredDir), safeSessionId),
    };
  }
  return { mode: candidate };
}
