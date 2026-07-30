# Discovering animation opportunities

Find moments where absent motion harms feedback, continuity, or comprehension—and reject motion that would merely decorate frequent UI. This mode is read-only. Read `references/standards.md` from the skill root for implementation values.

## The gate

Every proposed opportunity must pass all four questions:

1. **Frequency:** How often is it seen? The more frequent the action, the less delay and movement it can tolerate. Keyboard and core-navigation feedback must remain immediate.
2. **Purpose:** Name exactly one: feedback, spatial continuity, state indication, preventing a jarring change, explanation, or rare-event delight.
3. **Budget:** Can it fit the repository’s motion language without delaying interaction? Most compact UI transitions should target under 300ms; larger spatial surfaces may justify 300–500ms.
4. **Function:** Does movement help the user understand or act, rather than disturb information they are reading?

Reject the candidate if any answer fails. “It looks cool” is not sufficient purpose.

## Where to inspect

- **Feedback gaps:** actions with no visible pressed, pending, success, or failure state.
- **Teleporting state:** content, layout, or list changes with no perceptual bridge.
- **Missing spatial story:** trigger-connected surfaces appearing from unrelated locations.
- **Group changes:** occasional collections entering incoherently rather than as a restrained sequence.
- **Gesture seams:** drag, swipe, or reorder interactions that ignore direction, distance, velocity, boundaries, interruption, or accidental activation.
- **Rare moments:** onboarding, empty states, completion, and celebration where delight is proportionate.

Do not prescribe hold gestures without a discoverable, accessible non-hold alternative. Do not assume every pressable element needs scale feedback or every state change needs movement.

## Workflow

1. **Recon:** identify stack, motion libraries and versions, repository tokens, component-library conventions, product personality, accessibility behavior, and interaction frequency.
2. **Sweep:** inspect each seam above and record evidence.
3. **Gate:** retain only high-conviction candidates; cap a whole-app report at 5–7 and allow zero.
4. **Specify:** use repository conventions first and shared-standard values only as fallbacks. State property, duration/curve or spring, origin, interruption behavior, and reduced-motion alternative.
5. **Report:** separate accepted opportunities from deliberate rejections.

## Required output

### Opportunities

| # | Location | Current behavior | Purpose | Frequency | Proposed motion |
| --- | --- | --- | --- | --- | --- |

Use `file:line` for source or identify the exact screen/component/state for visual evidence. Recommendations must be implementable, but must not claim compositor behavior without profiling.

### Rejected candidates

List 0–5 evidence-backed candidates that failed the gate and name the rejecting question. Zero is valid when no plausible candidate was actually inspected; never manufacture entries to fill the section.

### Verdict

State how much motion the interface actually needs, whether zero opportunities survived, and the single highest-leverage candidate if one exists. To turn a candidate into a plan, use `/skill:animation plan <description>`.
