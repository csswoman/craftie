import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { pickButtonPair, softFill, type ButtonPair } from '@lib/color/buttonPair';
import { contrastRatio, getWCAGLevel } from '@lib/color/contrast';

import { onVividFill } from './previewColor';

/**
 * Filled button for a surface: the palette's action pair when its label reads
 * (4.5:1) and its fill stands out from that surface (3:1), the accent pair as a
 * second try, and ink on paper when neither does. Never returns a pair that
 * fails, so a layout cannot ship an unreadable or invisible button.
 */
export function buttonPairOn(colors: ResolvedLayoutColors, surfaceHex: string): ButtonPair {
  return pickButtonPair(
    [
      { fill: colors.primaryAction, on: colors.primaryActionText },
      { fill: colors.accent, on: onVividFill(colors.accent) },
    ],
    surfaceHex,
    { fill: colors.text, on: surfaceHex },
  );
}

/** Button on the hero: the hero is usually the primary color, so invert before giving up. */
export function heroButtonPair(colors: ResolvedLayoutColors): ButtonPair {
  const hero = colors.heroSurface ?? colors.primaryAction;
  const onHero = colors.onHero ?? colors.primaryActionText;

  return pickButtonPair(
    [
      { fill: colors.primaryAction, on: colors.primaryActionText },
      { fill: onHero, on: hero },
    ],
    hero,
    { fill: onHero, on: hero },
  );
}

/** Real ratio and WCAG level for a text pair, to show instead of claiming. */
export function contrastReadout(foreground: string, background: string): { ratio: string; level: string } {
  const ratio = contrastRatio(foreground, background);
  const level = getWCAGLevel(ratio, false);

  return { ratio: `${ratio.toFixed(1)}:1`, level: level === 'fail' ? 'No cumple' : level };
}

/** Opaque tint of a palette color on a surface; contrast is measurable on it. */
export function paletteTint(colorHex: string, surfaceHex: string, share: number): string {
  return softFill(colorHex, surfaceHex, share);
}
