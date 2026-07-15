import { converter } from 'culori';

import { contrastRatio, oklchChannelsToHex } from '../utils/colorMath';

const toOklch = converter('oklch');

export type DerivedForeground = {
  hex: string;
  backgroundHex: string;
  contrast: number;
  originalLightness: number;
  lightness: number;
  chroma: number;
  hue: number;
};

/**
 * Keeps a background intact and searches only foreground lightness. The text
 * retains the background hue and a small chroma trace instead of using black/white.
 */
export function deriveForegroundForBackground(
  backgroundHex: string,
  minimumContrast = 4.5,
): DerivedForeground {
  const background = toOklch(backgroundHex);

  if (!background) {
    throw new Error(`No se pudo convertir ${backgroundHex} a OKLCH.`);
  }

  const originalLightness = background.l ?? 0.5;
  const hue = background.h ?? 0;
  const chroma = Math.min(0.06, Math.max(0.02, (background.c ?? 0) * 0.35));
  const lightBackground = originalLightness >= 0.6;
  let bestHex = oklchChannelsToHex(lightBackground ? 0 : 1, chroma, hue);
  let bestLightness = lightBackground ? 0 : 1;

  for (let step = 0; step <= 100; step += 1) {
    const lightness = lightBackground ? 0.58 - step * 0.0058 : 0.42 + step * 0.0058;
    const bounded = Math.min(1, Math.max(0, lightness));
    const candidate = oklchChannelsToHex(bounded, chroma, hue);

    if (contrastRatio(candidate, backgroundHex) >= minimumContrast) {
      bestHex = candidate;
      bestLightness = bounded;
      break;
    }
  }

  return {
    hex: bestHex,
    backgroundHex,
    contrast: contrastRatio(bestHex, backgroundHex),
    originalLightness,
    lightness: bestLightness,
    chroma,
    hue,
  };
}
