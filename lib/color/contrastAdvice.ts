import { adjustLightnessForContrast, contrastRatio, hexToOklchChannels } from '../utils/colorMath';

export const AA_REQUIRED_RATIO = 4.5;

export type ContrastFixSide = 'foreground' | 'background';

export type ContrastFix = {
  side: ContrastFixSide;
  hex: string;
  ratio: number;
  /** Signed OKLCH lightness change, in points of a 0-100 scale. */
  deltaL: number;
  direction: 'lighten' | 'darken';
};

export type ContrastAdvice = {
  ratio: number;
  required: number;
  /** Share of the required ratio already reached, clamped to 0-1. */
  progress: number;
  fixes: ContrastFix[];
  /** Short, plain-language explanation of why the pair fails and how to fix it. */
  tips: string[];
};

function buildFix(
  side: ContrastFixSide,
  moving: string,
  fixed: string,
  required: number,
): ContrastFix | null {
  const hex = adjustLightnessForContrast(moving, fixed, required);
  const ratio = contrastRatio(hex, fixed);

  if (ratio < required) {
    return null;
  }

  const deltaL = (hexToOklchChannels(hex).l - hexToOklchChannels(moving).l) * 100;

  if (Math.abs(deltaL) < 0.05) {
    return null;
  }

  return { side, hex, ratio, deltaL, direction: deltaL > 0 ? 'lighten' : 'darken' };
}

function formatPoints(deltaL: number): string {
  return `${Math.abs(deltaL).toFixed(0)} puntos`;
}

/**
 * Explains a failing foreground/background pair and proposes the smallest lightness
 * change (hue and chroma preserved) on each side that reaches `required`.
 * Returns no fixes when the pair already passes.
 */
export function buildContrastAdvice(
  foregroundHex: string,
  backgroundHex: string,
  required: number = AA_REQUIRED_RATIO,
): ContrastAdvice {
  const ratio = contrastRatio(foregroundHex, backgroundHex);
  const progress = Math.max(0, Math.min(1, (ratio - 1) / (required - 1)));

  if (ratio >= required) {
    return { ratio, required, progress: 1, fixes: [], tips: [] };
  }

  const fixes = [
    buildFix('foreground', foregroundHex, backgroundHex, required),
    buildFix('background', backgroundHex, foregroundHex, required),
  ].filter((fix): fix is ContrastFix => fix !== null);

  const tips: string[] = [];
  const lightnessGap =
    Math.abs(
      hexToOklchChannels(foregroundHex).l - hexToOklchChannels(backgroundHex).l,
    ) * 100;

  if (lightnessGap < 25) {
    tips.push(
      `Los dos colores tienen una luminosidad muy parecida (${lightnessGap.toFixed(0)} puntos de diferencia). Separa uno hacia claro y otro hacia oscuro.`,
    );
  }

  for (const fix of fixes) {
    const target = fix.side === 'foreground' ? 'el texto' : 'el fondo';
    tips.push(
      `${fix.direction === 'darken' ? 'Oscurece' : 'Aclara'} ${target} unos ${formatPoints(fix.deltaL)} de luminosidad para llegar a ${fix.ratio.toFixed(1)}:1.`,
    );
  }

  if (fixes.length === 0) {
    tips.push(
      'Ajustar solo la luminosidad no alcanza. Cambia ambos colores o usa blanco o negro para el texto.',
    );
  }

  tips.push('Para texto grande (18 px en negrita o 24 px) basta con 3:1.');

  return { ratio, required, progress, fixes, tips };
}
