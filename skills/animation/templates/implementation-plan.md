# Animation implementation plan template

A plan must stand alone for an executor with no conversation context. Use repository conventions first; read `references/standards.md` from the skill root only for fallback principles and values.

```markdown
# NNN — <Imperative title>

- **Status**: TODO | APPROVED | DONE
- **Commit**: <short commit, or `not-a-git-repository`>
- **Severity**: HIGH | MEDIUM | LOW
- **Category**: <audit category>
- **Estimated scope**: <files and rough size>

## Problem

Explain the observed behavior, user impact, and evidence. Cite `path:line` and include the smallest relevant current excerpt.

## Target

Describe observable target behavior and exact implementation values. Reuse valid repository tokens and patterns; introduce fallback values only when the repository lacks them.

## Repository conventions

Name the token locations, component/library behavior, and one `path:line` exemplar to follow.

## Steps

1. <One bounded edit: file, change, expected result.>
2. …

## Boundaries

- Do not touch <out-of-scope files or behavior>.
- Do not add dependencies unless explicitly approved.
- Stop and report if current code materially differs from the stamped commit.

## Verification

- **Mechanical:** <exact format/lint/typecheck/test/build commands and expected result>.
- **Interaction:** <trigger, rapid reversal, keyboard/touch/pointer behavior>.
- **Accessibility:** <reduced-motion and input-parity checks>.
- **Feel check:** <slow-motion, frame-by-frame, or real-device observations>.
- **Performance:** <profile only when performance is part of the finding>.
- **Done when:** <observable completion criteria>.
```

## Author rules

- Prefer one plan per finding; merge only when scope and fix pattern are inseparable.
- Do not invent token names, measurements, or profiling results.
- A feel check is required, but it must state what to observe rather than demand a predetermined verdict.
- Update the animation plan index with number, title, severity, status, dependencies, and recommended order.
