import type { SaveMode } from "./constants.ts";

export interface ExtensionConfig {
  save?: SaveMode;
  saveDir?: string;
  model?: string;
}

export interface SaveConfig {
  mode: SaveMode;
  outputDir?: string;
}

export interface GeneratedImage {
  id: string;
  status: string;
  result: string;
  revisedPrompt?: string;
}

export interface ParsedCodexResponse {
  image?: GeneratedImage;
  text: string[];
  responseId?: string;
  usage?: unknown;
}

export interface InputImage {
  data: string;
  mimeType: string;
}
