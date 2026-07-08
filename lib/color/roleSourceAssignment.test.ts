import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import { contrastRatio } from '../utils/colorMath';
import type { ExtractedColor } from './imageExtractor';
import { normalizeHex } from './normalizeHex';
import { assignRolesFromExtracted, mergeRolePalettePreservingLocks, PALETTE_ROLE_ORDER } from './rolePalette';
import { assignSourceRoles, passesTextOn } from './roleSourceAssignment';

const toOklch = converter('oklch');

const RICH_EXTRACTION: ExtractedColor[] = [
  { hex: '#F7F7F5', prominence: 0.3 },
  { hex: '#EFEFE8', prominence: 0.15 },
  { hex: '#9ADBD6', prominence: 0.2 },
  { hex: '#E8D44D', prominence: 0.15 },
  { hex: '#F4A261', prominence: 0.1 },
  { hex: '#2C3E50', prominence: 0.1 },
];

const EXTRACTION_SAMPLES: ExtractedColor[][] = [
  RICH_EXTRACTION,
  [
    { hex: '#E8E8E8', prominence: 0.5 },
    { hex: '#D0D0D0', prominence: 0.3 },
    { hex: '#C8C8C8', prominence: 0.2 },
  ],
  [
    { hex: '#7563FF', prominence: 0.4 },
    { hex: '#A5F085', prominence: 0.35 },
    { hex: '#1E1E1F', prominence: 0.25 },
  ],
  [{ hex: '#7563FF', prominence: 1 }],
  [
    { hex: '#FFFFFF', prominence: 0.4 },
    { hex: '#F0F0F0', prominence: 0.2 },
    { hex: '#111111', prominence: 0.2 },
    { hex: '#3366CC', prominence: 0.2 },
  ],
];

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

describe('assignSourceRoles', () => {
  it('uses more than two source colors when the extraction is rich', () => {
    const { roles } = assignSourceRoles(RICH_EXTRACTION);
    const sourceBacked = PALETTE_ROLE_ORDER.filter(
      (role) => roles[role].source !== 'derived',
    );

    expect(sourceBacked.length).toBeGreaterThan(2);
  });

  it('always yields texto passing AA against fondo and superficie', () => {
    for (const extraction of EXTRACTION_SAMPLES) {
      const { roles } = assignSourceRoles(extraction);

      expect(contrastRatio(roles.texto.hex, roles.fondo.hex)).toBeGreaterThanOrEqual(4.5);
      expect(
        contrastRatio(roles.texto.hex, roles.superficie.hex),
      ).toBeGreaterThanOrEqual(4.5);
      expect(passesTextOn(roles.texto.hex, roles.fondo.hex, roles.superficie.hex)).toBe(
        true,
      );
    }
  });

  it('keeps borde visible but subtle against superficie', () => {
    for (const extraction of EXTRACTION_SAMPLES) {
      const { roles } = assignSourceRoles(extraction);
      const ratio = contrastRatio(roles.borde.hex, roles.superficie.hex);

      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThanOrEqual(2.5);
    }
  });

  it('reuses a source neutral for borde when it sits close to superficie', () => {
    const { roles } = assignSourceRoles([
      { hex: '#E8E8E8', prominence: 0.5 },
      { hex: '#D0D0D0', prominence: 0.3 },
      { hex: '#C8C8C8', prominence: 0.2 },
    ]);

    expect(roles.borde.source).toBe('extracted');
    expect([normalizeHex('#D0D0D0'), normalizeHex('#C8C8C8')]).toContain(
      normalizeHex(roles.borde.hex),
    );
  });

  it('corrects a near-miss chromatic minimally in OKLCH preserving hue', () => {
    const source = '#20124D';
    const { roles } = assignSourceRoles([
      { hex: '#F7F7F5', prominence: 0.6 },
      { hex: source, prominence: 0.4 },
    ]);

    expect(roles.primario.source).toBe('corrected');

    const original = toOklch(normalizeHex(source));
    const corrected = toOklch(roles.primario.hex);

    expect(hueDistance(corrected?.h ?? 0, original?.h ?? 0)).toBeLessThanOrEqual(15);
    expect(corrected?.l ?? 0).toBeGreaterThanOrEqual(0.32);
    expect(corrected?.c ?? 0).toBeGreaterThan(0.04);
  });

  it('keeps extracted expressive colors when they already pass semantic contrast', () => {
    const palette = assignRolesFromExtracted([
      { hex: '#F7F7F5', prominence: 0.6 },
      { hex: '#20124D', prominence: 0.4 },
    ]);

    expect(palette.primario.source).toBe('extracted');
    expect(normalizeHex(palette.primario.hex)).toBe(normalizeHex('#20124D'));
  });

  it('does not overwrite locked roles when a new extraction is merged', () => {
    const current = assignRolesFromExtracted(RICH_EXTRACTION);
    const lockedFondo = current.fondo.hex;
    const lockedTexto = current.texto.hex;
    const reassigned = assignRolesFromExtracted([
      { hex: '#FFFFFF', prominence: 0.5 },
      { hex: '#FF0000', prominence: 0.3 },
      { hex: '#00FF00', prominence: 0.2 },
    ]);

    const merged = mergeRolePalettePreservingLocks(current, reassigned, ['fondo', 'texto']);

    expect(merged.fondo.hex).toBe(lockedFondo);
    expect(merged.texto.hex).toBe(lockedTexto);
    expect(merged.primario.hex).toBe(reassigned.primario.hex);
  });
});
