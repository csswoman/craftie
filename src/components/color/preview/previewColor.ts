import { deriveForegroundForBackground } from '@lib/color/pairedForeground';
import { adjustLightnessForContrast, contrastRatio } from '@lib/utils/colorMath';

/** Compatibility helper: UI fills now publish the source token unchanged. */
export function vividFill(hex: string, surfaceHex: string, amount = 0.35): string {
  void surfaceHex;
  void amount;
  return hex;
}

/** Hue-related foreground derived for the unchanged expressive fill. */
export function onVividFill(fillHex: string): string {
  const foreground = deriveForegroundForBackground(fillHex).hex;

  return contrastRatio(foreground, fillHex) >= 4.5
    ? foreground
    : adjustLightnessForContrast(foreground, fillHex, 4.5);
}
