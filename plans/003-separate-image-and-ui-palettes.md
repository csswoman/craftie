# Plan 003: Separate image-faithful and UI-ready palettes

> **Executor instructions**: Execute sequentially, preserve unrelated files, and update the index after all gates pass.
>
> **Drift check**: `git diff --stat 0fa2409..HEAD -- lib/color/imagePalette.ts lib/color/semanticTokens.ts lib/color/imageTypes.ts lib/color/imagePalette.test.ts src/lib/browser/imageExtractor.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: HIGH — this is a public product-semantic change with role-output consequences.
- **Depends on**: `plans/002-publish-diverse-image-candidates.md`
- **Category**: architecture / direction
- **Planned at**: commit `0fa2409`, 2026-08-14

## Why this matters

Craftie currently sends a single extracted candidate list both to the source catalog and to semantic role derivation. Users need two honest products: an image-faithful palette showing dominant source colors, and a UI-ready palette that deliberately reserves usable neutral and expressive candidates before accessibility correction. Keeping these modes explicit prevents role heuristics from being mistaken for literal extraction.

## Current state

- `lib/color/imagePalette.ts` already defines `ImageExtractionMode = 'paint' | 'ui'` and two result types, but its UI build ultimately calls `assignRolesFromExtracted(extracted, 'light', classification.type)`.
- `src/lib/browser/imageExtractor.ts:90-105` accepts a `mode`, but only changes centroid/medoid publication.
- `lib/color/semanticTokens.ts:980-1018` applies area-aware role selection: primary/secondary come from ordered expressive candidates and accent prefers lower prominence.
- `src/components/color/useSelectColorsWorkspaceController.ts:172-178` calls extraction and `buildImagePalette` without a distinct user-selected mode.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused tests | `pnpm exec vitest run lib/color/imagePalette.test.ts lib/color/semanticTokens.test.ts --maxWorkers=1` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Full verification | `pnpm verify` | exit 0 |

## Scope

**In scope**

- `lib/color/imagePalette.ts`, `lib/color/imagePalette.test.ts`
- `lib/color/imageTypes.ts`
- `lib/color/semanticTokens.ts`, its focused tests
- `src/lib/browser/imageExtractor.ts`
- `src/components/color/useSelectColorsWorkspaceController.ts`

**Out of scope**

- New controls/copy (Plan 004).
- Crop UI (Plan 005).
- Changes to exported design-token formats.

## Steps

### Step 1: Establish explicit mode contracts in pure code

Make `paint` and `ui` mean more than centroid versus medoid:

- `paint`: return source-faithful candidates ordered by presence, without semantic role claims;
- `ui`: return the same traceable source catalog plus the deliberately selected input used for role derivation, with an explicit provenance field if needed;
- no mode may invent a source color; derived/corrected role colors must remain labeled by the existing provenance system.

Keep the core in `lib/` and avoid React imports.

**Verify**: `pnpm exec vitest run lib/color/imagePalette.test.ts --maxWorkers=1` → newly named mode-contract tests pass.

### Step 2: Route UI role derivation through the UI candidate policy

Extend semantic-token inputs only as narrowly as needed to accept the UI-mode candidate selection. Preserve existing behavior for callers that pass ordinary `ExtractedColor[]`. Add regression tests proving a palette can show dominant source colors while choosing distinct, accessible expressive candidates for UI roles.

**Verify**: `pnpm exec vitest run lib/color/imagePalette.test.ts lib/color/semanticTokens.test.ts --maxWorkers=1` → all pass.

### Step 3: Pass the intended mode end-to-end without adding visible controls

Have the controller explicitly request `ui` for the existing workflow instead of relying on defaults. Ensure error/loading behavior remains unchanged. Do not expose the alternate mode until Plan 004.

**Verify**: `pnpm typecheck` → exit 0.

## Done criteria

- [ ] `paint` and `ui` have documented, tested, non-overlapping semantics.
- [ ] Existing workspace explicitly requests the UI path.
- [ ] Role sources remain `extracted`, `derived`, or `corrected` as appropriate.
- [ ] `pnpm verify` exits 0.

## STOP conditions

- Existing paint canvas depends on role palette side effects; stop and document its true contract before separating the result types.
- The change would require a breaking export-schema change; stop and split migration work into a separate plan.

## Maintenance notes

Plan 004 may add UI intent controls but must call this contract rather than mutate sampling parameters. Reviewers should trace every source/derived color label through the selected mode.
