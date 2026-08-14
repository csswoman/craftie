# Plan 004: Replace opaque regeneration with palette intents

> **Executor instructions**: Work only in the stated scope, run every gate, and retain the user's unrelated working-tree changes.
>
> **Drift check**: `git diff --stat 0fa2409..HEAD -- src/components/color/useSelectColorsWorkspaceController.ts src/lib/browser/imageExtractor.ts src/components/color/PaletteImageBlock.tsx src/components/color-engine/ImageUploader.tsx`

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED — changes a visible workflow but should preserve one-click re-extraction.
- **Depends on**: `plans/003-separate-image-and-ui-palettes.md`
- **Category**: UX / correctness
- **Planned at**: commit `0fa2409`, 2026-08-14

## Why this matters

The current “Regenerar paleta” button changes sample stride, offset, and centroid seed. A user cannot predict whether the result is more faithful, more varied, or merely different. Palette generation must be deterministic for an explicit intent and must tell the user which intent produced the visible result.

## Current state

- `src/lib/browser/imageExtractor.ts:95-104` derives `sampleStep`, `sampleOffset`, and `centroidSeed` from `regenerateIndex`.
- `src/components/color/useSelectColorsWorkspaceController.ts:144-198` stores only the regenerate counter and invokes `extractPaletteColorsFromImage(file, regenerateIndex)`.
- `src/components/color/PaletteImageBlock.tsx:52-65` exposes only an icon button labelled “Regenerar paleta”.
- `src/components/color-engine/ImageUploader.tsx:91-109` has an accessible select pattern for palette type that can be followed for a compact intent selector.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Relevant tests | `pnpm exec vitest run lib/color/imageExtractor.test.ts lib/color/imagePalette.test.ts --maxWorkers=1` | exit 0 |
| Lint | `pnpm lint` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Full verification | `pnpm verify` | exit 0 |

## Scope

**In scope**

- `lib/color/imageTypes.ts` and extractor tests for a named intent type/options
- `src/lib/browser/imageExtractor.ts`
- `src/components/color/useSelectColorsWorkspaceController.ts`
- `src/components/color/PaletteImageBlock.tsx`
- `src/components/color-engine/ImageUploader.tsx` only if the same control is rendered there
- Focused component/controller tests if the repository already has their test harness; otherwise document browser acceptance in the PR

**Out of scope**

- Crop creation (Plan 005).
- Palette type classifier override; preserve it.
- Random role-palette button behavior, which is a separate feature.

## Steps

### Step 1: Replace index-derived behavior with named intents

Define a small type with Spanish-facing labels in UI and stable internal values, at minimum: dominant/source-faithful, varied/design-ready, and high-contrast/design-ready. Map each intent to the pure extraction/palette-mode policy from Plans 002–003. Repeating the same intent on unchanged input must return the same result; do not use offset/seed as hidden randomization.

**Verify**: `pnpm exec vitest run lib/color/imageExtractor.test.ts lib/color/imagePalette.test.ts --maxWorkers=1` → determinism and mode tests pass.

### Step 2: Store and apply the chosen intent in the controller

Replace `imageRegenerateIndex` as the palette-choice mechanism with explicit intent state. Keep one action that reapplies the currently selected intent, but do not call it “another palette” unless it changes an explicit option. Preserve busy-state guarding and current error behavior.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Make the choice visible and accessible

Replace the lone refresh icon with a compact labelled control or a clearly labelled menu. Ensure 44px touch targets, keyboard operation, visible focus, and Spanish copy that states outcome rather than algorithm. Suggested labels: “Fiel a la imagen”, “Más variedad”, “Más contraste”. Keep the image-change action separate.

**Verify**: `pnpm lint` → exit 0; manually verify keyboard focus/order in the browser.

## Done criteria

- [ ] Same file + same intent produces identical source candidates and role inputs.
- [ ] Every visible palette has a user-readable selected intent.
- [ ] No production path derives palette identity from `regenerateIndex`, random seed, or sample offset.
- [ ] `pnpm verify` exits 0.

## STOP conditions

- The requested “high contrast” intent requires changing global accessibility thresholds; stop and keep it limited to candidate ranking.
- The control cannot fit the established compact toolbar while retaining a 44px target; stop and propose its placement instead of shrinking it below accessibility requirements.

## Maintenance notes

Future intents must be named product choices with deterministic policies and regression tests, not new seed arithmetic. Plan 005 should carry the chosen intent into its crop request.
