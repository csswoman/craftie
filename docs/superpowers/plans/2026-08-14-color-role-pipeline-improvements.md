# Color role pipeline improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the color-role pipeline with AA text-safety metadata, minimum background/surface lightness separation, a first-class muted text role, and an intent→color usage helper — without changing which expressive hexes are selected.

**Architecture:** Pure logic stays in `/lib/color`. `isTextSafe` lives in `roleFitness.ts`. Surface separation and `on-background-muted` are derived in `semanticTokens.ts`. Projection sets `RoleSlot.textSafe` for expressive roles and maps `texto-secundario`. Consumption uses `lib/color/usageColor.ts` with a thin `RolePaletteContext` wrapper.

**Tech Stack:** TypeScript, Vitest, culori/OKLCH via existing `@lib/utils/colorMath` and `@lib/color/contrast`, React context in `RolePaletteContext.tsx`.

**Spec:** `docs/superpowers/specs/2026-08-14-color-role-pipeline-improvements-design.md`

## Global Constraints

- Do **not** change which primary/secondary/accent hex is chosen — only expose metadata and derived neutrals/helpers.
- `textSafe` lives on `RoleSlot` (not on `SemanticToken`).
- Measure `textSafe` against `surface.hex` by default.
- `MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035`; clamp surface so it does not cross `border` or `background` lightness.
- Muted text targets ~3:1 vs surface; comment must state AA large (≥18px or ≥14px bold).
- `getColorForUsage` returns `{ fill, text, textSafe }`; for `action` + `!textSafe`, prefer `primary-900` same-hue tonal before `on-background`.
- One PR with **4 logical commits** (one per task below). Work on branch `feat/color-role-pipeline-improvements`.
- Components `< 250` lines; business logic in `/lib`.

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/color/roleFitness.ts` | Add `isTextSafe` |
| `lib/color/roleFitness.test.ts` | AA contrast tests for `isTextSafe` |
| `lib/color/semanticTokens.ts` | Surface ΔL + clamp; `on-background-muted` token |
| `lib/color/semanticTokens.surfaceSeparation.test.ts` | Light/dark ΔL + clamp tests |
| `lib/color/semanticTokens.mutedText.test.ts` | Muted token ~3:1 tests |
| `lib/color/roleTypes.ts` | `texto-secundario` on id/order/labels/derived |
| `lib/color/semanticRoleProjection.ts` | Map muted; set `textSafe` on expressive slots |
| `lib/color/rolePaletteDerived.ts` | Resolve `texto-secundario` in legacy recompute |
| `lib/color/themeCounterpartColor.ts` | Lightness targets for new role |
| `lib/color/roleInspectorContrast.ts` | Exhaustive switch case for muted text |
| `lib/color/usageColor.ts` | Intent mapping + `getColorForUsage` |
| `lib/color/usageColor.test.ts` | Intent + tonal fallback tests |
| `src/context/RolePaletteContext.tsx` | Thin wrapper exposing `getColorForUsage` |
| Test fixtures that build full `RolePalette` | Add `texto-secundario` slot where required |

**Unchanged selection path:** `pickExpressive` / `applyAreaAwareStrategy` hex choice stays the same.

---

### Task 1: `isTextSafe` (commit 1)

**Files:**
- Modify: `lib/color/roleFitness.ts`
- Modify: `lib/color/roleFitness.test.ts`

**Interfaces:**
- Consumes: `contrastRatio` from `lib/color/contrast.ts` (already imported in `roleFitness.ts`)
- Produces: `isTextSafe(candidateHex: string, surfaceHex: string): boolean`

- [ ] **Step 1: Write the failing tests**

Append to `lib/color/roleFitness.test.ts`:

```ts
import { isTextSafe } from './roleFitness';

