# Animation Standards Reference

A compact set of web UI motion principles and fallback values, distilled primarily from Emil Kowalski's design-engineering philosophy. These are starting heuristics, not universal browser facts or substitutes for repository conventions, user preferences, runtime observation, and profiling.

Apply values in this order: valid repository/component-library convention → existing value that satisfies the principle → fallback from this reference. “Exact” means do not invent observed code, tokens, measurements, or profiling results.

## Should it animate? (frequency table)

| Frequency | Default posture |
| --- | --- |
| 100+ times/day (shortcuts, command palette, core navigation) | Keep response immediate; remove decorative delay and movement |
| Tens of times/day (hover, list navigation, frequent toggles) | Prefer subtle, fast feedback or none |
| Occasional (modals, drawers, toasts) | Standard restrained motion may help |
| Rare / first-time (onboarding, completion, celebration) | A larger delight budget may be justified |

Keyboard input still needs visible state feedback and parity with pointer/touch input; avoid transitions that delay the action itself. Valid motion purposes are spatial continuity, state indication, explanation, feedback, and preventing a jarring change. “It looks cool” alone is insufficient for frequent UI.

## Easing

Decision order:
- Entering or exiting → **`ease-out`** (starts fast, feels responsive)
- Moving / morphing on screen → **`ease-in-out`**
- Hover / color change → **`ease`**
- Constant motion (marquee, progress) → **`linear`**
- Default → **`ease-out`**

Prefer responsive curves over `ease-in` for user-triggered entrances because a slow start can feel delayed. Alternatives can be valid for exits, continuous movement, or an established product language.

Reuse repository curves first. When none exist, these stronger curves are useful starting points:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);        /* strong ease-out for UI */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);    /* strong ease-in-out for on-screen movement */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);     /* iOS-like drawer curve (Ionic) */
```

Treat these as fallback tokens, not mandatory replacements for valid existing values.

## Duration

| Element | Duration |
| --- | --- |
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing / explanatory | Can be longer |

Most compact UI transitions should target under 300ms. Larger spatial surfaces such as modals and drawers may justify 300–500ms when distance, context, and product language support it. Duration must not delay interaction; repeated tooltips and high-frequency feedback should become effectively immediate.

## Physicality

- Treat `scale(0)` as a visual smell for ordinary surface entrances. A `scale(0.9–0.97)` plus opacity often preserves object identity, but intentional collapse/morph effects may justify other values.
- Trigger-connected popovers should usually inherit an origin near their trigger:
  ```css
  .popover { transform-origin: var(--transform-origin); } /* Base UI example */
  ```
  Centered modals and non-spatial crossfades are valid exceptions.
- Press feedback must fit frequency and product personality. When scale is appropriate, `scale(0.97)` over roughly `100–160ms` is a useful fallback—not a requirement for every pressable element.

## Springs

Springs are useful for momentum, interruptible gestures, and intentionally “alive” elements. APIs differ: some expose a perceptual duration and bounce, while others expose physical parameters. Verify the installed library before copying a configuration.

```js
// Perceptual API starting point, when supported
{ type: "spring", duration: 0.5, bounce: 0.2 }

// Physical-parameter starting point
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

As a fallback, keep bounce subtle (`0.1–0.3`) and reserve visible bounce for interactions whose personality supports it. Many spring implementations can preserve velocity when retargeted, which suits reversible gestures; verify library behavior.

For decorative pointer-following effects, spring interpolation can add momentum while direct mapping feels more literal. Choose intentionally and avoid either pattern on functional data.

## Interruptibility

CSS transitions naturally retarget from the current interpolated state. Keyframe animations require explicit cancellation/reversal logic and often restart when naively retriggered. Prefer transitions or springs for rapidly reversible UI unless the implementation proves smooth interruption.

