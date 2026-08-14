# Plan 005: Add a crop-based extraction scope

> **Executor instructions**: Read the complete plan before editing. Preserve unrelated changes. Update the plan index only after all gates pass.
>
> **Drift check**: `git diff --stat 0fa2409..HEAD -- src/lib/browser/imageExtractor.ts src/components/color/useSelectColorsWorkspaceController.ts src/components/color/PaletteImageBlock.tsx src/components/color-engine/ImageUploader.tsx lib/color/imageTypes.ts`

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: HIGH — coordinate transforms and mobile interaction are easy to get wrong.
- **Depends on**: `plans/001-preserve-reliable-source-pixels.md`, `plans/004-replace-regeneration-with-palette-intents.md`
- **Category**: direction / UX
- **Planned at**: commit `0fa2409`, 2026-08-14

## Why this matters

No automatic extractor can know whether the user wants a photographed subject, its background, or a logo in the corner. A crop is the clearest, most trustworthy way to let them define the image region that supplies palette colors. It should alter only extraction scope, not upload/persistence behavior.

## Current state

- `src/lib/browser/imageExtractor.ts:47-67` rasterizes the entire natural image into a scaled canvas.
- `src/components/color/useSelectColorsWorkspaceController.ts:130-141` owns preview URL/file state, and `144-198` runs extraction.
- `PaletteImageBlock.tsx` has a tiny source preview and only regenerate/change actions; `ImageUploader.tsx` owns the larger upload surface.
- `RasterData` in `lib/color/imageTypes.ts` stores width, height, and RGBA data, so crop coordinates must be resolved before pure sampling or applied as a pure raster-bound operation.

## Commands you will need

| Purpose | Command | Expected result |
|---|---|---|
| Focused tests | `pnpm exec vitest run lib/color/rasterSampling.test.ts lib/color/imageExtractor.test.ts --maxWorkers=1` | exit 0 |
| Component size | `pnpm check:component-size` | exit 0 |
| Types | `pnpm typecheck` | exit 0 |
| Full verification | `pnpm verify` | exit 0 |

## Scope

**In scope**

- `lib/color/imageTypes.ts`
- Create `lib/color/rasterCrop.ts` and `lib/color/rasterCrop.test.ts` for pure crop normalization/application
- `src/lib/browser/imageExtractor.ts`
- `src/components/color/useSelectColorsWorkspaceController.ts`
- Create focused crop UI component(s) under `src/components/color/`, each under 250 lines
- The existing image upload/preview component that hosts the entry point

**Out of scope**

- Server upload, persistence, and account storage.
- Freeform image editing, filters, or AI subject detection.
- Altering extraction intent policy from Plan 004.

## Steps

### Step 1: Define a normalized crop contract in pure code

Add a serializable crop shape using normalized coordinates `[0, 1]` with strict validation: finite values, clamped bounds, non-zero width and height, and deterministic behavior for out-of-range input. Implement pure raster cropping or sampling bounds in `lib/color/rasterCrop.ts`; it must be framework-agnostic and independently tested.

**Verify**: `pnpm exec vitest run lib/color/rasterCrop.test.ts --maxWorkers=1` → edge, clamp, and exact-region cases pass.

### Step 2: Apply crop before extraction

Extend the browser extraction request to rasterize/sample only the chosen crop, while calculating the crop against the original image aspect ratio correctly. A missing crop must preserve current whole-image behavior exactly. Keep processing local and enforce the Plan 001 quality bound after crop resolution.

**Verify**: `pnpm exec vitest run lib/color/rasterSampling.test.ts lib/color/imageExtractor.test.ts lib/color/rasterCrop.test.ts --maxWorkers=1` → all pass.

### Step 3: Add an accessible crop interaction

Add an explicit “Elegir zona” entry point near the image source. Build a bounded overlay with visible crop rectangle, reset/apply controls, keyboard-accessible handles or equivalent numeric fallback, and a usable touch interaction below the repository's 1024px desktop breakpoint. The preview must explain that only the selected zone changes extraction; it must not mutate the original file.

Keep components below 250 lines by separating crop geometry/controller from presentation. Follow existing semantic tokens and the repository’s 44px control convention.

**Verify**: `pnpm check:component-size && pnpm lint && pnpm typecheck` → all exit 0; manually verify mouse, touch, keyboard, and reset in browser.

### Step 4: Integrate crop with chosen intent and reset behavior

Store the selected normalized crop in the workspace controller. Applying a crop reruns the currently selected deterministic intent; changing the source image resets the crop. Surface an accessible indication when crop is active. Do not persist it beyond the current browser session unless the repository already has a scoped workspace persistence decision.

**Verify**: `pnpm verify` → exit 0.

## Done criteria

- [ ] Pure crop math has tested clamping, bounds, and non-zero-region behavior.
- [ ] No-crop extraction remains byte-for-byte behaviorally equivalent for synthetic rasters.
- [ ] Crop applies to current image plus selected intent deterministically.
- [ ] Crop resets on image replacement and is visible when active.
- [ ] `pnpm verify` exits 0 and components are under 250 lines.

## STOP conditions

- Correct crop mapping requires EXIF-orientation handling absent from the current decoder; stop and propose an orientation-normalization subplan.
- A fully keyboard-operable visual crop cannot be delivered without an accessible numeric fallback; stop rather than shipping pointer-only interaction.
- The interaction requires changing the responsive workspace structure or mobile toolbar contract; stop and submit the smallest layout proposal first.

## Maintenance notes

Crop state is an input to extraction, not an image edit. Any future saved project format must version this normalized crop explicitly. Reviewers should test source-image replacement, reset, narrow screens, and images with extreme aspect ratios.
