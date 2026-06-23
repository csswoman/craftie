import type { GeneratedPalette } from '@lib/color/formulas';
import type { FontPair } from '@lib/typography/pairings';

export type DesignMdInput = {
  palette: GeneratedPalette;
  pairing: FontPair | null;
  kitName?: string;
};

const ROLE_LABELS: Record<keyof GeneratedPalette, string> = {
  primary: 'Primary',
  accent: 'Accent',
  surface: 'Surface',
  onSurface: 'On Surface',
  neutralLight: 'Neutral Light',
  neutralDark: 'Neutral Dark',
};

export function generateDesignMd({ palette, pairing, kitName = 'Craftie Kit' }: DesignMdInput): string {
  const heading = pairing?.heading.family ?? '—';
  const body = pairing?.body.family ?? '—';

  const colorLines = (Object.keys(ROLE_LABELS) as (keyof GeneratedPalette)[]).map(
    (role) => `- **${ROLE_LABELS[role]}** (\`${palette[role]}\`)`,
  );

  return `---
name: ${kitName}
description: Guía de marca generada con Craftie.
colors:
  primary: "${palette.primary}"
  accent: "${palette.accent}"
  surface: "${palette.surface}"
  on-surface: "${palette.onSurface}"
  neutral-light: "${palette.neutralLight}"
  neutral-dark: "${palette.neutralDark}"
typography:
  display:
    fontFamily: "${heading}"
  body:
    fontFamily: "${body}"
---

# Design System: ${kitName}

## Colors

${colorLines.join('\n')}

## Typography

- **Display / Headline:** ${heading}
- **Body:** ${body}

## Usage

- \`primary\` — acciones principales y énfasis de marca.
- \`accent\` — estados secundarios y contraste complementario.
- \`surface\` / \`onSurface\` — fondos y texto sobre superficie.
- \`neutralLight\` / \`neutralDark\` — bordes, divisores y jerarquía neutra.
`;
}
