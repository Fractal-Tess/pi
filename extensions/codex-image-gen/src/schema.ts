import { StringEnum } from "@earendil-works/pi-ai";
import { type Static, Type } from "typebox";
import {
  DEFAULT_MODEL,
  MAX_EDIT_IMAGES,
  OUTPUT_FORMATS,
  SAVE_MODES,
} from "./constants.ts";

export const TOOL_PARAMS = Type.Object({
  prompt: Type.String({
    description:
      "The image prompt. Be specific about subject, composition, style, text, transparency workflow, and constraints.",
  }),
  model: Type.Optional(
    Type.String({
      description: `Codex model that should invoke image generation. Defaults to ${DEFAULT_MODEL}.`,
    }),
  ),
  outputFormat: Type.Optional(StringEnum(OUTPUT_FORMATS)),
  save: Type.Optional(StringEnum(SAVE_MODES)),
  saveDir: Type.Optional(
    Type.String({
      description:
        "Directory to save the image when save=custom. Relative paths resolve under the current workspace.",
    }),
  ),
  referencedImagePaths: Type.Optional(
    Type.Array(Type.String(), {
      maxItems: MAX_EDIT_IMAGES,
      description:
        "Up to five local image paths to edit. Relative paths resolve under the current workspace.",
    }),
  ),
  numLastImagesToInclude: Type.Optional(
    Type.Integer({
      minimum: 1,
      maximum: MAX_EDIT_IMAGES,
      description:
        "Use the most recent one to five images from the current conversation as edit inputs.",
    }),
  ),
});

export type ToolParams = Static<typeof TOOL_PARAMS>;
