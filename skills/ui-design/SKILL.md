---
name: ui-design
description: "Use for frontend UI design, redesign, critique, polish, and visually important implementation. Routes to one of three internal playbooks: Impeccable for broad product-interface craft and refinement, GPT Style for image-first art direction translated faithfully into code, or Taste for anti-template landing pages, portfolios, and redesigns. Load only one playbook unless the user explicitly asks to combine them."
---

# UI Design

A compact router for three distinct design approaches. Do not blend their rules by default.

## Route by intent

| Request | Load from this skill root |
| --- | --- |
| Product UI, dashboard, app shell, form, settings, onboarding, critique, audit, polish, hardening, or broad interface improvement | `impeccable/PLAYBOOK.md` |
| Explicitly asks for GPT Style, image-first design, generated section or mobile-screen references, or high-fidelity image-to-code art direction | `gpt-style/PLAYBOOK.md` |
| Landing page, marketing site, portfolio, editorial page, or redesign that should avoid templated AI aesthetics | `taste/PLAYBOOK.md` |

Explicit branch names always win. If two branches plausibly fit and would produce materially different workflows, ask one question. Otherwise choose the narrowest branch and proceed.

## Branch boundaries

- **Impeccable:** broadest surface coverage; task success, production completeness, and bounded refinement.
- **GPT Style:** visual reference generation first, deep analysis second, faithful implementation third.
- **Taste:** brief-led code-first art direction for marketing, portfolio, editorial, and redesign surfaces.
- Do not route backend-only work, generic code review, or non-visual refactors here.
- Do not load all three “for inspiration.” Conflicting defaults create incoherent work.

## Shared contract

1. The user’s brief, product truth, existing brand, and explicit references outrank every playbook default.
2. Inspect the target, current stack, assets, tokens, content, and dependencies before changing UI.
3. Preserve functionality, factual copy, routes, analytics hooks, semantics, and accessibility unless scope explicitly changes them.
4. Distinguish correctness and accessibility defects from contextual taste and optional polish.
5. Use existing dependencies and conventions when they are sound; verify before importing anything new.
6. Implement complete interaction states: default, hover/focus/active where relevant, loading, empty, error, disabled, and success.
7. Validate representative desktop and mobile states. Use bounded iteration rather than endless polishing.
8. Run the project’s format, lint, typecheck, test, and build checks after edits.

## Invocation examples

- `/skill:ui-design impeccable polish settings page`
- `/skill:ui-design gpt-style create a four-section launch site`
- `/skill:ui-design taste redesign this portfolio`
