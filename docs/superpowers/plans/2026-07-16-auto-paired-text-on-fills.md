# Auto-paired text on fill colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the user selects or adjusts a fill token (`primary`, `secondary`, `accent`, `hero-surface`, tonal carriers, etc.), Craftie automatically re-derives its `on-*` text token so preview, layout, and AA checks always reflect the correct light/dark text on that fill.

**Architecture:** Pure pairing logic lives in `/lib/color` (`deriveOnTokenHexForFill`, `getPairedOnTokenForFill`). `previewSemanticToken` patches fill + paired `on-*` together for local editor contrast. `RolePaletteContext` clears stale `on-*` overrides whenever a fill override changes (preview or apply) so `deriveSemanticTokens` recomputes derived pairs. UI only consumes the updated tokens — no manual `on-*` management.

**Tech Stack:** TypeScript, React (`'use client'`), Vitest, culori/OKLCH helpers in `@lib/utils/colorMath`.

**Spec:** `docs/superpowers/specs/2026-07-16-auto-paired-text-on-fills-design.md`

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/color/semanticTokenTargets.ts` | Export `getPairedOnTokenForFill` (uses existing `READABLE_PAIRS`) |
| `lib/color/pairedOnToken.ts` | `deriveOnTokenHexForFill` — shared derivation used by preview + tests |
| `lib/color/pairedOnToken.test.ts` | Unit tests for light/dark fill → on hex |
| `lib/color/semanticTokenPreview.ts` | Patch fill **and** paired `on-*` in preview tokens |
| `lib/color/semanticTokenPreview.test.ts` | Extend tests for paired re-derivation |
| `src/context/RolePaletteContext.tsx` | Clear stale `on-*` override on fill preview/apply; delegate `replaceRole` → `replaceSemanticToken` |
| `src/components/color/InlineTokenDerivationEditor.tsx` | No logic change if preview tokens are correct; optional simplification to use `previewSemanticTokens` from context |
| `lib/color/semanticTokens.ts` | Optional thin refactor: `derivedPair` calls `deriveOnTokenHexForFill` (DRY, not required for behavior) |

**Unchanged:** Layout preview components (`LandingLayoutPreview`, etc.) — they already read `previewSemanticTokens` via `resolveLayoutColors` when `setTokenEditPreview` is active.

**Commit policy:** Do **not** create git commits unless the user explicitly asks.

---

### Task 1: `deriveOnTokenHexForFill` (TDD)

**Files:**
- Create: `lib/color/pairedOnToken.ts`
- Create: `lib/color/pairedOnToken.test.ts`

- [x] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { deriveOnTokenHexForFill } from './pairedOnToken';

describe('deriveOnTokenHexForFill', () => {
  it('returns dark text for a light fill', () => {
    const fill = '#61C7CD';
    const on = deriveOnTokenHexForFill(fill);

    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(4.5);
    expect(on.toUpperCase()).not.toBe('#FFFFFF');
  });

  it('returns light text for a dark fill', () => {
    const fill = '#1C4B8E';
    const on = deriveOnTokenHexForFill(fill);

    expect(contrastRatio(on, fill)).toBeGreaterThanOrEqual(4.5);
    expect(on.toUpperCase()).not.toBe('#111111');
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/color/pairedOnToken.test.ts`
Expected: FAIL — module `./pairedOnToken` not found

- [x] **Step 3: Write minimal implementation**

```ts
import { adjustLightnessForContrast, contrastRatio } from '../utils/colorMath';
import { deriveForegroundForBackground } from './pairedForeground';

const AA_RATIO = 4.5;

export function deriveOnTokenHexForFill(fillHex: string): string {
  const foreground = deriveForegroundForBackground(fillHex, AA_RATIO).hex;

  return contrastRatio(foreground, fillHex) >= AA_RATIO
    ? foreground
    : adjustLightnessForContrast(foreground, fillHex, AA_RATIO);
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run lib/color/pairedOnToken.test.ts`
Expected: PASS (2 tests)

---

### Task 2: `getPairedOnTokenForFill`

**Files:**
- Modify: `lib/color/semanticTokenTargets.ts`

- [x] **Step 1: Export the helper**

Add after `READABLE_PAIRS`:

```ts
export function getPairedOnTokenForFill(
  fillToken: SemanticTokenName,
): SemanticTokenName | null {
  const paired = READABLE_PAIRS[fillToken];

  if (!paired?.startsWith('on-')) {
    return null;
  }

  return paired;
}
```

- [x] **Step 2: Add unit test**

Create `lib/color/semanticTokenTargets.test.ts` (or extend if it exists):