```css
/* Interruptible — good for dynamic UI */
.toast { transition: transform 200ms ease-out; }

/* Not interruptible — avoid for dynamic UI */
@keyframes slideIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

Use `@starting-style` for entry without JS:

```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style { opacity: 0; transform: translateY(100%); }
}
```

Legacy fallback: `useEffect(() => setMounted(true), [])` + `data-mounted` attribute.

## Asymmetric timing

When an interaction has deliberate and responsive phases, the deliberate phase may be slower while system acknowledgement remains fast. Hold interactions require a discoverable, accessible alternative.

```css
.overlay { transition: clip-path 200ms ease-out; }            /* release: fast */
.button:active .overlay { transition: clip-path 2s linear; }  /* press: slow, deliberate */
```

## Performance

- Prefer `transform` and `opacity`; they are the safest cross-browser compositor candidates. Eligibility does not guarantee layer promotion or smoothness.
- Treat layout- and paint-triggering properties (`width`, `height`, position, large filters, complex clip paths) as risks proportional to affected area and frequency—not automatic failures. Profile representative devices.
- `transition: all` is a strong smell because it can interpolate unintended properties; name only the intended properties.
- Parent CSS-variable updates can broaden style recalculation. Direct element updates may reduce scope, but verify with DevTools before claiming a recalculation storm.
- Motion/Framer Motion behavior depends on installed version and driver. Individual transform shorthands may prevent WAAPI acceleration in some versions; inspect generated behavior and profile before prescribing a rewrite.
- CSS and WAAPI can move eligible work away from main-thread JavaScript, but neither guarantees compositor execution for every property or browser. Use CSS for simple predetermined motion; use JS or springs when dynamic state, gestures, or interruption require them.
- Performance findings require evidence: frame timeline, long tasks, layout/paint cost, or reproducible responsiveness degradation. State unmeasured risks as risks.

## Transforms & clip-path

- **`translate` percentages** are relative to the element's own size — `translateY(100%)` moves by the element's height regardless of dimensions (how Sonner/Vaul position toasts/drawers). Prefer over hardcoded px.
- **`scale()` scales children too** (font, icons, content) — a feature for press feedback.
- **3D**: `rotateX/Y` + `transform-style: preserve-3d` for depth/orbit/flip without JS.
- **`clip-path: inset(t r b l)`** is a powerful animation tool: each value eats in from that side. Uses: reveal-on-scroll (`inset(0 0 100% 0)` → `inset(0 0 0 0)`), hold-to-delete overlay, seamless tab color transitions (duplicate + clip the active copy), comparison sliders.

## Gestures & drag

- Gesture completion should consider direction, distance, velocity, target size, and accidental-trigger testing. A velocity near `0.11 px/ms` can be an initial experiment, never a universal threshold.
- Damping or rising resistance can communicate boundaries better than an unexplained hard stop.
- Use pointer capture when appropriate so a drag can continue after leaving bounds.
- Guard against extra touch points after a drag starts to prevent jumps.
- Destructive or hold gestures need a discoverable, accessible alternative.

## Masking imperfect crossfades

When a crossfade still double-exposes states after timing is tuned, a subtle blur can sometimes bridge them. Treat `blur(2px)` as an experiment and profile paint cost, especially in Safari; avoid large animated blur.

## Stagger

For occasional group entrances that need sequencing, `30–80ms` between items is a useful fallback. Stagger is decorative: omit it on frequent surfaces and never block interaction while it plays.

```css
.item { opacity: 0; transform: translateY(8px); animation: fadeIn 300ms ease-out forwards; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }
@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } }
```

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; } /* keep opacity/color, drop transform-based motion */
}
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); } /* gate hover motion — touch fires false hovers on tap */
}
```

```jsx
const reduce = useReducedMotion();
const closedX = reduce ? 0 : '-100%';
```

Reduced-motion behavior may remove, reduce, or replace non-essential movement. Preserve comprehension and visible feedback, but do not force opacity animation when the user or platform preference calls for no animation.

## Debugging (recommend in reviews when feel is uncertain)

- **Slow motion**: bump duration 2–5× or use DevTools animation inspector. Check colors crossfade cleanly, easing doesn't stop abruptly, `transform-origin` is right, coordinated properties stay in sync.
- **Frame-by-frame**: Chrome DevTools Animations panel reveals timing drift between coordinated properties.
- **Real devices** for gestures (drawers, swipe) — connect a phone, hit the dev server by IP, use Safari remote devtools.
- **Fresh eyes next day** — imperfections invisible during development surface later.

## Cohesion

Match motion to product personality and existing components: playful surfaces may tolerate more bounce; professional tools usually benefit from crisp, restrained timing. Validate coordinated property changes at runtime—there is no universal formula for opacity, size, and movement combinations.

## Audit coverage checklist

When surveying a codebase rather than reviewing one change, cover all eight categories and explicitly clear categories with no findings:

1. **Purpose and frequency** — unjustified delay/movement, missing immediate feedback, or decoration on frequently used UI.
2. **Easing and duration** — curves or timing that feel delayed, conflict with tokens, or exceed a justified budget.
3. **Physicality and origin** — loss of object identity, incorrect trigger origins, or feedback that does not fit the interaction.
4. **Interruptibility** — rapidly reversible UI that restarts, snaps, or loses gesture state.
5. **Performance** — unintended transitions, broad layout/paint cost, or measured frame/responsiveness problems.
6. **Accessibility** — missing reduced-motion behavior, input-parity gaps, or hover behavior without capability gating.
7. **Cohesion and tokens** — motion that conflicts with product personality, duplicated near-identical values, or uncoordinated group entrances.
8. **Missed opportunities** — teleporting state, missing spatial continuity, or rare high-emotion moments that would genuinely benefit from restrained motion.

For missed opportunities, report only a handful grounded in actual UX seams. Do not turn the audit into an animation wishlist.