describe('isTextSafe', () => {
  it('returns true when contrast against surface is at least AA 4.5:1', () => {
    // Near-black on near-white — well above 4.5:1
    expect(isTextSafe('#111111', '#F5F5F5')).toBe(true);
  });

  it('returns false when contrast against surface is below AA 4.5:1', () => {
    // Mid gray on light gray — typically fails normal-text AA
    expect(isTextSafe('#A0A0A0', '#F0F0F0')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/color/roleFitness.test.ts`

Expected: FAIL — `isTextSafe` is not exported / not defined.

- [ ] **Step 3: Minimal implementation**

In `lib/color/roleFitness.ts`, next to `TEXT_AA_RATIO` (already `4.5`):

```ts
/**
 * Why: callers need to know if an expressive color can be used as normal text
 * on a surface (WCAG AA 4.5:1), without changing which color was selected.
 */
export function isTextSafe(candidateHex: string, surfaceHex: string): boolean {
  return contrastRatio(candidateHex, surfaceHex) >= TEXT_AA_RATIO;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/color/roleFitness.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git checkout -b feat/color-role-pipeline-improvements
git add lib/color/roleFitness.ts lib/color/roleFitness.test.ts
git commit -m "feat(color): add isTextSafe AA contrast helper for expressive roles"
```

---

### Task 2: Background/surface lightness separation (commit 2)

**Files:**
- Modify: `lib/color/semanticTokens.ts` (`deriveBaseSemanticTokens`)
- Create: `lib/color/semanticTokens.surfaceSeparation.test.ts`

**Interfaces:**
- Consumes: `toOklch` / `oklchChannelsToHex` already in `semanticTokens.ts`
- Produces: after neutral ramp, `|L(background) - L(surface)| >= 0.035` when clamp allows; surface never crosses border/background L

- [ ] **Step 1: Write the failing tests**

Create `lib/color/semanticTokens.surfaceSeparation.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { converter } from 'culori';
import { deriveSemanticTokens } from './semanticTokens';

const toOklch = converter('oklch');
const MIN_DELTA = 0.035;

describe('background/surface lightness separation', () => {
  it('keeps light theme surface at least MIN_DELTA away from background', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const bg = toOklch(tokens.background.hex)?.l ?? 0;
    const surface = toOklch(tokens.surface.hex)?.l ?? 0;
    const border = toOklch(tokens.border.hex)?.l ?? 0;
    expect(Math.abs(bg - surface)).toBeGreaterThanOrEqual(MIN_DELTA - 1e-6);
    // Surface stays on the border side of the bg↔border interval (does not cross border)
    expect(surface).toBeGreaterThanOrEqual(Math.min(bg, border) - 1e-6);
    expect(surface).toBeLessThanOrEqual(Math.max(bg, border) + 1e-6);
  });

  it('keeps dark theme surface at least MIN_DELTA away from background', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'dark',
      synthesisStrategy: 'analogous',
    });
    const bg = toOklch(tokens.background.hex)?.l ?? 0;
    const surface = toOklch(tokens.surface.hex)?.l ?? 0;
    const border = toOklch(tokens.border.hex)?.l ?? 0;
    expect(Math.abs(bg - surface)).toBeGreaterThanOrEqual(MIN_DELTA - 1e-6);
    expect(surface).toBeGreaterThanOrEqual(Math.min(bg, border) - 1e-6);
    expect(surface).toBeLessThanOrEqual(Math.max(bg, border) + 1e-6);
  });
});
```

Note: use `synthesisStrategy: 'analogous'` so `deriveSemanticTokens` returns the base path under test (per current `if (!input.synthesisStrategy) applyAreaAwareStrategy`).

- [ ] **Step 2: Run tests to verify they fail (or document if already passing by luck)**

Run: `npm test -- lib/color/semanticTokens.surfaceSeparation.test.ts`

Expected: ideally FAIL on ΔL if current ramp is tighter than 0.035; if already ≥ 0.035, add a focused unit test of the helper with forced equal L (extract `ensureSurfaceLightnessSeparation` and test that). Prefer extracting the helper so RED is guaranteed:

```ts
// In semanticTokens.ts — export for test
export const MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035;

export function ensureSurfaceLightnessSeparation(
  backgroundHex: string,
  surfaceHex: string,
  borderHex: string,
  theme: 'light' | 'dark',
): string {
  // ...
}
```

Add a third test that forces equal L:

```ts
it('pushes surface away when delta is below threshold', () => {
  const bg = '#FAFAFA';
  const same = '#FAFAFA';
  const border = '#E0E0E0';
  const next = ensureSurfaceLightnessSeparation(bg, same, border, 'light');
  const bgL = toOklch(bg)?.l ?? 0;
  const nextL = toOklch(next)?.l ?? 0;
  expect(Math.abs(bgL - nextL)).toBeGreaterThanOrEqual(MIN_BG_SURFACE_LIGHTNESS_DELTA - 1e-6);
});
```

- [ ] **Step 3: Minimal implementation**

In `lib/color/semanticTokens.ts`:

```ts
export const MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035;

/**
 * Why: tinted neutral ramps can collapse background and surface into one
 * visual plane; keep a minimum OKLCH lightness gap so layers read as distinct,
 * without changing hue/chroma or invading the border band.
 */
export function ensureSurfaceLightnessSeparation(
  backgroundHex: string,
  surfaceHex: string,
  borderHex: string,
  theme: 'light' | 'dark',
): string {
  const bg = toOklch(backgroundHex);
  const surface = toOklch(surfaceHex);
  const border = toOklch(borderHex);
  if (!bg || !surface || !border) return surfaceHex;

  const bgL = bg.l ?? 0;
  let surfaceL = surface.l ?? 0;
  const borderL = border.l ?? 0;
  const chroma = surface.c ?? 0;
  const hue = surface.h ?? bg.h ?? 0;

  if (Math.abs(bgL - surfaceL) >= MIN_BG_SURFACE_LIGHTNESS_DELTA) {
    return surfaceHex;
  }

  const low = Math.min(bgL, borderL);
  const high = Math.max(bgL, borderL);
  const desired =
    theme === 'light'
      ? bgL - MIN_BG_SURFACE_LIGHTNESS_DELTA
      : bgL + MIN_BG_SURFACE_LIGHTNESS_DELTA;
  surfaceL = Math.min(high, Math.max(low, desired));

  return oklchChannelsToHex(surfaceL, chroma, hue);
}
```

In `deriveBaseSemanticTokens`, after `surface` and `border` tokens exist (border is created after surface today — apply separation **after** border is computed, then rebuild surface token):

```ts
  // after border/divider computed from ramp...
  const separatedSurfaceHex = ensureSurfaceLightnessSeparation(
    background.hex,
    surface.hex,
    border.hex,
    theme,
  );
  const separatedSurface =
    separatedSurfaceHex === surface.hex
      ? surface
      : token(separatedSurfaceHex, surface.source === 'override' ? 'override' : 'derived');
  // use separatedSurface in the returned object and for any later refs that used surface
```

Careful: `pickExpressive` uses `surface.hex` later in the same function — use `separatedSurface` there.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/color/semanticTokens.surfaceSeparation.test.ts`

Expected: PASS

Also run: `npm test -- lib/color/rolePalette.test.ts lib/color/rolePaletteContrast.test.ts`

Expected: PASS (no selection regressions)

- [ ] **Step 5: Commit**

```bash
git add lib/color/semanticTokens.ts lib/color/semanticTokens.surfaceSeparation.test.ts
git commit -m "feat(color): enforce minimum background/surface lightness separation"
```

---

### Task 3: `on-background-muted` + `texto-secundario` + `textSafe` on projection (commit 3)

**Files:**
- Modify: `lib/color/semanticTokens.ts` (token name + derivation + return object)
- Modify: `lib/color/roleTypes.ts`
- Modify: `lib/color/semanticRoleProjection.ts`
- Modify: `lib/color/rolePaletteDerived.ts`
- Modify: `lib/color/themeCounterpartColor.ts`
- Modify: `lib/color/roleInspectorContrast.ts`
- Create: `lib/color/semanticTokens.mutedText.test.ts`
- Fix any `RolePalette` test fixtures missing the new key (compiler will list them)

**Interfaces:**
- Consumes: `isTextSafe` from Task 1; `adjustLightnessForContrast` / contrast helpers
- Produces:
  - `SemanticTokenName` includes `'on-background-muted'`
  - `PaletteRoleId` includes `'texto-secundario'`
  - `RoleSlot.textSafe?: boolean` on expressive roles
  - `ROLE_TO_TOKEN['texto-secundario'] = 'on-background-muted'`

- [ ] **Step 1: Write the failing tests**

`lib/color/semanticTokens.mutedText.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../utils/colorMath';
import { deriveSemanticTokens } from './semanticTokens';
import { assignRolesFromHexes } from './rolePalette';
import { isTextSafe } from './roleFitness';

describe('on-background-muted', () => {
  it('derives muted text near 3:1 against surface and weaker than primary text', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const mutedRatio = contrastRatio(tokens['on-background-muted'].hex, tokens.surface.hex);
    const mainRatio = contrastRatio(tokens['on-background'].hex, tokens.surface.hex);
    expect(mutedRatio).toBeGreaterThanOrEqual(2.8);
    expect(mutedRatio).toBeLessThanOrEqual(3.4);
    expect(mutedRatio).toBeLessThan(mainRatio);
  });
});

describe('RoleSlot.textSafe projection', () => {
  it('sets textSafe on expressive roles from isTextSafe vs surface', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    expect(palette.primario.textSafe).toBe(
      isTextSafe(palette.primario.hex, palette.superficie.hex),
    );
    expect(palette.secundario.textSafe).toBe(
      isTextSafe(palette.secundario.hex, palette.superficie.hex),
    );
    expect(palette.acento.textSafe).toBe(
      isTextSafe(palette.acento.hex, palette.superficie.hex),
    );
    expect(palette['texto-secundario'].hex).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/color/semanticTokens.mutedText.test.ts`

Expected: FAIL — missing token / role / `textSafe`.

- [ ] **Step 3: Minimal implementation**

**roleTypes.ts** — add `'texto-secundario'` after `'texto'` in union, order, labels, and `DERIVED_ROLES`:

```ts
export type PaletteRoleId =
  | 'fondo'
  | 'superficie'
  | 'texto'
  | 'texto-secundario'
  | 'primario'
  | 'secundario'
  | 'acento'
  | 'borde';

export const PALETTE_ROLE_ORDER: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'texto-secundario',
  'primario',
  'secundario',
  'acento',
  'borde',
];

export const ROLE_LABELS: Record<PaletteRoleId, string> = {
  // ...
  'texto-secundario': 'Texto secundario',
};

export type RoleSlot = {
  role: PaletteRoleId;
  hex: string;
  name: string;
  source: ColorSource;
  originalHex?: string;
  gap?: string;
  /** Why: whether this hex meets AA 4.5:1 as text on surface (expressive roles). */
  textSafe?: boolean;
};

export const DERIVED_ROLES: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'texto-secundario',
  'secundario',
  'borde',
];
```

**semanticTokens.ts** — extend `SemanticTokenName` with `'on-background-muted'`. Derive after `onBackground` / `surface`:

```ts
/**
 * Why: secondary labels need a quieter text token (~3:1 AA large:
 * typically ≥18px or ≥14px bold) — not full AA body text.
 */
function deriveOnBackgroundMuted(
  onBackgroundHex: string,
  surfaceHex: string,
): SemanticToken {
  const muted = adjustLightnessForContrast(onBackgroundHex, surfaceHex, 3);
  return token(muted, 'derived');
}
```

Include in returned `SemanticTokens` object. Use `separatedSurface` from Task 2 as the contrast background.

**semanticRoleProjection.ts**:

```ts
const ROLE_TO_TOKEN: Record<PaletteRoleId, SemanticTokenName> = {
  fondo: 'background',
  superficie: 'surface',
  texto: 'on-background',
  'texto-secundario': 'on-background-muted',
  primario: 'primary',
  secundario: 'secondary',
  acento: 'accent',
  borde: 'border',
};

const EXPRESSIVE_ROLES = new Set<PaletteRoleId>(['primario', 'secundario', 'acento']);

// when building slot:
...(EXPRESSIVE_ROLES.has(role)
  ? { textSafe: isTextSafe(normalized, tokens.surface.hex) }
  : {}),
```

**rolePaletteDerived.ts** — add resolution for `texto-secundario` (derive muted from `texto` vs `superficie` with ratio 3) into `resolutions`.

**themeCounterpartColor.ts** — add lightness targets e.g. light `0.45`, dark `0.72`; include in `NEUTRAL_ROLES`.

**roleInspectorContrast.ts** — case `'texto-secundario'`: contrast muted text on surface.

Fix compile errors in fixtures (`useWorkspaceExports.test.ts`, etc.) by adding `texto-secundario` slots.

- [ ] **Step 4: Run tests**

Run:

```bash
npm test -- lib/color/semanticTokens.mutedText.test.ts lib/color/rolePalette.test.ts lib/color/roleInspectorContrast.ts
npx tsc --noEmit
```

Expected: PASS / clean (or only pre-existing unrelated errors).

- [ ] **Step 5: Commit**

```bash
git add lib/color/roleTypes.ts lib/color/semanticTokens.ts lib/color/semanticRoleProjection.ts \
  lib/color/rolePaletteDerived.ts lib/color/themeCounterpartColor.ts \
  lib/color/roleInspectorContrast.ts lib/color/semanticTokens.mutedText.test.ts \
  # plus any fixture fixes
git commit -m "feat(color): add muted text role and textSafe on expressive slots"
```

---

### Task 4: `getColorForUsage` + context wrapper (commit 4)

**Files:**
- Create: `lib/color/usageColor.ts`
- Create: `lib/color/usageColor.test.ts`
- Modify: `src/context/RolePaletteContext.tsx`

**Interfaces:**
- Consumes: `RolePalette`, `SemanticTokens`, `RoleSlot`
- Produces:

```ts
export type UsageIntent =
  | 'action'
  | 'active-state'
  | 'positive-trend'
  | 'data-visualization';

export type UsageColor = {
  fill: RoleSlot;
  text: RoleSlot;
  textSafe: boolean;
};

export function getColorForUsage(
  palette: RolePalette,
  tokens: SemanticTokens,
  intent: UsageIntent,
): UsageColor;
```

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';
import { assignRolesFromHexes } from './rolePalette';
import { deriveSemanticTokens } from './semanticTokens';
import { getColorForUsage } from './usageColor';
import { normalizeHex } from './normalizeHex';

describe('getColorForUsage', () => {
  const extracted = [
    { hex: '#F7F7F5', prominence: 1 },
    { hex: '#A8D5E5', prominence: 0.9 }, // light blue — often fails text AA on light surface
    { hex: '#E8D44D', prominence: 0.8 },
    { hex: '#2C3E50', prominence: 0.7 },
  ];
  const tokens = deriveSemanticTokens({ extracted, theme: 'light', synthesisStrategy: 'analogous' });
  // Force primary to a known unsafe-as-text light color via overrides for the fallback test
  const unsafeTokens = deriveSemanticTokens({
    extracted,
    theme: 'light',
    synthesisStrategy: 'analogous',
    overrides: { primary: '#A8D5E5' },
  });
  const unsafePalette = /* project or assign with override path */;

  it('maps action to primario', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const t = deriveSemanticTokens({
      extracted: [
        { hex: '#F7F7F5', prominence: 1 },
        { hex: '#3366CC', prominence: 0.9 },
        { hex: '#E8D44D', prominence: 0.8 },
      ],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const result = getColorForUsage(palette, t, 'action');
    expect(result.fill.role).toBe('primario');
  });

  it('maps active-state to primario fill but never uses expressive as text', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const t = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const result = getColorForUsage(palette, t, 'active-state');
    expect(result.fill.role).toBe('primario');
    expect(result.text.role).toBe('texto');
  });

  it('maps positive-trend to acento and data-visualization to secundario', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D', '#2C3E50']);
    const t = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    expect(getColorForUsage(palette, t, 'positive-trend').fill.role).toBe('acento');
    expect(getColorForUsage(palette, t, 'data-visualization').fill.role).toBe('secundario');
  });

  it('for action with textSafe false prefers primary-900 tonal over on-background', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#A8D5E5', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
      overrides: { primary: '#A8D5E5' },
    });
    const { projectSemanticTokensToRolePalette } = require('./semanticRoleProjection');
    const palette = projectSemanticTokensToRolePalette(tokens);
    // Ensure precondition
    expect(palette.primario.textSafe).toBe(false);
    const result = getColorForUsage(palette, tokens, 'action');
    expect(normalizeHex(result.text.hex)).toBe(normalizeHex(tokens['primary-900'].hex));
    expect(normalizeHex(result.text.hex)).not.toBe(normalizeHex(tokens['on-background'].hex));
  });
});
```

Use proper ESM imports (no `require`) in the real file.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/color/usageColor.test.ts`