```ts
import { describe, expect, it } from 'vitest';

import { getPairedOnTokenForFill } from './semanticTokenTargets';

describe('getPairedOnTokenForFill', () => {
  it('maps expressive fills to on tokens', () => {
    expect(getPairedOnTokenForFill('secondary')).toBe('on-secondary');
    expect(getPairedOnTokenForFill('primary-500')).toBe('on-primary-500');
  });

  it('returns null for tokens without an on pair', () => {
    expect(getPairedOnTokenForFill('border')).toBeNull();
    expect(getPairedOnTokenForFill('on-primary')).toBeNull();
  });
});
```

- [x] **Step 3: Run tests**

Run: `pnpm vitest run lib/color/semanticTokenTargets.test.ts`
Expected: PASS

---

### Task 3: `previewSemanticToken` re-derives paired `on-*` (TDD)

**Files:**
- Modify: `lib/color/semanticTokenPreview.ts`
- Modify: `lib/color/semanticTokenPreview.test.ts`

- [x] **Step 1: Write the failing test**

Append to `semanticTokenPreview.test.ts`:

```ts
import { contrastRatio } from '../utils/colorMath';

it('re-derives on-secondary when secondary fill is previewed lighter', () => {
  const tokens = {
    primary: { hex: '#2563EB', source: 'derived' as const },
    secondary: { hex: '#1C4B8E', source: 'derived' as const },
    'on-secondary': { hex: '#E8F1FF', source: 'derived' as const },
  } as SemanticTokens;

  const preview = previewSemanticToken(tokens, 'secondary', '#61C7CD');

  expect(preview.secondary.hex).toBe('#61C7CD');
  expect(preview['on-secondary'].hex).not.toBe('#E8F1FF');
  expect(contrastRatio(preview['on-secondary'].hex, preview.secondary.hex)).toBeGreaterThanOrEqual(4.5);
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run lib/color/semanticTokenPreview.test.ts`
Expected: FAIL — `on-secondary` stays `#E8F1FF`, contrast < 4.5

- [x] **Step 3: Implement paired preview**

```ts
import { deriveOnTokenHexForFill } from './pairedOnToken';
import { getPairedOnTokenForFill } from './semanticTokenTargets';

export function previewSemanticToken(
  tokens: SemanticTokens,
  tokenName: SemanticTokenName,
  hex: string,
): SemanticTokens {
  const normalized = normalizeHex(hex);
  const next: SemanticTokens = {
    ...tokens,
    [tokenName]: {
      ...tokens[tokenName],
      hex: normalized,
    },
  };

  const pairedOn = getPairedOnTokenForFill(tokenName);

  if (!pairedOn) {
    return next;
  }

  return {
    ...next,
    [pairedOn]: {
      ...tokens[pairedOn],
      hex: deriveOnTokenHexForFill(normalized),
      source: 'derived',
    },
  };
}
```

- [x] **Step 4: Run tests**

Run: `pnpm vitest run lib/color/semanticTokenPreview.test.ts`
Expected: PASS

---

### Task 4: Clear stale `on-*` overrides in `RolePaletteContext`

**Files:**
- Modify: `src/context/RolePaletteContext.tsx`

**Why:** If `tokenOverrides` contains an old `on-secondary` (manual edit or stale state), `deriveSemanticTokens` keeps it via `applyOverride` even when `secondary` changes. Clearing the paired `on-*` forces re-derivation on preview and apply.

- [x] **Step 1: Add import**

```ts
import { getPairedOnTokenForFill } from '@lib/color/semanticTokenTargets';
```

- [x] **Step 2: Update `previewTokenOverrides` memo**

```ts
const previewTokenOverrides = useMemo<SemanticTokenOverrides>(() => {
  if (!tokenEditPreview || tokenEditPreview.kind !== 'token') {
    return tokenOverrides;
  }

  const fillToken = tokenEditPreview.tokenName;
  const pairedOn = getPairedOnTokenForFill(fillToken);
  const next: SemanticTokenOverrides = {
    ...tokenOverrides,
    [fillToken]: normalizeHex(tokenEditPreview.hex),
  };

  if (pairedOn) {
    delete next[pairedOn];
  }

  return next;
}, [tokenEditPreview, tokenOverrides]);
```

- [x] **Step 3: Update `replaceSemanticToken`**

```ts
const replaceSemanticToken = useCallback((tokenName: SemanticTokenName, hex: string) => {
  const normalized = normalizeHex(hex);
  const pairedOn = getPairedOnTokenForFill(tokenName);

  setTokenOverrides((current) => {
    const next: SemanticTokenOverrides = {
      ...current,
      [tokenName]: normalized,
    };

    if (pairedOn) {
      delete next[pairedOn];
    }

    return next;
  });
  setClearedSemanticTokens((current) => current.filter((name) => name !== tokenName));
  setTokenEditPreviewState(null);
}, []);
```

- [x] **Step 4: Delegate `replaceRole` to `replaceSemanticToken`**

Replace the body of `replaceRole` so it calls `replaceSemanticToken(tokenNameForPaletteRole(role), hex)` instead of duplicating override logic. This keeps fill → on clearing consistent for palette-role edits.

