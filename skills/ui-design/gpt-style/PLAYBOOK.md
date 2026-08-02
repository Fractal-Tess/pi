# GPT Style playbook

Adapted from the current `gpt-taste` image-first workflow. Use only when image generation is explicitly requested, the user names GPT Style, or the user agrees to generated visual references. The sequence is:

**generate references → analyze deeply → implement faithfully**

Do not silently consume image quota for an ordinary coding request.

## Scope

Best for visually important heroes, landing pages, editorial brand pages, product launches, portfolios, redesigns, and explicit mobile-screen concept sets where art direction is central. Use Taste for code-first work and Impeccable for task-heavy product UI. If the user asks only for reference images, stop after generation and analysis rather than inventing an implementation task.

## 1. Plan the reference set

- Infer the page sections and identify which need their own visual reference.
- Prefer one large, readable image per section over a compressed board with tiny text.
- Generate additional detail images only when typography, spacing, controls, or composition remain unreadable.
- For a large set, state the intended image count before generation so quota use is visible.
- Do not crop an old board to manufacture a section reference. Generate a fresh section-specific view in the same visual world.
- Keep all references consistent in palette, typography mood, spacing, radius, CTA treatment, imagery, and component language.

For mobile sets:

- choose iOS-native, Android-native, or cross-platform-neutral behavior before styling;
- define a compact design bible for palette, type, spacing, surfaces, navigation, icons, imagery, and component anatomy;
- generate each required screen or state as a fresh readable image in one coherent user flow;
- preserve safe areas, system regions, reachable navigation, credible controls, and comfortably readable text;
- show a subtle device frame only when presentation context benefits from it; never let the mockup overpower the app;
- vary screen composition by task while keeping the system visibly consistent.

Use `codex_generate_image` when available. Follow its transparent-background guidance when an asset needs alpha.

## 2. Art-direct each image

Each section reference must communicate:

- hierarchy and focal point;
- real text scale and wrapping;
- gutters, section spacing, and internal rhythm;
- CTA hierarchy and component shapes;
- image treatment and crop system;
- palette, contrast, border, shadow, and material logic;
- a composition that can realistically become responsive code.

### Hero rules

- Keep the opening viewport calm, legible, and intentional on a small laptop.
- Prefer a short headline in one to three lines, concise support copy, a visible primary CTA, and one focal visual.
- Remove fake system labels, decorative pills, fabricated stats, and nested panel clutter.
- Do not expose the entire product above the fold.

### Variation without chaos

Choose one coherent option from each relevant axis and commit:

- light, dark, bold solid, or quiet neutral world;
- solid, textured, cinematic-image, or restrained technical background;
- grotesk, expressive display, editorial, compressed, or Swiss typography;
- centered cinematic, asymmetric split, image-first, editorial offset, or typographic hero;
- bento, gallery cadence, poster storytelling, Swiss grid, or asymmetric marketing flow.

Variation exists to escape defaults, not to randomize away the brief.

## 3. Analyze before coding

For every reference, record:

1. section purpose and visual priority;
2. readable copy and CTA labels;
3. typography family mood, scale ratios, line count, leading, and alignment;
4. spacing relationships, gutters, padding, and cadence;
5. layout/grid structure and responsive implications;
6. component hierarchy, radius, border, shadow, and icon treatment;
7. palette and image grading;
8. ambiguous details that require another reference rather than guessing.

If a key detail is unclear, generate a cleaner standalone reference before implementation.

## 4. Implement as translation

- Treat generated references as the primary visual source of truth, constrained by product facts and accessibility.
- Preserve section order, composition, spacing rhythm, typography character, image balance, palette, and component family.
- Do not replace distinctive sections with generic rows for coding convenience.
- Use semantic structure, real responsive rules, accessible states, and project-native conventions.
- Use generated images as references, not as flattened substitutes for actual interactive UI.
- Invent missing details only after exhausting visible evidence and consistency rules.

## Anti-drift checks

- Does the coded first viewport still match the reference’s hierarchy and breathing room?
- Did typography collapse into framework defaults?
- Did open composition become cards inside cards?
- Did varied sections become repeated left-text/right-image blocks?
- Did the palette drift into generic purple/blue gradients?
- Are real images and assets integrated at suitable aspect ratios?
- Are interactions and responsive behavior faithful to the implied system?

## Finish

Compare implementation against the reference at representative desktop and mobile sizes. Fix structural mismatches first, then typography, spacing, components, color, and polish. Report generated reference paths, implementation files, checks, and remaining visual uncertainties.
