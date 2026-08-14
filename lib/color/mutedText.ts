import { converter } from 'culori';

import {
  adjustLightnessForContrast,
  contrastRatio,
  oklchChannelsToHex,
} from '../utils/colorMath';

const toOklch = converter('oklch');

export function deriveMutedTextHex(
  textHex: string,
  surfaceHex: string,
  targetRatio = 3,
): string {
  const text = toOklch(textHex);
  const surface = toOklch(surfaceHex);

  if (!text || !surface) {
    return adjustLightnessForContrast(textHex, surfaceHex, targetRatio);
  }

  let low = 0;
  let high = 1;
  let muted = textHex;

  for (let step = 0; step < 16; step += 1) {
    const amount = (low + high) / 2;
    const lightness = (surface.l ?? 0.5) + ((text.l ?? 0.5) - (surface.l ?? 0.5)) * amount;
    const candidate = oklchChannelsToHex(
      lightness,
      Math.min(text.c ?? 0, 0.03),
      text.h ?? surface.h ?? 0,
    );

    if (contrastRatio(candidate, surfaceHex) >= targetRatio) {
      muted = candidate;
      high = amount;
    } else {
      low = amount;
    }
  }

  return muted;
}
