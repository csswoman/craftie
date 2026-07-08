import { describe, expect, it } from 'vitest';

import { normalizeHex } from './normalizeHex';
import { assignRolesFromExtracted } from './rolePalette';
import {
  borderRoleFitness,
  brandScore,
  chromaticRoleFitness,
  pickBestChromaticRole,
} from './roleFitness';

describe('roleFitness', () => {
  it('rejects dark navy as usable chromatic accent', () => {
    const navy = {
      hex: '#0E293D',
      prominence: 0.2,
      lightness: 0.22,
      chroma: 0.04,
      hue: 220,
      isNeutral: true,
    };

    expect(chromaticRoleFitness(navy, 'secundario')).toBeLessThan(0);
  });

  it('accepts mid-lightness teal as chromatic role', () => {
    const teal = {
      hex: '#71CBC0',
      prominence: 0.25,
      lightness: 0.78,
      chroma: 0.09,
      hue: 175,
      isNeutral: false,
    };

    expect(chromaticRoleFitness(teal, 'secundario')).toBeGreaterThan(0);
  });

  it('prefers subtle border contrast against superficie', () => {
    const subtle = {
      hex: '#D9D5CE',
      prominence: 0.1,
      lightness: 0.86,
      chroma: 0.02,
      hue: 80,
      isNeutral: true,
    };
    const strongBrown = {
      hex: '#8F7557',
      prominence: 0.15,
      lightness: 0.55,
      chroma: 0.08,
      hue: 70,
      isNeutral: false,
    };

    expect(borderRoleFitness(subtle, '#F0F0F0')).toBeGreaterThan(
      borderRoleFitness(strongBrown, '#F0F0F0'),
    );
  });

  it('prefers teal over dark navy for secundario in real assignment', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#FFFFFF', prominence: 0.2 },
      { hex: '#F0F0F0', prominence: 0.1 },
      { hex: '#0E293D', prominence: 0.15 },
      { hex: '#71CBC0', prominence: 0.25 },
      { hex: '#F6D27C', prominence: 0.2 },
    ]);

    const chromaticRoles = [
      palette.primario.hex,
      palette.secundario.hex,
      palette.acento.hex,
    ].map((hex) => normalizeHex(hex));

    expect(chromaticRoles).not.toContain(normalizeHex('#0E293D'));
    expect(palette.secundario.hex).toBeTruthy();
  });

  it('scores vivid colors above frequent muted ones', () => {
    const mutedFrequent = {
      hex: '#9ADBD6',
      prominence: 0.55,
      lightness: 0.82,
      chroma: 0.06,
      hue: 180,
      isNeutral: false,
    };
    const vividRare = {
      hex: '#3366CC',
      prominence: 0.08,
      lightness: 0.52,
      chroma: 0.18,
      hue: 260,
      isNeutral: false,
    };

    expect(brandScore(vividRare)).toBeGreaterThan(brandScore(mutedFrequent));
  });

  it('prefers vivid minority accent over dominant neutral for primario', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#E8E8E8', prominence: 0.62 },
      { hex: '#F0F0F0', prominence: 0.18 },
      { hex: '#3366CC', prominence: 0.07 },
      { hex: '#E8D44D', prominence: 0.05 },
    ]);

    expect(normalizeHex(palette.primario.hex)).toBe(normalizeHex('#3366CC'));
    expect(palette.fondo.source).toBe('derived');
    expect(normalizeHex(palette.fondo.hex)).not.toBe(normalizeHex('#F0F0F0'));
  });

  it('picks highest brandScore chromatic when anchors are empty', () => {
    const pool = [
      {
        hex: '#F6D27C',
        prominence: 0.2,
        lightness: 0.84,
        chroma: 0.12,
        hue: 85,
        isNeutral: false,
      },
      {
        hex: '#71CBC0',
        prominence: 0.55,
        lightness: 0.78,
        chroma: 0.09,
        hue: 175,
        isNeutral: false,
      },
    ];

    const picked = pickBestChromaticRole(pool, new Set(), [], 'primario');

    expect(picked?.hex).toBe('#F6D27C');
  });
});
