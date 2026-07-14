import { converter } from 'culori';

import {
  bestTextOn,
  contrastRatio,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
  relativeLuminance,
} from '@lib/utils/colorMath';

const toOklch = converter('oklch');

/**
 * A lively "UI fill" tone derived from an exported palette color.
 *
 * The exported semantic tokens guarantee AA *as text* on the surface, which on a
 * near-white light surface forces chromatic colors dark — vivid but heavy. When a
 * color is used as a large FILL (button, chart bar, donut arc) it does not need
 * that guarantee, so we lift it into a brighter band and push chroma toward the
 * sRGB ceiling for real "pop". Text placed on the fill is contrasted separately
 * via {@link onVividFill}. Never used for text, borders, or surfaces — only fills.
 *
 * The base token stays unchanged; edits still map to it. This only affects how a
 * fill is displayed, so the preview reads as a real product while the palette a
 * user exports keeps its accessibility contract.
 *
 * On dark surfaces the exported colors already sit in a bright band and pop, so
 * this is a no-op there — dark previews stay exactly as generated.
 */
/** Lightness at which this hue reaches its most saturated point in sRGB. */
function peakChromaLightness(hue: number): number {
  let bestL = 0.7;
  let bestChroma = -1;

  for (let lightness = 0.5; lightness <= 0.94; lightness += 0.02) {
    const chroma = maxOklchChromaForSrgb(lightness, hue);

    if (chroma > bestChroma) {
      bestChroma = chroma;
      bestL = lightness;
    }
  }

  return bestL;
}

/**
 * @param amount How far to move from the source color toward its hue's most
 * vivid point, 0–1. Low values (~0.35) keep the palette's identity recognizable
 * while still gaining real brightness; 1.0 would jump all the way to peak
 * chroma, which can drift far enough from the source to read as a different hue.
 */
export function vividFill(hex: string, surfaceHex: string, amount = 0.35): string {
  if (relativeLuminance(surfaceHex) < 0.5) {
    return hex;
  }

  const channels = toOklch(hex);

  if (!channels || channels.mode !== 'oklch') {
    return hex;
  }

  const hue = channels.h ?? 0;
  const sourceLightness = channels.l ?? 0.5;
  const peakLightness = peakChromaLightness(hue);

  const lightness = sourceLightness + (peakLightness - sourceLightness) * amount;
  const peakChroma = maxOklchChromaForSrgb(lightness, hue);
  const sourceChroma = channels.c ?? 0;
  const chroma = sourceChroma + (peakChroma - sourceChroma) * amount;

  return oklchChannelsToHex(lightness, chroma, hue);
}

/** Black or white text for a vivid fill, whichever reaches the higher contrast. */
export function onVividFill(fillHex: string): string {
  const candidate = bestTextOn(fillHex);

  if (contrastRatio(candidate, fillHex) >= 4.5) {
    return candidate;
  }

  // Fall back to the more contrasting pole if bestTextOn lands short.
  const white = '#FFFFFF';
  const black = '#111111';

  return contrastRatio(white, fillHex) >= contrastRatio(black, fillHex) ? white : black;
}
