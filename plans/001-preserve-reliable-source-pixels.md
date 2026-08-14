# Plan 001: Preserve reliable source pixels during image extraction

> **Executor instructions**: Follow each step and run its verification. Preserve unrelated worktree changes. Update this plan's status row in `plans/README.md` only when all done criteria pass.
>
> **Drift check**: `git diff --stat 0fa2409..HEAD -- lib/color/imageTypes.ts lib/color/rasterSampling.ts lib/color/rasterSampling.test.ts src/lib/browser/imageExtractor.ts`

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED — changing sampling affects every image-generated palette.
- **Depends on**: none
- **Category**: correctness / tests
- **Planned at**: commit `0fa2409`, 2026-08-14

## Why this matters

The current browser adapter downscales every source to a 256px maximum side with smoothing disabled, then samples pixels uniformly. Small brand accents can disappear during that reduction. Semi-transparent pixels are also treated as fully weighted colors unless alpha is exactly zero, so PNG overlays can produce colors the user does not visually perceive.

## Current state

- `src/lib/browser/imageExtractor.ts` is the browser-only adapter. Lines 10–11 set `MAX_CANVAS_DIMENSION = 256`; lines 47–67 rasterize the image; line 59 sets `context.imageSmoothingEnabled = false`.
- `lib/color/rasterSampling.ts` is pure sampling logic. Lines 15–34 return each non-zero-alpha RGB sample; line 25 only skips `alpha === 0`.
- `lib/color/imageTypes.ts` owns `RasterData`, `RgbSample`, and extraction options.
- Tests follow Vitest table-free, synthetic-raster patterns in `lib/color/rasterSampling.test.ts` and `lib/color/imageExtractor.test.ts`.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused tests | `pnpm exec vitest run lib/color/rasterSampling.test.ts lib/color/imageExtractor.test.ts --maxWorkers=1` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Full verification | `pnpm verify` | exit 0 |

## Scope

**In scope**

- `lib/color/imageTypes.ts`
- `lib/color/rasterSampling.ts`
- `lib/color/rasterSampling.test.ts`
- `lib/color/imageExtractor.test.ts`
- `src/lib/browser/imageExtractor.ts`

**Out of scope**

- Clustering algorithm and palette-role selection.
- Upload file-size/type policy.
- Any UI control or crop interaction (Plan 005).

## Git workflow

- Branch: `codex/001-reliable-source-pixels`.
- Match existing conventional-style messages, e.g. `fix(color): refresh muted text and textSafe when surface or text changes`.
- Do not push, commit, or stage unrelated files unless explicitly instructed.

## Steps

### Step 1: Make alpha handling explicit and testable

Extend the pure raster contract so a sampled pixel carries the alpha information needed to represent its visual weight, or composite semi-transparent source pixels against one documented neutral matte before clustering. Pick one policy and use it consistently:

- transparent pixels must remain excluded;
- a 50% transparent saturated pixel must not contribute identically to an opaque saturated pixel;
- use a documented matte if compositing, with a future extraction option only if the choice must be user-configurable.

Do not let browser-only APIs enter `lib/`.

**Verify**: `pnpm exec vitest run lib/color/rasterSampling.test.ts --maxWorkers=1` → new opaque, transparent, and semi-transparent cases pass.

### Step 2: Rasterize at a representative quality

Replace the unconditional 256px/no-smoothing reduction with a bounded, documented target that preserves small color regions while keeping browser work bounded. Keep the adapter's local-only behavior and `willReadFrequently: true`. When downscaling, use quality-oriented image smoothing; retain original dimensions when already below the bound.

The constant must remain in `src/lib/browser/imageExtractor.ts`, not in pure `lib/`. Add a unit-testable dimension helper export only if necessary; otherwise test the pure behaviors in `lib/` and cover the adapter manually in the PR notes.

**Verify**: `pnpm typecheck` → exit 0.

### Step 3: Guard the contract with synthetic regressions

Add tests proving alpha behavior does not leak invisible colors and that `samplePixels` remains deterministic for a given raster/options. Keep the existing transparent-pixel test, but extend it instead of duplicating it.

**Verify**: `pnpm exec vitest run lib/color/rasterSampling.test.ts lib/color/imageExtractor.test.ts --maxWorkers=1` → all pass.

## Test plan

- Opaque sample is retained unchanged.
- Fully transparent sample is excluded.
- Semi-transparent sample follows the selected documented policy.
- A deterministic raster yields stable ordered samples.

## Done criteria

- [ ] Focused raster/extractor tests pass.
- [ ] `pnpm typecheck` exits 0.
- [ ] `pnpm verify` exits 0.
- [ ] Only in-scope files plus `plans/README.md` are modified.

## STOP conditions

- The browser returns pre-composited pixel values inconsistent with the proposed alpha policy; stop and provide a minimal reproduction before choosing a matte.
- The quality target causes an unacceptable synchronous UI freeze on a 5MB image; report timing and propose worker/off-main-thread extraction rather than increasing limits blindly.

## Maintenance notes

Plan 002 must consume the alpha-aware samples rather than recreating a second sampling path. Reviewers should check that processing remains entirely local and that no browser API enters `lib/`.
