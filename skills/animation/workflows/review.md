# Reviewing animation

Review only animation-specific code, diffs, or implementations. Approval is earned, but findings must distinguish demonstrated defects from taste heuristics. Read `references/standards.md` from the skill root before judging values.

## Procedure

1. **Establish context:** interaction, trigger, frequency, product personality, input methods, reduced-motion behavior, installed motion library/version, and repository tokens.
2. **Inspect the exact change and surrounding implementation.** A diff can hide inherited styles, exit behavior, or component-library semantics.
3. **Classify each issue:**
   - **Correctness/accessibility:** broken state, inaccessible interaction, input-parity failure, or ignored user preference.
   - **Measured performance:** profiling evidence of frame, layout, paint, or responsiveness problems.
   - **Interaction quality:** unjustified delay, wrong spatial origin, non-interruptible reversible motion, or incoherent feedback.
   - **Taste/polish:** easing, amplitude, stagger, or personality improvements that are contextual rather than universal.
4. **Verify every citation.** Use `file:line` for source. For visual-only evidence, name the screen, component, state, and action.
5. **Prefer the smallest remedy:** delete → reduce → align with repository tokens → fix physicality/interruptibility → optimize measured bottlenecks → polish.
6. **Request a feel check** when static evidence cannot establish quality. Never claim dropped frames or hardware acceleration without profiling.

## Strong escalation signals

Investigate these immediately, but apply context and documented exceptions:

- motion delaying keyboard or very high-frequency actions;
- `transition: all` or unintended property interpolation;
- layout/paint-heavy animation affecting a large or busy surface;
- movement without suitable reduced-motion behavior;
- hover-only behavior without touch/keyboard parity;
- trigger-anchored UI animating from an unrelated origin;
- rapidly reversible UI implemented with motion that restarts or snaps;
- duration, easing, or spring values that conflict with established product tokens;
- accidental gesture activation or no accessible alternative.

Pure opacity, `scale(0)`, layout properties, built-in easings, and library transform shorthands are **review prompts, not automatic failures**. Judge purpose, context, browser/library behavior, and evidence.

## Required output

One row per distinct issue, highest impact first:

| Severity | Location | Current behavior | Recommendation | Reason |
| --- | --- | --- | --- | --- |
| HIGH / MEDIUM / LOW | `file:line` or visual state | What happens now | Exact smallest change | User impact and evidence |

Then give a concise verdict without repeating every row:

- **Block** — correctness/accessibility failure, severe interaction regression, or measured performance defect.
- **Needs changes** — meaningful issues remain, but none independently require blocking all use.
- **Approve** — no material animation-specific findings; optional polish must be labeled non-blocking.

If no issue is found, write: **“No animation-specific findings. Approve.”** Add only unverified feel checks that still require runtime observation.
