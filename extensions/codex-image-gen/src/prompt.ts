export const TOOL_DESCRIPTION =
  "Generate or edit a raster image with the OpenAI Codex ChatGPT backend image_generation tool (gpt-image-2). Accepts up to five local or recent conversation images and supports transparent-background requests through a chroma-key generation plus local-removal workflow. Uses the existing openai-codex login; no OPENAI_API_KEY is required.";

export const PROMPT_SNIPPET =
  "Generate or edit raster images, including transparent-background assets, through Codex gpt-image-2.";

export const PROMPT_GUIDELINES = [
  "Use codex_generate_image when the user clearly asks to generate or edit a raster image with OpenAI/Codex image generation.",
  "Do not use codex_generate_image without a clear image-generation request, because it consumes the user's Codex image quota.",
  "Transparent-background requests are possible with codex_generate_image: prompt for the isolated subject on a perfectly flat chroma-key color absent from the subject, then remove that background with available local image tooling. Explain that gpt-image-2 does not expose native alpha control rather than refusing the request.",
] as const;
