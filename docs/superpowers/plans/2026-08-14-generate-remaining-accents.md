# Generate remaining accents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a section CTA in Acentos that instantly fills empty accent slots with CVD-safe, hue-spread colors (partial fill allowed; silent UI update).

**Architecture:** Pure fill logic lives in `lib/color/uiColorCandidates.ts` as `fillRemainingAccentGaps`. It walks gapped `data-*` tokens in order, pools `buildDataCandidates` plus synthetic primary hue-offset variants, keeps only `fitness.asData.ok`, and returns `{ token, hex }[]`. `UiDataSection` shows a secondary Sparkles button above the deuteranopia warning and applies results via existing `onReplace`.

**Tech Stack:** TypeScript, Vitest, culori/OKLCH via existing color helpers, React + lucide-react `Sparkles` in `UiDataSection`.

**Spec:** `docs/superpowers/specs/2026-08-14-generate-remaining-accents-design.md`

## Global Constraints

- CTA copy: `Generar el 1 restante` when `gaps.length === 1`; `Generar los {N} restantes` when `N >= 2`.
- Apply on click — no modal, toast, or result banner.
- Partial fill only: skip slots with no CVD-safe candidate; leave them empty.
- Do not regenerate or overwrite already-assigned accents.
- Do not remove or replace `autoFillDataGaps`; the CTA uses `fillRemainingAccentGaps`.
- Do not add per-card `Generar` next to `Elegir`.
- Business logic in `/lib`; components `< 250` lines.
- Button: secondary style, Sparkles icon, placed **above** the deuteranopia warning.

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/color/uiColorCandidates.ts` | Add `fillRemainingAccentGaps` + private synthetic hue-spread helper |
| `lib/color/uiColorCandidates.test.ts` | Unit tests: CVD cluster, partial, empty, occupied untouched |
| `src/components/color/UiDataSection.tsx` | Secondary CTA + apply handler + active-slot advance |

**Unchanged:** `DataSeriesRow`, `autoFillDataGaps` public API, deuteranopia warning copy.

---

### Task 1: `fillRemainingAccentGaps` (lib)

**Files:**
- Modify: `lib/color/uiColorCandidates.ts`
- Modify: `lib/color/uiColorCandidates.test.ts`

**Interfaces:**
- Consumes: `buildDataCandidates`, `DATA_TOKEN_NAMES` (already imported), `normalizeHex`, `evaluateColorFitness` / existing candidate scoring patterns, `deriveFromPrimary` offsets (`DATA_DERIVE_HUE_OFFSETS`), `oklchChannelsToHex`, `nameForHex`, `converter('oklch')`
- Produces: `fillRemainingAccentGaps(tokens: SemanticTokens, colors: SelectableColor[]): Array<{ token: SemanticTokenName; hex: string }>`

- [ ] **Step 1: Write the failing tests**

Append to `lib/color/uiColorCandidates.test.ts` (add `fillRemainingAccentGaps` to the existing import from `./uiColorCandidates`, and import `remainsDistinctWithColorVisionDeficiency` from `./colorVision`, `normalizeHex` from `./normalizeHex`):

```ts
describe('fillRemainingAccentGaps', () => {
  function cyanClusterTokens() {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#0E7490', prominence: 0.6 },
        { hex: '#0369A1', prominence: 0.4 },
      ],
      paletteType: 'vivid',
    });
    return {
      ...tokens,
      primary: { hex: '#0E7490', source: 'extracted' as const },
      'data-1': { hex: '#0E7490', source: 'extracted' as const },
      'data-2': { hex: '#0369A1', source: 'extracted' as const },
      'data-3': { hex: '#0284C7', source: 'derived' as const },
      'data-4': { hex: '#0284C7', source: 'derived' as const },
      'data-5': { hex: '#0284C7', source: 'derived' as const, gap: 'pending' },
      'data-6': { hex: '#0284C7', source: 'derived' as const, gap: 'pending' },
    };
  }

  const cyanSources: SelectableColor[] = [
    { id: 'cyan', name: 'Cyan', hex: '#0E7490', group: 'bold' },
    { id: 'blue', name: 'Blue', hex: '#0369A1', group: 'bold' },
    { id: 'sky', name: 'Sky', hex: '#0284C7', group: 'bold' },
  ];

  it('fills remaining gaps with colors that stay CVD-distinct from occupied accents', () => {
    const tokens = cyanClusterTokens();
    const filled = fillRemainingAccentGaps(tokens, cyanSources);
    expect(filled.length).toBeGreaterThan(0);

    const occupied = ['data-1', 'data-2', 'data-3', 'data-4']
      .map((name) => normalizeHex(tokens[name as 'data-1'].hex));

    for (const entry of filled) {
      expect(entry.token === 'data-5' || entry.token === 'data-6').toBe(true);
      for (const hex of occupied) {
        expect(remainsDistinctWithColorVisionDeficiency(entry.hex, hex)).toBe(true);
      }
    }

    if (filled.length === 2) {
      expect(remainsDistinctWithColorVisionDeficiency(filled[0]!.hex, filled[1]!.hex)).toBe(true);
    }
  });

  it('does not overwrite already-assigned data tokens', () => {
    const tokens = cyanClusterTokens();
    const before = {
      d1: tokens['data-1'].hex,
      d2: tokens['data-2'].hex,
      d3: tokens['data-3'].hex,
      d4: tokens['data-4'].hex,
    };
    fillRemainingAccentGaps(tokens, cyanSources);
    expect(tokens['data-1'].hex).toBe(before.d1);
    expect(tokens['data-2'].hex).toBe(before.d2);
    expect(tokens['data-3'].hex).toBe(before.d3);
    expect(tokens['data-4'].hex).toBe(before.d4);
    expect(tokens['data-5'].gap).toBeTruthy();
    expect(tokens['data-6'].gap).toBeTruthy();
  });

  it('returns only the slots that found a safe candidate (partial fill)', () => {
    const base = tokensWithGaps();
    const tokens = {
      ...base,
      primary: { ...base.primary, gap: 'pending' as const },
      secondary: { ...base.secondary, gap: 'pending' as const },
      accent: { ...base.accent, gap: 'pending' as const },
      'data-1': { hex: '#111111', source: 'override' as const },
      'data-2': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
      'data-3': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
      'data-4': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
      'data-5': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
      'data-6': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
    };
    const filled = fillRemainingAccentGaps(tokens, [
      { id: 'soft-gray', name: 'Soft gray', hex: '#B8B8B8', group: 'light-neutral' },
    ]);
    // With no chromatic primary and only a weak gray source, expect empty or strict subset —
    // never more entries than gapped tokens, and never a non-data token.
    expect(filled.every((entry) => entry.token.startsWith('data-'))).toBe(true);
    expect(filled.length).toBeLessThanOrEqual(5);
  });

  it('returns an empty array when no candidate is fit for data', () => {
    const base = tokensWithGaps();
    const tokens = {
      ...base,
      primary: { ...base.primary, gap: 'pending' as const },
      secondary: { ...base.secondary, gap: 'pending' as const },
      accent: { ...base.accent, gap: 'pending' as const },
      'data-1': { hex: '#111111', source: 'override' as const },
      'data-2': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
      'data-3': { hex: '#111111', source: 'derived' as const, gap: 'pending' },
    };
    const filled = fillRemainingAccentGaps(tokens, [
      { id: 'soft-gray', name: 'Soft gray', hex: '#B8B8B8', group: 'light-neutral' },
    ]);
    expect(filled).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/color/uiColorCandidates.test.ts -t fillRemainingAccentGaps`

Expected: FAIL — `fillRemainingAccentGaps` is not exported / not defined.

- [ ] **Step 3: Implement `fillRemainingAccentGaps`**

In `lib/color/uiColorCandidates.ts`, after `autoFillDataGaps`, add:

```ts
/** Hue offsets used to escape a clustered source family when auto-filling gaps. */
const FILL_GAP_HUE_OFFSETS = DATA_DERIVE_HUE_OFFSETS;

function buildHueSpreadSynthetics(
  tokens: SemanticTokens,
  selected: SemanticTokenName,
): UiColorCandidate[] {
  if (tokens.primary.gap) return [];
  const primary = toOklch(tokens.primary.hex);
  if (!primary || typeof primary.h !== 'number') return [];

  const occupied = occupiedSeries(tokens, selected);
  const occupiedHexes = new Set(occupied.map((series) => normalizeHex(series.hex)));
  const baseLightness = primary.l ?? 0.5;
  const chroma = Math.max(0.055, primary.c ?? 0.08);
  const baseHue = primary.h;
  const out: UiColorCandidate[] = [];
  const seen = new Set<string>();

  for (const lightnessDelta of [0.18, 0.28, 0.12]) {
    for (const offset of FILL_GAP_HUE_OFFSETS) {
      const lightness = baseLightness >= 0.5
        ? Math.max(0.12, baseLightness - lightnessDelta)
        : Math.min(0.9, baseLightness + lightnessDelta);
      const hex = normalizeHex(oklchChannelsToHex(lightness, chroma, (baseHue + offset + 360) % 360));
      if (seen.has(hex) || occupiedHexes.has(hex)) continue;
      seen.add(hex);
      const fitness = candidateFitness(hex, tokens, occupied.map((series) => series.hex));
      const channels = toOklch(hex);
      const separation = dataSeparation(hex, occupied);
      out.push({
        id: `synthetic-hue-${offset}-${lightnessDelta}`,
        hex,
        name: nameForHex(hex, [{ hex: tokens.primary.hex }, { hex }]),
        detail: `hue +${offset}° · L Δ${lightnessDelta}`,
        origin: 'synthetic',
        fitness,
        dataProfile: buildDataSeriesProfile({
          fitness,
          origin: 'synthetic',
          hue: channels?.h ?? 0,
          separation,
        }),
        dataSeparation: separation,
        score: contrastRatio(hex, tokens.background.hex) + (channels?.c ?? 0),
      });
    }
  }

  return out;
}

export function fillRemainingAccentGaps(
  tokens: SemanticTokens,
  colors: SelectableColor[],
): Array<{ token: SemanticTokenName; hex: string }> {
  const working: SemanticTokens = { ...tokens };
  const result: Array<{ token: SemanticTokenName; hex: string }> = [];

  for (const tokenName of DATA_TOKEN_NAMES) {
    if (!working[tokenName].gap) continue;

    const pool = [
      ...buildDataCandidates(working, colors, tokenName),
      ...buildHueSpreadSynthetics(working, tokenName),
    ];

    const byHex = new Map<string, UiColorCandidate>();
    for (const candidate of pool) {
      const key = normalizeHex(candidate.hex);
      const previous = byHex.get(key);
      if (!previous || candidate.score > previous.score) byHex.set(key, candidate);
    }

    const winner = [...byHex.values()]
      .filter((candidate) => candidate.fitness.asData.ok)
      .sort((left, right) => right.score - left.score)[0];

    if (!winner) continue;

    result.push({ token: tokenName, hex: winner.hex });
    working[tokenName] = { hex: winner.hex, source: 'override' };
  }

  return result;
}
```

Notes for the implementer:
- `DATA_DERIVE_HUE_OFFSETS` is already declared later in the same file — either move that `const` above these helpers, or duplicate the offset array as a local constant `FILL_GAP_HUE_OFFSETS = [34, 86, 138, 190, 242, 294] as const` to avoid temporal-dead-zone issues.
- Reuse existing private helpers (`occupiedSeries`, `dataSeparation`, `candidateFitness`); do not change `autoFillDataGaps`.
- Input `tokens` must not be mutated (spread into `working` only).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/color/uiColorCandidates.test.ts -t fillRemainingAccentGaps`

Expected: PASS.

If the “empty array” case still fills via synthetics from a non-gapped primary in `tokensWithGaps()`, adjust the fixture so `primary` is gapped **and** sources stay gray-only (as written). If synthetics still appear from residual role hexes inside `buildDataCandidates`, keep asserting `[]` by also gap-ing secondary/accent (already in fixture). Tighten the fixture rather than weakening the CVD filter.

- [ ] **Step 5: Commit**

```bash
git add lib/color/uiColorCandidates.ts lib/color/uiColorCandidates.test.ts
git commit -m "feat(color): fill remaining accent gaps with CVD-safe hues"
```

---

### Task 2: Section CTA in `UiDataSection`

**Files:**
- Modify: `src/components/color/UiDataSection.tsx`

**Interfaces:**
- Consumes: `fillRemainingAccentGaps(tokens, colors): Array<{ token: SemanticTokenName; hex: string }>` from Task 1; `firstEmptySlot`, `DATA_TOKEN_NAMES`, existing `onReplace`
- Produces: secondary button UI; no new exports

- [ ] **Step 1: Wire imports and handler**

Update imports at the top of `UiDataSection.tsx`:

```ts
import { Sparkles } from 'lucide-react';
// merge with existing lucide import: Info, TriangleAlert, X, Sparkles

import {
  buildDataCandidates,
  fillRemainingAccentGaps,
  type UiColorCandidate,
} from '@lib/color/uiColorCandidates';
```

Add handler inside the component (after `deriveActiveFromPrimary`):

```ts
function fillRemainingGaps() {
  const filled = fillRemainingAccentGaps(tokens, colors);
  if (filled.length === 0) return;

  const nextSlots = [...seriesState.slots];
  for (const entry of filled) {
    const index = DATA_TOKEN_NAMES.indexOf(entry.token as (typeof DATA_TOKEN_NAMES)[number]);
    if (index === -1) continue;
    onReplace(entry.token, entry.hex);
    nextSlots[index] = entry.hex;
  }

  const nextEmpty = firstEmptySlot(nextSlots);
  if (nextEmpty !== -1) setActiveSlot(nextEmpty);
}
```

- [ ] **Step 2: Render the secondary button above the warning**

Inside the `<div className="mt-3 space-y-3">` block, **before** the deuteranopia warning conditional, insert:

```tsx
{gaps.length > 0 ? (
  <button
    type="button"
    onClick={fillRemainingGaps}
    className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-bg px-3 text-[0.88rem] font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
  >
    <Sparkles aria-hidden="true" className="size-3.5" strokeWidth={1.75} />
    {gaps.length === 1
      ? 'Generar el 1 restante'
      : `Generar los ${gaps.length} restantes`}
  </button>
) : null}
```

Keep the existing warning block immediately below (unchanged copy / dismiss behavior).

Confirm `UiDataSection.tsx` stays under 250 lines after the edit.

- [ ] **Step 3: Typecheck**

Run: `pnpm typecheck`

Expected: PASS (no new errors in touched files).

- [ ] **Step 4: Smoke check (manual)**

In the app: open Colores → Acentos with at least one empty slot.
1. Button label matches gap count.
2. Click fills safe slots immediately; counter/swatches update; no toast.
3. If all gaps fill, button and warning disappear on next render.
4. Manual `Elegir` / Derivar del primario still work.

- [ ] **Step 5: Commit**

```bash
git add src/components/color/UiDataSection.tsx
git commit -m "feat(color): add generate-remaining accents CTA"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
| --- | --- |
| Section CTA with dynamic N copy | Task 2 |
| Apply instantly / silent feedback | Task 2 |
| Hue-spread + CVD gate | Task 1 |
| Partial fill | Task 1 |
| Button above deuteranopia warning | Task 2 |
| No per-card Generar / modal / toast | Honored (not in plan) |
| Keep `autoFillDataGaps` | Task 1 leaves it alone |
| Unit tests for cluster / partial / empty / occupied | Task 1 |

## Placeholder scan

No TBD / “implement later” / vague validation steps remain after the concrete code blocks above.