- [x] **Step 5: Manual smoke test**

1. Open Select Colors, expand Secundario.
2. Pick a light candidate from image (e.g. teal `#61C7CD`).
3. Confirm layout secondary button shows **dark** text (not light-on-light).
4. Confirm contrast badge in editor shows ≥ 4.5:1 without “Aplicar de todos modos”.
5. Apply → reload panel state → `on-secondary` still pairs correctly.

---

### Task 5: Verify `InlineTokenDerivationEditor` contrast uses paired preview

**Files:**
- Modify: `src/components/color/InlineTokenDerivationEditor.tsx` (only if Task 3–4 insufficient)

- [x] **Step 1: Confirm editor path**

`InlineTokenDerivationEditor` already calls `previewSemanticToken(semanticTokens, tokenName, draftHex)` for contrast. After Task 3, this should pass AA for the teal scenario without UI changes.

- [x] **Step 2: Optional hardening — use context preview tokens**

If smoke test still shows stale contrast, switch contrast source to:

```ts
const { semanticTokens, previewSemanticTokens } = useRolePalette();

const previewTokens = useMemo(() => {
  if (previewSemanticTokens && normalizeHex(draftHex) === normalizeHex(previewSemanticTokens[tokenName].hex)) {
    return previewSemanticTokens;
  }

  return semanticTokens
    ? previewSemanticToken(semanticTokens, tokenName, draftHex)
    : null;
}, [draftHex, previewSemanticTokens, semanticTokens, tokenName]);
```

Only add this if Task 3 alone does not fix the badge.

---

### Task 6: Regression tests for expressive tokens

**Files:**
- Modify: `lib/color/semanticTokens.test.ts` (or add focused test file)

- [x] **Step 1: Add override test**

```ts
it('re-derives on-secondary when only secondary is overridden', () => {
  const extracted = [{ hex: '#1C4B8E', prominence: 1 }];
  const base = deriveSemanticTokens({ extracted, theme: 'light' });
  const overridden = deriveSemanticTokens({
    extracted,
    theme: 'light',
    overrides: { secondary: '#61C7CD' },
  });

  expect(overridden.secondary.hex).toBe('#61C7CD');
  expect(contrastRatio(overridden['on-secondary'].hex, overridden.secondary.hex)).toBeGreaterThanOrEqual(4.5);
  expect(overridden['on-secondary'].hex).not.toBe(base['on-secondary'].hex);
});
```

- [x] **Step 2: Add stale on override test**

```ts
it('ignores stale on-secondary override when secondary override changes', () => {
  const extracted = [{ hex: '#1C4B8E', prominence: 1 }];
  const staleOn = deriveSemanticTokens({ extracted, theme: 'light' })['on-secondary'].hex;
  const tokens = deriveSemanticTokens({
    extracted,
    theme: 'light',
    overrides: {
      secondary: '#61C7CD',
      'on-secondary': staleOn,
    },
  });

  expect(contrastRatio(tokens['on-secondary'].hex, tokens.secondary.hex)).toBeGreaterThanOrEqual(4.5);
});
```

Document in a code comment near `replaceSemanticToken`: production code **deletes** stale `on-*` overrides; this test documents why that deletion matters.

- [x] **Step 3: Run full color lib tests**

Run: `pnpm vitest run lib/color`
Expected: PASS

---

### Task 7: Optional DRY refactor in `semanticTokens.ts`

**Files:**
- Modify: `lib/color/semanticTokens.ts`

- [x] **Step 1: Replace `derivedPair` body**

```ts
import { deriveOnTokenHexForFill } from './pairedOnToken';

function derivedPair(background: SemanticToken): SemanticToken {
  return token(deriveOnTokenHexForFill(background.hex), 'derived');
}
```

- [x] **Step 2: Run tests**

Run: `pnpm vitest run lib/color/semanticTokens.test.ts`
Expected: PASS — behavior unchanged

---

## Spec coverage checklist

| Spec requirement | Task |
| --- | --- |
| Re-derive `on-*` on fill change | 1, 3, 4 |
| Preview + layout use new pair | 3, 4, 5 |
| AA reflects recalculated pair | 3, 5 |
| Confirm only when derived pair fails AA | 5 (smoke) |
| All fill tokens (primary, secondary, accent, hero, tonal) | 2, 3, 6 |
| Persist derived `on-*` on apply | 4 |
| Discard manual `on-*` override when fill changes | 4, 6 |
| No fitness/education panel | — (explicit non-goal) |

## Self-review notes

- No placeholders or TBD steps.
- `getPairedOnTokenForFill` uses `paired.startsWith('on-')` so `on-surface-muted → surface` is excluded (foreground token, not a fill).
- `replaceRole` delegation prevents divergent override paths.
- Layout components unchanged — they already consume `previewSemanticTokens`.