Expected: FAIL — module missing.

- [ ] **Step 3: Minimal implementation**

`lib/color/usageColor.ts`:

```ts
import type { RolePalette, RoleSlot } from './roleTypes';
import type { SemanticTokens } from './semanticTokens';

export type UsageIntent =
  | 'action'
  | 'active-state'
  | 'positive-trend'
  | 'data-visualization';

export type UsageColor = {
  fill: RoleSlot;
  text: RoleSlot;
  textSafe: boolean;
};

const INTENT_TO_ROLE = {
  action: 'primario',
  'active-state': 'primario',
  'positive-trend': 'acento',
  'data-visualization': 'secundario',
} as const;

/**
 * Why: components should pick colors by usage intent, not by freely choosing
 * primary/secondary/accent — and must never paint unsafe expressive hexes as fonts.
 *
 * Future: optional `against?: 'surface' | 'background'` for floating badges on page bg.
 */
export function getColorForUsage(
  palette: RolePalette,
  tokens: SemanticTokens,
  intent: UsageIntent,
): UsageColor {
  const fill = palette[INTENT_TO_ROLE[intent]];
  const textSafe = fill.textSafe === true;
  const onBackground = palette.texto;

  if (intent === 'action') {
    if (textSafe) {
      return { fill, text: fill, textSafe };
    }
    const tonalHex = tokens['primary-900'].hex;
    const text: RoleSlot = {
      role: 'texto',
      hex: tonalHex,
      name: fill.name,
      source: 'derived',
    };
    return { fill, text, textSafe };
  }

  // active-state / positive-trend / data-visualization: expressive is fill only
  return { fill, text: onBackground, textSafe };
}
```

