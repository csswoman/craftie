# Design Tokens Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exportar solo tokens definidos (roles + overrides) como CSS, JSON W3C, Tokens Studio y DESIGN.md, sin exigir «Crear guía de marca».

**Architecture:** Un `ExportTokenSet` intermedio construido por `buildExportTokenSet` en `lib/export/`; serializadores puros (`toCss`, `toW3cJson`, `toTokensStudio`) y `generateDesignMd` actualizado consumen ese set. La UI solo elige formato, descarga y muestra `missingCore`.

**Tech Stack:** TypeScript, Vitest, React (`'use client'`), `downloadTextFile`.

**Spec:** `docs/superpowers/specs/2026-07-16-design-tokens-export-design.md`

**Commit policy:** Do **not** create git commits unless the user explicitly asks.

---

## File structure

| File | Responsibility |
| --- | --- |
| `lib/export/exportTokenSet.ts` | Tipos `ExportTokenSet`, `BuildExportTokenSetInput`; `CORE_EXPORT_TOKENS`; `buildExportTokenSet`; `canExportTokenSet` |
| `lib/export/exportTokenSet.test.ts` | Unit tests del builder y del mínimo |
| `lib/export/serializeExportTokens.ts` | `toCss`, `toW3cJson`, `toTokensStudio` |
| `lib/export/serializeExportTokens.test.ts` | Shape asserts de cada serializador |
| `lib/export/generateDesignMd.ts` | Reescribir para aceptar `ExportTokenSet` (mantener overload/compat mínimo si hace falta) |
| `lib/export/generateDesignMd.test.ts` | Actualizar expectativas a nombres en inglés / set |
| `lib/export/designTokens.ts` | Dejar helpers legacy de roles en español; los nuevos exports no los usan para la UI principal |
| `src/components/color/useWorkspaceExports.ts` | Construir set, handlers CSS/JSON/Figma/MD/brand kit; ya no exige `generatedPalette` salvo brand kit (se genera on-the-fly) |
| `src/components/color/useWorkspaceExports.test.ts` | Cubrir nuevos handlers y gate |
| `src/components/layout/ExportMenu.tsx` | Nuevas opciones + `exportBlockedReason` |
| `src/components/layout/WorkspaceHeader.tsx` | Pasar reason + nuevos callbacks |
| `src/components/color/SelectColorsWorkspace.tsx` | `canExport` desde mínimo, no `isReviewPhase` |
| `src/components/color/useSelectColorsWorkspaceController.ts` | Pasar `tokenOverridesByTheme` al hook; exponer nuevos handlers |

**Unchanged:** «Crear guía de marca» / review phase; Style Dictionary como dependencia; Figma Variables nativas.

---

### Task 1: `buildExportTokenSet` (TDD)

