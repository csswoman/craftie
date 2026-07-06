import { describe, expect, it } from 'vitest';

import { assignRolesFromHexes } from './rolePalette';
import { getActiveRoleContrastInfo } from './roleInspectorContrast';

describe('getActiveRoleContrastInfo', () => {
  const palette = assignRolesFromHexes(['#2F5644', '#3D6A8A', '#6986B8']);

  it('reports texto vs fondo for texto and fondo roles', () => {
    const textoInfo = getActiveRoleContrastInfo(palette, 'texto');
    const fondoInfo = getActiveRoleContrastInfo(palette, 'fondo');

    expect(textoInfo.pairLabel).toBe('Texto sobre fondo');
    expect(textoInfo.foregroundHex).toBe(palette.texto.hex);
    expect(textoInfo.backgroundHex).toBe(palette.fondo.hex);
    expect(textoInfo.ratio).toBe(fondoInfo.ratio);
  });

  it('uses readable foreground for chromatic roles', () => {
    const primarioInfo = getActiveRoleContrastInfo(palette, 'primario');

    expect(primarioInfo.pairLabel).toBe('Texto legible sobre superficie');
    expect(primarioInfo.foregroundHex).not.toBe(palette.primario.hex);
    expect(primarioInfo.backgroundHex).toBe(palette.superficie.hex);
    expect(primarioInfo.ratio).toBeGreaterThan(0);
  });

  it('recalculates when palette colors change', () => {
    const lighterText = { ...palette, texto: { ...palette.texto, hex: '#FFFFFF' } };
    const darkerText = { ...palette, texto: { ...palette.texto, hex: '#111111' } };

    const lighterRatio = getActiveRoleContrastInfo(lighterText, 'texto').ratio;
    const darkerRatio = getActiveRoleContrastInfo(darkerText, 'texto').ratio;

    expect(lighterRatio).not.toBeCloseTo(darkerRatio, 1);
  });
});
