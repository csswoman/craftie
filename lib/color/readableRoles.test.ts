import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import { assignRolesFromHexes } from '../color/rolePalette';
import { contrastRatio } from '../utils/colorMath';
import { deriveReadableRoleVariants } from './readableRoles';
import { buildPreviewTokens, hasPreviewContrastFailure } from './previewTokens';

const toOklch = converter('oklch');

describe('readableRoles', () => {
  it('derives readable variants that pass AA on their target surfaces', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#E8D44D', '#F4A261']);
    const readable = deriveReadableRoleVariants(palette);

    expect(contrastRatio(readable.primarioReadable, palette.superficie.hex)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(readable.acentoReadableOnFondo, palette.fondo.hex)).toBeGreaterThanOrEqual(4.5);

    const originalHue = toOklch(palette.primario.hex)?.h ?? 0;
    const readableHue = toOklch(readable.primarioReadable)?.h ?? 0;
    const hueDelta = Math.min(
      Math.abs(originalHue - readableHue),
      360 - Math.abs(originalHue - readableHue),
    );
    expect(hueDelta).toBeLessThan(2);
  });
});

describe('previewTokens', () => {
  it('validates every painted preview pair at AA after readableOn', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const tokens = buildPreviewTokens(palette);

    expect(tokens.contrast.every((entry) => entry.passesAa)).toBe(true);
    expect(hasPreviewContrastFailure(tokens)).toBe(false);
    expect(tokens.supportBanner.backgroundColor).not.toBe(palette.secundario.hex);
  });
});