**Files:**
- Create: `lib/export/exportTokenSet.ts`
- Create: `lib/export/exportTokenSet.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';

import type { RolePalette, RoleSlot } from '../color/rolePalette';
import type { FontPair } from '../typography/pairings';
import {
  buildExportTokenSet,
  canExportTokenSet,
  CORE_EXPORT_TOKENS,
} from './exportTokenSet';

function slot(role: keyof RolePalette, hex: string): RoleSlot {
  return { role, hex, name: role, source: 'extracted' };
}

function palette(partial: Partial<Record<keyof RolePalette, string>>): RolePalette {
  const base: Record<keyof RolePalette, string> = {
    fondo: '#FFFFFF',
    superficie: '#F5F5F5',
    texto: '#111111',
    primario: '#3366FF',
    secundario: '#88AAFF',
    acento: '#FFAA00',
    borde: '#DDDDDD',
  };
  const merged = { ...base, ...partial };
  return Object.fromEntries(
    (Object.keys(merged) as (keyof RolePalette)[]).map((role) => [role, slot(role, merged[role])]),
  ) as RolePalette;
}

const emptyOverrides = { light: {}, dark: {} };

describe('buildExportTokenSet', () => {
  it('projects assigned roles to English semantic names (light only)', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: emptyOverrides,
      pairing: null,
      name: 'Test',
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.primary).toEqual({ light: '#3366FF' });
    expect(set.colors.background).toEqual({ light: '#FFFFFF' });
    expect(set.colors['on-background']).toEqual({ light: '#111111' });
    expect(set.colors.surface).toEqual({ light: '#F5F5F5' });
    expect(set.meta.included).toEqual(
      expect.arrayContaining(['primary', 'background', 'on-background', 'surface']),
    );
    expect(set.meta.missingCore).toEqual([]);
    expect(set.typography).toBeUndefined();
  });

  it('includes only explicit semantic overrides, not derived tokens', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: { success: '#228B22', 'data-2': '#AABBCC' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.success).toEqual({ light: '#228B22' });
    expect(set.colors['data-2']).toEqual({ light: '#AABBCC' });
    expect(set.colors['data-3']).toBeUndefined();
    expect(set.colors['on-primary']).toBeUndefined();
  });

  it('attaches dark values only when dark overrides exist', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: {},
        dark: { primary: '#99AABB', success: '#114411' },
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.primary).toEqual({ light: '#3366FF', dark: '#99AABB' });
    expect(set.colors.success).toEqual({ dark: '#114411' });
  });

  it('ignores invalid override hexes', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: { success: 'not-a-color', warning: '#FFCC00' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.success).toBeUndefined();
    expect(set.colors.warning).toEqual({ light: '#FFCC00' });
  });

  it('lists missingCore when primary/background/on-background absent', () => {
    const set = buildExportTokenSet({
      rolePalette: null,
      tokenOverridesByTheme: {
        light: { accent: '#FFAA00' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.meta.missingCore).toEqual([...CORE_EXPORT_TOKENS]);
    expect(canExportTokenSet(set)).toBe(false);
  });

  it('includes typography when pairing is present', () => {
    const pairing = {
      id: 'p1',
      displayName: 'Test',
      heading: {
        family: 'Playfair Display',
        googleFontsRef: 'Playfair+Display',
        classification: 'serif',
        contrast: 'high',
        xHeight: 'medium',
        personality: [],
        bestFor: 'heading',
        defaultWeight: 700,
      },
      body: {
        family: 'Source Sans 3',
        googleFontsRef: 'Source+Sans+3',
        classification: 'sans-serif',
        contrast: 'medium',
        xHeight: 'high',
        personality: [],
        bestFor: 'body',
        defaultWeight: 400,
      },
      rationale: '',
      mood: [],
      character: [],
    } satisfies FontPair;

    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: emptyOverrides,
      pairing,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.typography).toEqual({
      heading: { family: 'Playfair Display', weight: 700 },
      body: { family: 'Source Sans 3', weight: 400 },
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/export/exportTokenSet.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement `exportTokenSet.ts`**

```ts
import { isValidOpaqueHex, normalizeHex } from '../color/normalizeHex';
import { tokenNameForPaletteRole } from '../color/semanticRoleProjection';
import type { RolePalette } from '../color/rolePalette';
import type { SemanticTokenName, SemanticTokenOverrides } from '../color/semanticTokens';
import { PALETTE_ROLE_ORDER } from '../color/roleTypes';
import type { FontPair } from '../typography/pairings';

export const CORE_EXPORT_TOKENS = ['primary', 'background', 'on-background'] as const;

export type CoreExportToken = (typeof CORE_EXPORT_TOKENS)[number];

export type ExportColorValue = {
  light?: string;
  dark?: string;
};

export type ExportTypographyRole = {
  family: string;
  weight?: number;
  size?: string;
};

export type ExportTokenSet = {
  name: string;
  exportedAt: string;
  colors: Record<string, ExportColorValue>;
  typography?: {
    heading?: ExportTypographyRole;
    body?: ExportTypographyRole;
  };
  meta: {
    included: string[];
    missingCore: CoreExportToken[];
  };
};

