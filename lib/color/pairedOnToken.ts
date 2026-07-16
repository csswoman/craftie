import { adjustLightnessForContrast, contrastRatio } from '../utils/colorMath';
import { deriveForegroundForBackground } from './pairedForeground';

const AA_RATIO = 4.5;

export function deriveOnTokenHexForFill(fillHex: string): string {
  const foreground = deriveForegroundForBackground(fillHex, AA_RATIO).hex;

  return contrastRatio(foreground, fillHex) >= AA_RATIO
    ? foreground
    : adjustLightnessForContrast(foreground, fillHex, AA_RATIO);
}
