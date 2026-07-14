import { converter } from 'culori';

import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

const toOklch = converter('oklch');

export const UI_COMPOSITION_SEGMENTS = [
  { token: 'background', label: 'Fondo', area: 0.55 },
  { token: 'surface', label: 'Superficie', area: 0.25 },
  { token: 'on-background', label: 'Texto', area: 0.08 },
  { token: 'border', label: 'Borde', area: 0.03 },
  { token: 'primary', label: 'Primario', area: 0.05 },
  { token: 'accent', label: 'Acento', area: 0.015 },
] as const satisfies ReadonlyArray<{
  token: SemanticTokenName;
  label: string;
  area: number;
}>;

const CHROMA_LOAD_REFERENCE = 0.18;

export type ColorLoadVerdict = {
  level: 'quiet' | 'balanced' | 'saturated';
  label: string;
  subtitle: string;
};

export function chromaLoadPercent(score: number): number {
  return Math.min(100, Math.max(0, Math.round(score / CHROMA_LOAD_REFERENCE * 100)));
}

export function assessUiColorLoad(tokens: SemanticTokens): number {
  return UI_COMPOSITION_SEGMENTS.reduce((score, segment) => {
    if (tokens[segment.token].gap) return score;
    const chroma = toOklch(tokens[segment.token].hex)?.c ?? 0;
    return score + chroma * segment.area;
  }, 0);
}

export function colorLoadVerdict(loadPercent: number): ColorLoadVerdict {
  if (loadPercent < 8) {
    return {
      level: 'quiet',
      label: 'Apagada',
      subtitle: 'casi sin color, puede sentirse gris',
    };
  }

  if (loadPercent <= 28) {
    return {
      level: 'balanced',
      label: 'Equilibrada',
      subtitle: 'el color vive en superficies pequeñas',
    };
  }

  return {
    level: 'saturated',
    label: 'Saturada ⚠',
    subtitle: 'el color cubre demasiada pantalla',
  };
}
