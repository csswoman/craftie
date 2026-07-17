import type { PaletteSeeds } from '../color/rolePalette';
import type { FontPair } from '../typography/pairings';
import { EMPTY_THEMES, resolveThemePalette, type ThemesConfig } from '../color/themePalette';
import { tokenNameForPaletteRole } from '../color/semanticRoleProjection';
import type { SemanticTokenOverrides } from '../color/semanticTokens';
import { PALETTE_ROLE_ORDER } from '../color/roleTypes';

import { buildExportTokenSet, type ExportTokenSet } from './exportTokenSet';
import { toCss } from './serializeExportTokens';

export type DesignMdInput = {
  seeds: PaletteSeeds;
  themes?: ThemesConfig;
  pairing: FontPair | null;
  kitName?: string;
};

function isExportTokenSet(input: ExportTokenSet | DesignMdInput): input is ExportTokenSet {
  return 'colors' in input && 'meta' in input;
}

function legacyInputToTokenSet(input: DesignMdInput): ExportTokenSet {
  const themes = input.themes ?? EMPTY_THEMES;
  const lightPalette = resolveThemePalette(input.seeds, 'light', themes, [])!;
  const darkPalette = resolveThemePalette(input.seeds, 'dark', themes, [])!;
  const dark = Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [tokenNameForPaletteRole(role), darkPalette[role].hex]),
  ) as SemanticTokenOverrides;

  return buildExportTokenSet({
    rolePalette: lightPalette,
    tokenOverridesByTheme: { light: {}, dark },
    pairing: input.pairing,
    name: input.kitName ?? 'Craftie Kit',
  });
}

export function generateDesignMd(set: ExportTokenSet): string;
export function generateDesignMd(input: DesignMdInput): string;
export function generateDesignMd(input: ExportTokenSet | DesignMdInput): string {
  const set = isExportTokenSet(input) ? input : legacyInputToTokenSet(input);
  const heading = set.typography?.heading?.family ?? '—';
  const body = set.typography?.body?.family ?? '—';
  const cssBlock = toCss(set);
  const tokens = Object.keys(set.colors).sort();

  const yamlColorLines = tokens.flatMap((token) => {
    const light = set.colors[token]?.light;
    return light ? [`    ${token}: "${light}"`] : [];
  });
  const yamlDarkLines = tokens.flatMap((token) => {
    const dark = set.colors[token]?.dark;
    return dark ? [`    ${token}: "${dark}"`] : [];
  });

  const referenceLines = tokens.map((token) => {
    const value = set.colors[token];
    return `| \`--color-${token}\` | ${token} | \`${value?.light ?? '—'}\` | \`${value?.dark ?? '—'}\` |`;
  });

  const usageLines = [
    ...tokens.map((token) => `- \`--color-${token}\` — token semántico \`${token}\`.`),
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