export type BuildExportTokenSetInput = {
  rolePalette: RolePalette | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  pairing: FontPair | null;
  name?: string;
  exportedAt?: string;
};

function tryNormalize(hex: string): string | null {
  if (!isValidOpaqueHex(hex)) return null;
  return normalizeHex(hex);
}

function setColor(
  colors: Record<string, ExportColorValue>,
  token: string,
  theme: 'light' | 'dark',
  hex: string,
) {
  const normalized = tryNormalize(hex);
  if (!normalized) return;
  const current = colors[token] ?? {};
  colors[token] = { ...current, [theme]: normalized };
}

export function buildExportTokenSet(input: BuildExportTokenSetInput): ExportTokenSet {
  const colors: Record<string, ExportColorValue> = {};

  if (input.rolePalette) {
    for (const role of PALETTE_ROLE_ORDER) {
      const token = tokenNameForPaletteRole(role);
      setColor(colors, token, 'light', input.rolePalette[role].hex);
    }
  }

  for (const [token, hex] of Object.entries(input.tokenOverridesByTheme.light) as Array<
    [SemanticTokenName, string]
  >) {
    if (hex == null || hex === '') continue;
    setColor(colors, token, 'light', hex);
  }

  for (const [token, hex] of Object.entries(input.tokenOverridesByTheme.dark) as Array<
    [SemanticTokenName, string]
  >) {
    if (hex == null || hex === '') continue;
    setColor(colors, token, 'dark', hex);
  }

  let typography: ExportTokenSet['typography'];
  if (input.pairing) {
    typography = {
      heading: {
        family: input.pairing.heading.family,
        ...(input.pairing.heading.defaultWeight != null
          ? { weight: input.pairing.heading.defaultWeight }
          : {}),
      },
      body: {
        family: input.pairing.body.family,
        ...(input.pairing.body.defaultWeight != null
          ? { weight: input.pairing.body.defaultWeight }
          : {}),
      },
    };
  }

  const included = Object.keys(colors).sort();
  const missingCore = CORE_EXPORT_TOKENS.filter((token) => {
    const value = colors[token];
    return !value?.light && !value?.dark;
  });

  return {
    name: input.name ?? 'craftie-tokens',
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    colors,
    ...(typography ? { typography } : {}),
    meta: { included, missingCore: [...missingCore] },
  };
}

export function canExportTokenSet(set: ExportTokenSet): boolean {
  return set.meta.missingCore.length === 0;
}

export function formatMissingCoreLabel(missingCore: readonly string[]): string {
  const labels: Record<string, string> = {
    primary: 'primario',
    background: 'fondo',
    'on-background': 'texto',
  };
  return missingCore.map((token) => labels[token] ?? token).join(', ');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/export/exportTokenSet.test.ts`

Expected: PASS

---

### Task 2: Serializers CSS / W3C / Tokens Studio (TDD)

**Files:**
- Create: `lib/export/serializeExportTokens.ts`
- Create: `lib/export/serializeExportTokens.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, expect, it } from 'vitest';

import type { ExportTokenSet } from './exportTokenSet';
import { toCss, toTokensStudio, toW3cJson } from './serializeExportTokens';

const set: ExportTokenSet = {
  name: 'Test Kit',
  exportedAt: '2026-07-16T00:00:00.000Z',
  colors: {
    primary: { light: '#3366FF', dark: '#99AABB' },
    background: { light: '#FFFFFF' },
    success: { dark: '#114411' },
  },
  typography: {
    heading: { family: 'Playfair Display', weight: 700 },
    body: { family: 'Source Sans 3', weight: 400 },
  },
  meta: { included: ['background', 'primary', 'success'], missingCore: [] },
};

