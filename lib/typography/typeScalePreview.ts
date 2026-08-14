import { adjustLightnessForContrast, contrastRatio, mix } from '../utils/colorMath';

export type TypeScaleRowTone = {
  background: string;
  ink: string;
  muted: string;
  hairline: string;
  paddingY: number;
};

const TOP_INK_MIX = 0.18;
const BOTTOM_PAPER_MIX = 0.42;
const INK_FADE = 0.62;
const MUTED_MIX = 0.38;
const HAIRLINE_MIX = 0.55;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 16;
const RAMP_CURVE = 0.5;

export function typeScaleSizeProgress(size: number, minSize: number, maxSize: number): number {
  if (maxSize <= minSize) {
    return 0;
  }

  return (maxSize - size) / (maxSize - minSize);
}

export function typeScaleIndexProgress(index: number, count: number): number {
  if (count <= 1) {
    return 0;
  }

  return Math.pow(index / (count - 1), RAMP_CURVE);
}

export function typeScaleRowPaddingY(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));

  return Math.round(PADDING_TOP - t * (PADDING_TOP - PADDING_BOTTOM));
}

export function typeScaleSpecimenIsLarge(size: number, weight: number): boolean {
  return size >= 18 || (size >= 14 && weight >= 700);
}

function ensureContrast(foreground: string, background: string, minRatio: number): string {
  if (contrastRatio(foreground, background) >= minRatio) {
    return foreground;
  }

  return adjustLightnessForContrast(foreground, background, minRatio);
}

export function buildTypeScaleRowTone({
  fondo,
  superficie,
  texto,
  borde,
  progress,
  specimenIsLarge,
}: {
  fondo: string;
  superficie: string;
  texto: string;
  borde: string;
  progress: number;
  specimenIsLarge: boolean;
}): TypeScaleRowTone {
  const t = Math.min(1, Math.max(0, progress));
  const weighted = mix(superficie, texto, TOP_INK_MIX * (1 - t));
  const background = mix(weighted, fondo, BOTTOM_PAPER_MIX * t);
  const inkAmount = t <= 0 ? 0 : 0.2 + INK_FADE * t * 0.7;
  const fadedInk = mix(texto, background, inkAmount);
  const inkFloor = specimenIsLarge ? 3 : 4.5;
  const ink = ensureContrast(fadedInk, background, inkFloor);
  const muted = ensureContrast(mix(texto, background, MUTED_MIX), background, 4.5);
  const hairline = mix(borde, background, HAIRLINE_MIX);

  return {
    background,
    ink,
    muted,
    hairline,
    paddingY: typeScaleRowPaddingY(t),
  };
}
