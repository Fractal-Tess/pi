/**
 * Global Codex image generation extension.
 *
 * Registers `codex_generate_image` using Pi's existing openai-codex auth and
 * the Codex Responses backend's native image_generation tool.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCodexImageTool } from "./src/tool.ts";

export default function codexImageGen(pi: ExtensionAPI) {
  registerCodexImageTool(pi);
}
