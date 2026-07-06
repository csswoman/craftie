import { formatHex } from 'culori';

import type { RolePalette } from '../color/rolePalette';
import { normalizeHex } from '../color/normalizeHex';
import { mix, readableOn } from './colorMath';

export type SemanticChipState = 'success' | 'danger' | 'neutral';

export type SemanticChipStyle = {
  backgroundColor: string;
  color: string;
  label: string;
};

const SEMANTIC_LABELS: Record<SemanticChipState, string> = {
  success: 'Completado',
  danger: 'Error',
  neutral: 'Pendiente',
};

const SEMANTIC_TONES: Record<
  Exclude<SemanticChipState, 'neutral'>,
  { background: { l: number; c: number; h: number }; foreground: { l: number; c: number; h: number } }
> = {
  success: {
    background: { l: 0.92, c: 0.04, h: 145 },
    foreground: { l: 0.38, c: 0.1, h: 145 },
  },
  danger: {
    background: { l: 0.92, c: 0.04, h: 25 },
    foreground: { l: 0.38, c: 0.12, h: 25 },
  },
};

function oklchToHex(l: number, c: number, h: number): string {
  const hex = formatHex({ mode: 'oklch', l, c, h });

  if (!hex) {
    return '#808080';
  }

  return normalizeHex(hex);
}

/** Status chips use fixed semantic hues at low chroma — never brand rotation. */
export function semanticChipStyle(
  palette: RolePalette,
  state: SemanticChipState,
): SemanticChipStyle {
  if (state === 'neutral') {
    const backgroundColor = mix(palette.superficie.hex, palette.texto.hex, 0.12);

    return {
      backgroundColor,
      color: readableOn(palette.texto.hex, backgroundColor),
      label: SEMANTIC_LABELS.neutral,
    };
  }

  const tone = SEMANTIC_TONES[state];
  const backgroundColor = oklchToHex(
    tone.background.l,
    tone.background.c,
    tone.background.h,
  );
  const foreground = oklchToHex(
    tone.foreground.l,
    tone.foreground.c,
    tone.foreground.h,
  );

  return {
    backgroundColor,
    color: readableOn(foreground, backgroundColor),
    label: SEMANTIC_LABELS[state],
  };
}

export const SEMANTIC_CHIP_STATES: SemanticChipState[] = ['success', 'neutral', 'danger'];
