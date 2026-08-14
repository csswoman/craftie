# Plan 002: Publish visually diverse image candidates

> **Executor instructions**: Follow each step and run every verification command. Update `plans/README.md` only after completion.
>
> **Drift check**: `git diff --stat 0fa2409..HEAD -- lib/color/imageExtractor.ts lib/color/colorClustering.ts lib/color/imageTypes.ts lib/color/imageExtractor.test.ts`

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED — candidate order and contents feed UI roles.
- **Depends on**: `plans/001-preserve-reliable-source-pixels.md`
- **Category**: correctness / product direction
- **Planned at**: commit `0fa2409`, 2026-08-14

## Why this matters

K-means currently publishes up to the requested number of centroids, merging only exact output HEX values. A gradient can therefore consume the palette with near-identical tones while a small, high-chroma accent never survives. The extractor needs a second selection stage that rewards visual diversity and meaningful presence without claiming that a rare pixel is dominant.

## Current state

- `lib/color/colorClustering.ts:3-101` runs deterministic CIELAB k-means for exactly up to the requested cluster count.
- `lib/color/imageExtractor.ts:89-117` converts all samples to LAB, clusters them, merges only matching HEX values, and sorts by `prominence`.
- `ExtractedColor` in `lib/color/imageTypes.ts` currently exposes only `{ hex, prominence }`; do not alter its public meaning without updating every consumer.
- `lib/color/imageExtractor.test.ts` already tests prominence ordering, neutral background filtering, medoid publication, and deterministic clustering.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused tests | `pnpm exec vitest run lib/color/imageExtractor.test.ts --maxWorkers=1` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Full verification | `pnpm verify` | exit 0 |

## Scope

**In scope**

- `lib/color/imageExtractor.ts`
- `lib/color/colorClustering.ts` only if clustering must expose metadata required by selection
- `lib/color/imageTypes.ts`
- `lib/color/imageExtractor.test.ts`
- Create `lib/color/imageCandidateSelection.ts` and `lib/color/imageCandidateSelection.test.ts` if a pure selector keeps `imageExtractor.ts` under the 250-line module guideline.

**Out of scope**

- Browser decoding/rasterization (Plan 001).
- Semantic role assignment and UI controls (Plans 003–004).
- Switching CIELAB to OKLab.

## Steps

### Step 1: Define a pure candidate-selection contract

Create a framework-agnostic selector in `lib/color/` that receives clustered colors with their area/prominence and returns no more than the requested `ExtractedColor[]`. It must:

- preserve one highest-prominence representative;
- reject candidates perceptually too close to already selected colors using a named, tested threshold;
- permit a smaller but sufficiently distinct chromatic candidate when it materially increases diversity;
- return deterministic ordering and normalize prominence for the returned set only if downstream code requires it. Do not silently redefine source-area prominence.

Use an explicit score/threshold constants object with comments describing each term. Avoid magic numbers in callers.

**Verify**: `pnpm exec vitest run lib/color/imageCandidateSelection.test.ts --maxWorkers=1` → selector tests pass.

### Step 2: Integrate selector after clustering

Keep sampling and k-means responsible only for finding clusters. Invoke the selector after centroids/medoids are converted to published colors and before the result reaches callers. Preserve `publication: 'centroid' | 'medoid'` semantics.

**Verify**: `pnpm exec vitest run lib/color/imageExtractor.test.ts --maxWorkers=1` → existing tests still pass.

### Step 3: Add regressions for the actual failure modes

Use synthetic rasters only; do not add copyrighted image fixtures. Cover:

- a large multi-shade gradient plus a meaningful contrasting patch returns at least one color from the patch when count permits;
- near-identical shade clusters do not monopolize the returned palette;
- two-color dominant images still order by prominence;
- all output remains deterministic for identical raster and options;
- medoid mode still publishes sampled source pixels only.

**Verify**: `pnpm exec vitest run lib/color/imageExtractor.test.ts lib/color/imageCandidateSelection.test.ts --maxWorkers=1` → all pass.

## Done criteria

- [ ] Candidate diversity has a pure, directly tested module.
- [ ] Existing `ExtractedColor.prominence` retains its documented area meaning.
- [ ] Gradient/accent and near-duplicate regressions pass.
- [ ] `pnpm verify` exits 0.
- [ ] No files outside scope plus `plans/README.md` changed.

## STOP conditions

- The selector cannot distinguish candidate distance from score with the existing cluster data; stop and propose the smallest additional metadata rather than changing all consumers.
- A diversity threshold makes a two-color image return synthetic colors or violates medoid mode; stop and report the case.

## Maintenance notes

Do not turn this selector into role assignment. It publishes source candidates; Plan 003 decides how the UI mode derives roles from them.
