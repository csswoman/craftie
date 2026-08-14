import { deriveForegroundForBackground } from '@lib/color/pairedForeground';
import { adjustLightnessForContrast, contrastRatio, readableOn } from '@lib/utils/colorMath';

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

/**
 * Expressive tokens (primary, accent, success) are fills.
 * When they must appear as type on a surface, keep the hue and move lightness to AA.
 */
export function readableInk(hex: string, surfaceHex: string, targetRatio = 4.5): string {
  return readableOn(hex, surfaceHex, targetRatio);
}
