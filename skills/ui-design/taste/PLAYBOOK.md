# Taste playbook

A distilled version of `design-taste-frontend` v2. Use for landing pages, portfolios, editorial pages, and visual redesigns that should feel brief-specific rather than templated. It is not the primary branch for dashboards, dense data tools, or multi-step product UI.

## 1. Read the brief

Infer:

- page kind and conversion or communication job;
- audience and trust requirements;
- requested vibe and named references;
- existing logo, type, color, photography, and design tokens;
- preserve-versus-overhaul intent;
- accessibility, regulatory, performance, and platform constraints.

Before code, state one line:

> **Design read:** `<surface>` for `<audience>`, using a `<visual language>` direction with `<implementation foundation>`.

Ask one clarifying question only when two plausible reads would produce materially different work.

## 2. Set three contextual dials

| Dial | Meaning |
| --- | --- |
| **Variance** | symmetry and convention → asymmetry and art direction |
| **Motion** | static feedback → cinematic choreography |
| **Density** | gallery-like air → information-rich compression |

Choose values from `1–10` based on the brief; never force the same baseline onto every project.

Typical ranges:

| Surface | Variance | Motion | Density |
| --- | ---: | ---: | ---: |
| Mainstream SaaS landing | 6–8 | 4–6 | 3–5 |
| Creative studio or portfolio | 8–10 | 6–9 | 2–4 |
| Premium consumer | 6–8 | 4–7 | 2–4 |
| Editorial | 5–8 | 3–6 | 2–4 |
| Trust-first or regulated | 3–5 | 1–3 | 4–6 |

## 3. Choose the foundation honestly

Use an official design system when the product context calls for it: Fluent, Material, Carbon, Polaris, Atlassian, Primer, GOV.UK, or USWDS. Do not recreate an official system approximately or mix multiple systems.

For aesthetic directions without an official system, use the project’s existing stack or a maintained accessible foundation. Label web approximations such as glass or Apple-inspired materials honestly.

Before importing a library, inspect `package.json`; install only with user approval or when dependency changes are in scope.

### Design-system handoff

When the user requests a Stitch-compatible brief or `DESIGN.md`, translate the chosen direction into semantic rules rather than poetic mood alone. Include: atmosphere; palette values and roles; typography families, scale, weight, and line-height; component anatomy and states; layout grid and spacing; responsive transformations; motion principles; accessibility constraints; and explicit anti-patterns. Ground every rule in the inspected project and preserve prior decisions unless replacement is requested.

## 4. Correct default AI biases

### Composition

- Avoid automatic centered heroes, three equal feature cards, repeated zigzags, and identical section families.
- Make the first viewport fit on a small laptop: concise headline, short support text, visible CTA, intentional visual.
- Use cards only when containment or elevation communicates hierarchy.
- Build explicit mobile composition for every multi-column section.
- Keep navigation single-line at desktop and prioritize the primary path.

### Typography

- Choose type from brand and audience, not “premium means serif” or “tech means Inter.”
- Control line length, wrapping, leading, tracking, and optical sizing with real content.
- Keep display copy concise enough for its intended composition.
- Use one coherent type system and prevent loading/layout shifts.

### Color and shape

- Establish one palette, accent strategy, neutral temperature, and radius logic.
- Avoid default AI-purple glows and repeated beige/brass luxury palettes unless the brief supports them.
- Verify text, button, form, focus, and image-overlay contrast.
- Do not flip page theme between sections without an explicit narrative reason.

### Content and assets

- Use real or generated imagery when visual storytelling requires it; do not substitute fake dashboard rectangles or decorative pseudo-data.
- Never invent metrics, testimonials, product claims, company logos, or engineering precision.
- Remove generic names, filler verbs, fake version labels, status dots, section numbering, and performative microcopy unless meaningful.
- Keep one copy register across the page and reread every visible string.

### Interaction and motion

- Every animation must communicate hierarchy, feedback, continuity, or state.
- Match motion intensity to frequency and product character.
- Honor reduced motion and clean up listeners/triggers.
- Use CSS for simple transitions, Motion for state/layout gestures, and GSAP only for justified pin/scrub storytelling.
- Do not add an animation library merely to make a static page “feel premium.”

## Optional style lenses

Use a lens only when the brief or references support it. A lens is a coherent vocabulary, not a mandatory template.

- **Dark discovery:** rich near-black surfaces, restrained neon categorization, mono plus geometric typography, dense visual browsing, tactile hover states. Keep glows rare and speed high.
- **Industrial print:** off-white paper, carbon ink, one hazard accent, strict visible grid, macro grotesk type, square geometry, technical microtype, and restrained analog texture.
- **Tactical telemetry:** dark substrate, mono data hierarchy, exact compartments, sparse phosphor/status color, crosshair or bracket framing, and high information density without fabricated pseudo-data.
- **Editorial minimal:** warm monochrome, strong type contrast, low-chroma semantic accents, flat surfaces, precise dividers, sparse motion, and generous but purposeful whitespace.
- **Soft agency:** airy composition, deliberate asymmetry, refined typography, coherent materials, and a small number of high-quality interactions. Avoid compulsory glass, nested bezels, pills, and scroll reveals.

Do not mix lenses casually. Product identity and the Design read still control palette, type, density, and motion.

## 5. Redesign protocol

1. Determine preserve, evolve, or overhaul.
2. Audit brand tokens, information architecture, content, signature patterns, accessibility, analytics hooks, SEO-sensitive routes, and current dial values.
3. Preserve URLs, navigation labels, form contracts, legal text, analytics identifiers, and brand marks unless explicitly approved.
4. Improve in leverage order: typography → spacing/rhythm → color → interaction → key-section recomposition → full replacement.
5. Treat existing functionality and content as product truth, not disposable visual noise.

## Preflight

- Design read and dial choices follow the brief.
- Hero and navigation fit representative desktop and mobile viewports.
- Sections use varied but coherent composition.
- Typography, palette, shape, and spacing systems remain consistent.
- CTA intent, labels, contrast, and wrapping are sound.
- Real states and responsive fallbacks exist.
- No fabricated content, fake precision, fake UI preview, or decorative metadata.
- Motion is motivated, interruptible where needed, and reduced-motion safe.
- Images have reserved space, useful alt text, and suitable loading behavior.
- Format, lint, typecheck, tests, build, and visual inspection pass.
