import { describe, expect, it } from 'vitest';

import { contrastRatio } from '../utils/colorMath';
import { assignRolesFromHexes, PALETTE_ROLE_ORDER, type RolePalette } from './rolePalette';
import { explainRoleColor, type DerivationStep } from './roleDerivation';

const palette = assignRolesFromHexes(['#FBFAF8', '#2F6FED', '#E4572E', '#1A1A1A']);

function step<K extends DerivationStep['kind']>(
  steps: DerivationStep[],
  kind: K,
): Array<Extract<DerivationStep, { kind: K }>> {
  return steps.filter((entry): entry is Extract<DerivationStep, { kind: K }> => entry.kind === kind);
}

describe('explainRoleColor', () => {
  it('starts every role with its origin', () => {
    for (const role of PALETTE_ROLE_ORDER) {
      const { steps, hex } = explainRoleColor(palette, role);
      expect(hex).toBe(palette[role].hex);
      expect(steps[0]).toEqual({ kind: 'origin', source: palette[role].source });
    }
  });

  it('measures text against background and surface at AA body size', () => {
    const contrast = step(explainRoleColor(palette, 'texto').steps, 'contrast');

    expect(contrast.map((entry) => entry.against)).toEqual(['fondo', 'superficie']);
    for (const entry of contrast) {
      expect(entry.required).toBe(4.5);
      expect(entry.ratio).toBeCloseTo(contrastRatio(entry.foregroundHex, entry.backgroundHex), 10);
      expect(entry.passes).toBe(entry.ratio >= 4.5);
    }
  });

  it('holds secondary text to the 3:1 secondary-label target', () => {
    const [contrast] = step(explainRoleColor(palette, 'texto-secundario').steps, 'contrast');
    expect(contrast.required).toBe(3);
    expect(contrast.against).toBe('superficie');
  });

  it('reports the lightness gap to the reference layer', () => {
    const [lightness] = step(explainRoleColor(palette, 'texto').steps, 'lightness');
    expect(lightness.referenceRole).toBe('fondo');
    expect(lightness.deltaPoints).toBeCloseTo(
      (lightness.lightness - lightness.referenceLightness) * 100,
      10,
    );
    expect(step(explainRoleColor(palette, 'fondo').steps, 'lightness')).toEqual([]);
  });

  it('checks brand colors with the best text placed on them', () => {
    const [contrast] = step(explainRoleColor(palette, 'primario').steps, 'contrast');
    expect(contrast.against).toBe('text');
    expect(contrast.backgroundHex).toBe(palette.primario.hex);
  });

  it('flags a neutral role that carries too much chroma', () => {
    const vivid: RolePalette = { ...palette, fondo: { ...palette.fondo, hex: '#FFD23F' } };
    const [chroma] = step(explainRoleColor(vivid, 'fondo').steps, 'chroma');
    expect(chroma.neutral).toBe(true);
    expect(chroma.withinLimit).toBe(false);
    expect(chroma.area).toBeGreaterThan(0.5);
  });

  it('marks pure grays as achromatic instead of reporting a hue', () => {
    const gray: RolePalette = { ...palette, borde: { ...palette.borde, hex: '#CCCCCC' } };
    const steps = explainRoleColor(gray, 'borde').steps;
    expect(step(steps, 'achromatic')).toHaveLength(1);
    expect(step(steps, 'hue')).toEqual([]);
  });

  it('describes a correction from the original color', () => {
    const corrected: RolePalette = {
      ...palette,
      primario: { ...palette.primario, hex: '#1F4FB8', originalHex: '#2F6FED', source: 'corrected' },
    };
    const [correction] = step(explainRoleColor(corrected, 'primario').steps, 'correction');
    expect(correction.fromHex).toBe('#2F6FED');
    expect(correction.deltaLightnessPoints).toBeLessThan(0);
    expect(correction.deltaHue).toBeLessThan(5);
  });
});