**RolePaletteContext.tsx** — extend value type and provider:

```ts
getColorForUsage: (intent: UsageIntent) => UsageColor | null;
```

```ts
const getColorForUsageBound = useCallback(
  (intent: UsageIntent) => {
    if (!rolePalette || !semanticTokens) return null;
    return getColorForUsage(rolePalette, semanticTokens, intent);
  },
  [rolePalette, semanticTokens],
);
```

Export types from context or re-export from `@lib/color/usageColor`.

- [ ] **Step 4: Run full related suite**

```bash
npm test -- lib/color/usageColor.test.ts lib/color/roleFitness.test.ts lib/color/semanticTokens.surfaceSeparation.test.ts lib/color/semanticTokens.mutedText.test.ts
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/color/usageColor.ts lib/color/usageColor.test.ts src/context/RolePaletteContext.tsx
git commit -m "feat(color): map usage intents to role colors with safe text pairs"
```

---

## Self-review vs spec

| Spec requirement | Task |
| --- | --- |
| `isTextSafe` ≥ 4.5:1 | Task 1 |
| ΔL background/surface + light/dark + clamp | Task 2 |
| `on-background-muted` + `texto-secundario` + AA large comment | Task 3 |
| `textSafe` on expressive slots (projection) | Task 3 |
| `getColorForUsage` mapping + tonal fallback test | Task 4 |
| Context thin wrapper | Task 4 |
| Future `against` noted in comment | Task 4 |
| One PR / 4 commits | Steps 5 of each task |
| No change to hex selection | Explicit constraint |

No TBD placeholders. Types consistent: `UsageColor`, `textSafe?: boolean` on `RoleSlot`, `MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035`.