describe('toCss', () => {
  it('emits English custom properties for light and dark', () => {
    const css = toCss(set);

    expect(css).toContain(':root {');
    expect(css).toContain('  --color-primary: #3366FF;');
    expect(css).toContain('  --color-background: #FFFFFF;');
    expect(css).toContain('  --font-heading: "Playfair Display";');
    expect(css).toContain('  --font-body: "Source Sans 3";');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('  --color-primary: #99AABB;');
    expect(css).toContain('  --color-success: #114411;');
    expect(css).not.toContain('--color-primario');
  });
});

describe('toW3cJson', () => {
  it('emits $type/$value groups for color and fontFamily', () => {
    const json = JSON.parse(toW3cJson(set));

    expect(json.color.primary.$type).toBe('color');
    expect(json.color.primary.$value).toBe('#3366FF');
    expect(json.dark.color.primary.$value).toBe('#99AABB');
    expect(json.dark.color.success.$value).toBe('#114411');
    expect(json.fontFamily.heading.$type).toBe('fontFamily');
    expect(json.fontFamily.heading.$value).toBe('Playfair Display');
  });
});

describe('toTokensStudio', () => {
  it('emits Tokens Studio token sets for light/dark', () => {
    const json = JSON.parse(toTokensStudio(set));

    expect(json.light.color.primary).toEqual({ value: '#3366FF', type: 'color' });
    expect(json.dark.color.primary).toEqual({ value: '#99AABB', type: 'color' });
    expect(json.dark.color.success).toEqual({ value: '#114411', type: 'color' });
    expect(json.light.fontFamilies.heading).toEqual({
      value: 'Playfair Display',
      type: 'fontFamilies',
    });
    expect(json.$metadata.tokenSetOrder).toEqual(['light', 'dark']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run lib/export/serializeExportTokens.test.ts`

Expected: FAIL (module not found)

- [ ] **Step 3: Implement serializers**

```ts
import type { ExportTokenSet } from './exportTokenSet';

function cssTokenName(token: string): string {
  return `--color-${token}`;
}

function quoteFont(family: string): string {
  return family.includes(' ') ? `"${family}"` : family;
}

export function toCss(set: ExportTokenSet): string {
  const lightLines: string[] = [];
  const darkLines: string[] = [];

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      lightLines.push(`  ${cssTokenName(token)}: ${value.light};`);
    }
    if (value?.dark) {
      darkLines.push(`  ${cssTokenName(token)}: ${value.dark};`);
    }
  }

  if (set.typography?.heading?.family) {
    lightLines.push(`  --font-heading: ${quoteFont(set.typography.heading.family)};`);
  }
  if (set.typography?.body?.family) {
    lightLines.push(`  --font-body: ${quoteFont(set.typography.body.family)};`);
  }

  const blocks: string[] = [];
  if (lightLines.length > 0) {
    blocks.push(`:root {\n${lightLines.join('\n')}\n}`);
  }
  if (darkLines.length > 0) {
    blocks.push(`[data-theme="dark"] {\n${darkLines.join('\n')}\n}`);
  }
  return blocks.join('\n\n');
}

export function toW3cJson(set: ExportTokenSet): string {
  const color: Record<string, { $type: 'color'; $value: string }> = {};
  const darkColor: Record<string, { $type: 'color'; $value: string }> = {};

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      color[token] = { $type: 'color', $value: value.light };
    }
    if (value?.dark) {
      darkColor[token] = { $type: 'color', $value: value.dark };
    }
  }

  const payload: Record<string, unknown> = { color };
  if (Object.keys(darkColor).length > 0) {
    payload.dark = { color: darkColor };
  }

  if (set.typography) {
    const fontFamily: Record<string, { $type: 'fontFamily'; $value: string }> = {};
    if (set.typography.heading?.family) {
      fontFamily.heading = { $type: 'fontFamily', $value: set.typography.heading.family };
    }
    if (set.typography.body?.family) {
      fontFamily.body = { $type: 'fontFamily', $value: set.typography.body.family };
    }
    if (Object.keys(fontFamily).length > 0) {
      payload.fontFamily = fontFamily;
    }
  }

  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function toTokensStudio(set: ExportTokenSet): string {
  const lightColor: Record<string, { value: string; type: 'color' }> = {};
  const darkColor: Record<string, { value: string; type: 'color' }> = {};

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      lightColor[token] = { value: value.light, type: 'color' };
    }
    if (value?.dark) {
      darkColor[token] = { value: value.dark, type: 'color' };
    }
  }

  const light: Record<string, unknown> = { color: lightColor };
  const dark: Record<string, unknown> = { color: darkColor };

  if (set.typography?.heading?.family || set.typography?.body?.family) {
    const fontFamilies: Record<string, { value: string; type: 'fontFamilies' }> = {};
    if (set.typography.heading?.family) {
      fontFamilies.heading = {
        value: set.typography.heading.family,
        type: 'fontFamilies',
      };
    }
    if (set.typography.body?.family) {
      fontFamilies.body = {
        value: set.typography.body.family,
        type: 'fontFamilies',
      };
    }
    light.fontFamilies = fontFamilies;
  }

  const tokenSetOrder = ['light'];
  const payload: Record<string, unknown> = { light };

  if (Object.keys(darkColor).length > 0) {
    payload.dark = dark;
    tokenSetOrder.push('dark');
  }

  payload.$themes = [];
  payload.$metadata = { tokenSetOrder };

  return `${JSON.stringify(payload, null, 2)}\n`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm exec vitest run lib/export/serializeExportTokens.test.ts`

Expected: PASS

---

### Task 3: `generateDesignMd` from `ExportTokenSet`

**Files:**
- Modify: `lib/export/generateDesignMd.ts`
- Modify: `lib/export/generateDesignMd.test.ts`
- Modify: `lib/export/brandKit.ts` (wire through `buildExportTokenSet` when building `designMd`)

- [ ] **Step 1: Rewrite `generateDesignMd` to accept `ExportTokenSet`**

Replace the public API with:

```ts
import type { ExportTokenSet } from './exportTokenSet';
import { toCss } from './serializeExportTokens';

export function generateDesignMd(set: ExportTokenSet): string {
  const heading = set.typography?.heading?.family ?? '—';
  const body = set.typography?.body?.family ?? '—';
  const cssBlock = toCss(set);

  const yamlColorLines = Object.keys(set.colors)
    .sort()
    .flatMap((token) => {
      const value = set.colors[token];
      const lines: string[] = [];
      if (value?.light) lines.push(`    ${token}: "${value.light}"`);
      return lines;
    });

  const yamlDarkLines = Object.keys(set.colors)
    .sort()
    .flatMap((token) => {
      const value = set.colors[token];
      const lines: string[] = [];
      if (value?.dark) lines.push(`    ${token}: "${value.dark}"`);
      return lines;
    });

  const referenceLines = Object.keys(set.colors)
    .sort()
    .map((token) => {
      const value = set.colors[token];
      const light = value?.light ?? '—';
      const dark = value?.dark ?? '—';
      return `| \`--color-${token}\` | ${token} | \`${light}\` | \`${dark}\` |`;
    });

  const usageLines = [
    ...Object.keys(set.colors)
      .sort()
      .map((token) => `- \`--color-${token}\` — token semántico \`${token}\`.`),
    '- Activa el tema oscuro con `data-theme="dark"` en `<html>` o un contenedor raíz.',
  ];

  const darkYaml =
    yamlDarkLines.length > 0 ? `  dark:\n${yamlDarkLines.join('\n')}\n` : '';

  return `---
name: ${set.name}
description: Guía de marca generada con Craftie.
colors:
  light:
${yamlColorLines.join('\n') || '    {}'}
${darkYaml}typography:
  display:
    fontFamily: "${heading}"
  body:
    fontFamily: "${body}"
---

# Design System: ${set.name}

## Tokens de color (CSS)

Pega este bloque para soporte light/dark con custom properties:

\`\`\`css
${cssBlock}
\`\`\`

## Referencia

| Token | Nombre | Light | Dark |
| --- | --- | --- | --- |
${referenceLines.join('\n')}

## Typography

- **Display / Headline:** ${heading}
- **Body:** ${body}

## Uso

${usageLines.join('\n')}
`;
}
```

- [ ] **Step 2: Update `generateDesignMd.test.ts`**

Remove legacy Spanish role expectations. Build a set with `buildExportTokenSet` and assert English tokens:

```ts
import { buildExportTokenSet } from './exportTokenSet';
import { generateDesignMd } from './generateDesignMd';
// ... reuse palette helper from Task 1 or inline ...

it('includes English semantic tokens and pasteable css', () => {
  const set = buildExportTokenSet({
    rolePalette: /* full palette */,
    tokenOverridesByTheme: { light: {}, dark: {} },
    pairing: null,
    name: 'Test Kit',
    exportedAt: '2026-07-16T00:00:00.000Z',
  });
  const md = generateDesignMd(set);

  expect(md).toContain('name: Test Kit');
  expect(md).toContain('primary: "#');
  expect(md).toContain('--color-primary:');
  expect(md).not.toContain('--color-primario');
  expect(md).toContain('## Tokens de color (CSS)');
});
```

Keep the old `designTokens` Spanish CSS tests in the same file if they still cover `rolePaletteToCssCustomProperties` (legacy helper); do not delete that helper in this task.

- [ ] **Step 3: Update `brandKit.ts`**

Change `designMd` generation to:

```ts
import { buildExportTokenSet } from './exportTokenSet';
import { generateDesignMd } from './generateDesignMd';

// inside buildBrandKit, after you have rolePalette + pairing + themes/overrides available:
const tokenSet = buildExportTokenSet({
  rolePalette,
  tokenOverridesByTheme: themeInput?.tokenOverridesByTheme ?? { light: {}, dark: {} },
  pairing,
  name: kitName,
});
// ...
designMd: generateDesignMd(tokenSet),
```

Extend `themeInput` (or the optional 5th arg object) to accept `tokenOverridesByTheme`. If current signature only has `{ seeds, themes }`, add optional `tokenOverridesByTheme` without breaking callers.

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run lib/export/generateDesignMd.test.ts lib/export/exportTokenSet.test.ts lib/export/serializeExportTokens.test.ts`

Expected: PASS. Fix any `brandKit` compile errors via `pnpm typecheck` if needed.

---

### Task 4: Wire `useWorkspaceExports` + gate

**Files:**
- Modify: `src/components/color/useWorkspaceExports.ts`
- Modify: `src/components/color/useWorkspaceExports.test.ts`
- Modify: `src/components/color/useSelectColorsWorkspaceController.ts`

- [ ] **Step 1: Update hook signature and handlers**

```ts
'use client';

import { generatePaletteFromRolePalette } from '@lib/color/rolePalette';
import type { GeneratedPalette } from '@lib/color/formulas';
import type { RolePalette } from '@lib/color/rolePalette';
import type { SemanticTokenOverrides } from '@lib/color/semanticTokens';
import { buildBrandKit, serializeBrandKit } from '@lib/export/brandKit';
import {
  buildExportTokenSet,
  canExportTokenSet,
  formatMissingCoreLabel,
} from '@lib/export/exportTokenSet';
import { generateDesignMd } from '@lib/export/generateDesignMd';
import { toCss, toTokensStudio, toW3cJson } from '@lib/export/serializeExportTokens';
import type { FontPair } from '@lib/typography/pairings';
import { downloadTextFile } from '@/lib/browser/download';

export function useWorkspaceExports({
  generatedPalette,
  rolePalette,
  tokenOverridesByTheme,
  selectedPairing,
  setError,
  setStatusMessage,
  kitName = 'craftie-tokens',
}: {
  generatedPalette: GeneratedPalette | null;
  rolePalette: RolePalette | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  selectedPairing: FontPair | null;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  kitName?: string;
}) {
  const tokenSet = buildExportTokenSet({
    rolePalette,
    tokenOverridesByTheme,
    pairing: selectedPairing,
    name: kitName,
  });
  const canExport = canExportTokenSet(tokenSet);
  const exportBlockedReason = canExport
    ? null
    : `Falta: ${formatMissingCoreLabel(tokenSet.meta.missingCore)}`;

  function download(filename: string, content: string, mime: string, success: string) {
    const result = downloadTextFile(filename, content, mime);
    if (!result.ok) {
      setError(result.error);
      setStatusMessage(null);
      return;
    }
    setError(null);
    setStatusMessage(success);
  }

  function requireExportable(): boolean {
    if (!canExport) {
      setError(exportBlockedReason);
      setStatusMessage(null);
      return false;
    }
    return true;
  }

  function handleExportCss() {
    if (!requireExportable()) return;
    download('tokens.css', toCss(tokenSet), 'text/css;charset=utf-8', 'tokens.css descargado.');
  }

  function handleExportTokensJson() {
    if (!requireExportable()) return;
    download(
      'tokens.json',
      toW3cJson(tokenSet),
      'application/json;charset=utf-8',
      'tokens.json descargado.',
    );
  }

  function handleExportFigmaTokens() {
    if (!requireExportable()) return;
    download(
      'figma-tokens.json',
      toTokensStudio(tokenSet),
      'application/json;charset=utf-8',
      'figma-tokens.json descargado.',
    );
  }

  function handleExportDesignMd() {
    if (!requireExportable()) return;
    download(
      'DESIGN.md',
      generateDesignMd(tokenSet),
      'text/markdown;charset=utf-8',
      'DESIGN.md descargado en tu carpeta de descargas.',
    );
  }

  function handleExportBrandKit() {
    if (!requireExportable() || !rolePalette) return;
    const palette =
      generatedPalette ?? generatePaletteFromRolePalette(rolePalette);
    const kit = buildBrandKit(palette, rolePalette, selectedPairing, kitName, {
      tokenOverridesByTheme,
    });
    download(
      'brand-kit.json',
      serializeBrandKit(kit),
      'application/json;charset=utf-8',
      'Brand kit (.json) descargado.',
    );
  }

  return {
    canExport,
    exportBlockedReason,
    handleExportBrandKit,
    handleExportCss,
    handleExportDesignMd,
    handleExportFigmaTokens,
    handleExportTokensJson,
  };
}
```

Adapt `buildBrandKit`’s 5th argument to the new shape (drop required `seeds`/`themes` for `designMd` path; keep them only if other brand-kit fields still need them — read `brandKit.ts` and keep `palette`/`rolePalette`/`typography` fields intact).

- [ ] **Step 2: Update hook tests**

- Mock `downloadTextFile` as today.
- Pass `tokenOverridesByTheme: { light: {}, dark: {} }` and a full `rolePalette`.
- Assert `handleExportCss` downloads `tokens.css` with `--color-primary`.
- Assert `canExport` is false when `rolePalette` is null.
- Update DESIGN.md test to not require `generatedPalette` / `seeds`.

- [ ] **Step 3: Wire controller**

In `useSelectColorsWorkspaceController.ts`:

- Read `tokenOverridesByTheme` from `useRolePalette()` (already on context value — confirm export name; if only per-theme `tokenOverrides` for active theme exists, expose `tokenOverridesByTheme` from context or pass both light/dark from edit state).
- Replace `useWorkspaceExports({…})` args: remove `seeds`/`themes` requirement for export gate; pass `tokenOverridesByTheme`.
- Return `canExport`, `exportBlockedReason`, and the new handlers from the controller.

If `tokenOverridesByTheme` is not currently on the context public API, add it to the context value in `RolePaletteContext.tsx` (it already exists in edit state — just expose it).

- [ ] **Step 4: Run tests**

Run: `pnpm exec vitest run src/components/color/useWorkspaceExports.test.ts`

Expected: PASS

---

### Task 5: Export menu UI

**Files:**
- Modify: `src/components/layout/ExportMenu.tsx`
- Modify: `src/components/layout/WorkspaceHeader.tsx`
- Modify: `src/components/color/SelectColorsWorkspace.tsx`

- [ ] **Step 1: Expand `ExportMenu` options and blocked reason**

```ts
export type ExportMenuProps = {
  canExport: boolean;
  exportBlockedReason?: string | null;
  onExportCss: () => void;
  onExportTokensJson: () => void;
  onExportFigmaTokens: () => void;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
};

const EXPORT_OPTIONS = [
  {
    id: 'css',
    label: 'CSS variables',
    description: 'Custom properties listos para pegar en tu hoja de estilos.',
  },
  {
    id: 'tokens-json',
    label: 'Design tokens (JSON)',
    description: 'Formato W3C / Style Dictionary.',
  },
  {
    id: 'figma',
    label: 'Figma (Tokens Studio)',
    description: 'JSON importable con el plugin Tokens Studio.',
  },
  {
    id: 'design-md',
    label: 'DESIGN.md',
    description: 'Guía de diseño en Markdown para documentación.',
  },
  {
    id: 'brand-kit',
    label: 'Brand kit (.json)',
    description: 'Paquete todo-en-uno con colores y tipografía.',
  },
] as const;
```

- When `!canExport`, keep trigger disabled; set `title` / visible caption to `exportBlockedReason` (e.g. small muted text beside the button: `Falta: primario, fondo`).
- `handleSelect` switches on `option.id` and calls the matching callback.

- [ ] **Step 2: Update `WorkspaceHeader` props** to pass through the new callbacks + `exportBlockedReason`. Update HELP_ITEMS export description to mention CSS / tokens / Figma.

- [ ] **Step 3: Update `SelectColorsWorkspace`**

```tsx
<WorkspaceHeader
  canExport={workspace.canExport}
  exportBlockedReason={workspace.exportBlockedReason}
  onCraftieHome={workspace.requestCraftieHome}
  onExportCss={workspace.handleExportCss}
  onExportTokensJson={workspace.handleExportTokensJson}
  onExportFigmaTokens={workspace.handleExportFigmaTokens}
  onExportDesignMd={workspace.handleExportDesignMd}
  onExportBrandKit={workspace.handleExportBrandKit}
/>
```

Replace `canExport={workspace.isReviewPhase}`.

- [ ] **Step 4: Manual smoke (dev)**

Run: `pnpm dev`

1. Cargar inspiración y tener primario + fondo + texto → Exportar habilitado **sin** pulsar «Crear guía».
2. Descargar CSS → `--color-primary` (no `--color-primario`).
3. Descargar `tokens.json` y `figma-tokens.json` → JSON válido.
4. Con solo acento override y sin core → botón deshabilitado con «Falta: …».
5. «Crear guía» sigue entrando a review.

- [ ] **Step 5: Full verify**

Run: `pnpm verify`

Expected: lint, component-size, typecheck, tests PASS.

---

## Self-review (plan vs spec)

| Spec requirement | Task |
| --- | --- |
| Solo roles + overrides explícitos | Task 1 |
| Mínimo primary/background/on-background | Task 1 + 4 |
| Independiente de «Crear guía» | Task 4–5 |
| Nombres en inglés | Task 1–3 |
| Tipografía si hay pairing | Task 1–2 |
| Dark solo si definido | Task 1–2 |
| CSS / W3C / Tokens Studio / DESIGN.md | Task 2–3 |
| Menú Exportar ampliado + reason | Task 5 |
| Brand kit sin gate de review | Task 4 (`generatePaletteFromRolePalette` on-the-fly) |
| Tests unitarios en `/lib` | Task 1–3 |

No placeholders remaining. Types (`ExportTokenSet`, `ExportColorValue`) consistent across tasks.
