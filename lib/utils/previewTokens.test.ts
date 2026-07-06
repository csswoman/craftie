import { describe, expect, it } from 'vitest';

import { assignRolesFromHexes, extractSeedsFromPalette } from '../color/rolePalette';
import { deriveTheme } from '../color/themePalette';
import { relativeLuminance } from './colorMath';
import {
  buttonVariant,
  primaryButtonVariant,
  PRIMARY_BUTTON_VARIANTS,
} from './buttonVariants';
import { semanticChipStyle } from './semanticChips';

describe('buttonVariants', () => {
  it('derives four emphasis levels from primario only', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);

    for (const variant of PRIMARY_BUTTON_VARIANTS) {
      const styles = primaryButtonVariant(palette, variant);
      expect(styles.backgroundColor).toBeTruthy();
      expect(styles.color).toBeTruthy();
      expect(styles.color).not.toBe(palette.secundario.hex);
      expect(styles.emphasis).toBe('brand');
    }

    expect(primaryButtonVariant(palette, 'filled').backgroundColor).toBe(palette.primario.hex);
    expect(primaryButtonVariant(palette, 'text').backgroundColor).toBe('transparent');
  });

  it('neutral filled swaps texto and fondo without theme-specific logic', () => {
    const light = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const dark = deriveTheme(extractSeedsFromPalette(light), 'dark');
    const lightNeutral = buttonVariant(light, 'filled', 'neutral');
    const darkNeutral = buttonVariant(dark, 'filled', 'neutral');

    expect(lightNeutral.backgroundColor).toBe(light.texto.hex);
    expect(lightNeutral.color).toBe(light.fondo.hex);
    expect(darkNeutral.backgroundColor).toBe(dark.texto.hex);
    expect(darkNeutral.color).toBe(dark.fondo.hex);
    expect(relativeLuminance(lightNeutral.backgroundColor)).toBeLessThan(0.5);
    expect(relativeLuminance(darkNeutral.backgroundColor)).toBeGreaterThan(0.5);
    expect(relativeLuminance(lightNeutral.color)).toBeGreaterThan(0.5);
    expect(relativeLuminance(darkNeutral.color)).toBeLessThan(0.5);
  });
});
describe('semanticChips', () => {
  it('uses semantic tonals instead of brand hues', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const success = semanticChipStyle(palette, 'success');
    const danger = semanticChipStyle(palette, 'danger');

    expect(success.backgroundColor).not.toBe(palette.primario.hex);
    expect(success.backgroundColor).not.toBe(palette.secundario.hex);
    expect(danger.backgroundColor).not.toBe(palette.acento.hex);
  });
});
