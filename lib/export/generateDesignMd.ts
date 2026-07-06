import type { PaletteSeeds } from '../color/rolePalette';
import { PALETTE_ROLE_ORDER } from '../color/rolePalette';
import type { FontPair } from '../typography/pairings';
import { EMPTY_THEMES, resolveThemePalette, type ThemesConfig } from '../color/themePalette';

import {
  formatRoleLabel,
  roleTokenName,
  ROLE_TOKEN_USAGE,
  themePalettesToCssCustomProperties,
  themePalettesToTokenRecords,
  themeTokensToYaml,
} from './designTokens';

export type DesignMdInput = {
  seeds: PaletteSeeds;
  themes?: ThemesConfig;
  pairing: FontPair | null;
  kitName?: string;
};

export function generateDesignMd({
  seeds,
  themes = EMPTY_THEMES,
  pairing,
  kitName = 'Craftie Kit',
}: DesignMdInput): string {
  const heading = pairing?.heading.family ?? '—';
  const body = pairing?.body.family ?? '—';
  const tokenRecords = themePalettesToTokenRecords(seeds, themes);
  const cssBlock = themePalettesToCssCustomProperties(seeds, themes);
  const lightPalette = resolveThemePalette(seeds, 'light', themes, [])!;
  const darkPalette = resolveThemePalette(seeds, 'dark', themes, [])!;

  const yamlColors = themeTokensToYaml(seeds, themes);

  const referenceLines = PALETTE_ROLE_ORDER.map((role) => {
    const lightSlot = lightPalette[role];
    const darkSlot = darkPalette[role];

    return `| \`${roleTokenName(role)}\` | ${formatRoleLabel(role)} | \`${tokenRecords.light[role]}\` | \`${tokenRecords.dark[role]}\` | ${lightSlot.name} |`;
  });

  const usageLines = [
    ...PALETTE_ROLE_ORDER.map((role) => `- \`${roleTokenName(role)}\` — ${ROLE_TOKEN_USAGE[role]}`),
    '- Activa el tema oscuro con `data-theme="dark"` en `<html>` o un contenedor raíz.',
  ];

  return `---
name: ${kitName}
description: Guía de marca generada con Craftie.
colors:
${yamlColors}
typography:
  display:
    fontFamily: "${heading}"
  body:
    fontFamily: "${body}"
---

# Design System: ${kitName}

## Tokens de color (CSS)

Pega este bloque para soporte light/dark con custom properties:

\`\`\`css
${cssBlock}
\`\`\`

## Referencia por rol

| Token | Rol | Light | Dark | Nombre |
| --- | --- | --- | --- | --- |
${referenceLines.join('\n')}

## Typography

- **Display / Headline:** ${heading}
- **Body:** ${body}

## Uso

${usageLines.join('\n')}
`;
}
