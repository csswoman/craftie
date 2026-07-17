import { describe, expect, it } from 'vitest';

import {
  ACCENT_FAMILY_SIZE,
  accentFamilyCompanionTokens,
  accentFamilyLabel,
  accentFamilyOccupiedHexes,
  accentFamilyPrimaryToken,
  accentFamilySlotTokens,
  accentSlotHex,
  applyAccentSlotToOverrides,
  buildAccentVaryCandidates,
  counterpartRoleForAccentFamilySync,
  isChromaticAccentCandidate,
  isAccentSlotAssigned,
  nextAccentSlotHex,
  syncAccentFamilyOverrides,
  varyAccentSlotHex,
} from './accentFamily';
import { deriveFromPrimary } from './uiColorCandidates';
import { deriveSemanticTokens } from './semanticTokens';
import { normalizeHex } from './normalizeHex';
import { hexToOklchChannels } from '../utils/colorMath';

function sampleTokens() {
  return deriveSemanticTokens({
    extracted: [
      { hex: '#5B4DC9', prominence: 0.6 },
      { hex: '#C85A22', prominence: 0.4 },
    ],
    paletteType: 'vivid',
  });
}

describe('accentFamily', () => {
  it('maps slot 0 to accent + data-1 and later slots to data-2…data-6', () => {
    expect(ACCENT_FAMILY_SIZE).toBe(6);
    expect(accentFamilySlotTokens(0)).toEqual(['accent', 'data-1']);
    expect(accentFamilyPrimaryToken(0)).toBe('data-1');
    expect(accentFamilySlotTokens(1)).toEqual(['data-2']);
    expect(accentFamilySlotTokens(5)).toEqual(['data-6']);
    expect(accentFamilyLabel(0)).toBe('Acento 1');
    expect(accentFamilyLabel(5)).toBe('Acento 6');
  });

  it('resolves counterpart role for accent-family tokens across themes', () => {
    expect(counterpartRoleForAccentFamilySync('accent')).toBe('acento');
    expect(counterpartRoleForAccentFamilySync('data-1')).toBe('acento');
    expect(counterpartRoleForAccentFamilySync('data-2')).toBe('acento');
    expect(counterpartRoleForAccentFamilySync('data-6')).toBe('acento');
    expect(counterpartRoleForAccentFamilySync('primary')).toBe('primario');
    expect(counterpartRoleForAccentFamilySync('success')).toBeNull();
  });

  it('syncs accent and data-1 overrides in both directions', () => {
    expect(accentFamilyCompanionTokens('accent')).toEqual(['data-1']);
    expect(accentFamilyCompanionTokens('data-1')).toEqual(['accent']);
    expect(accentFamilyCompanionTokens('data-3')).toEqual([]);

    expect(syncAccentFamilyOverrides({ primary: '#111111' }, 'accent', '#FF00AA')).toEqual({
      primary: '#111111',
      accent: '#FF00AA',
      'data-1': '#FF00AA',
    });
    expect(syncAccentFamilyOverrides({}, 'data-1', '#00AAFF')).toEqual({
      accent: '#00AAFF',
      'data-1': '#00AAFF',
    });
    expect(syncAccentFamilyOverrides({}, 'data-4', '#ABCDEF')).toEqual({
      'data-4': '#ABCDEF',
    });
  });

  it('applies slot 0 to accent + data-1 and other slots only to their data token', () => {
    expect(applyAccentSlotToOverrides({}, 0, '#AABBCC')).toEqual({
      accent: '#AABBCC',
      'data-1': '#AABBCC',
    });
    expect(applyAccentSlotToOverrides({ accent: '#111111' }, 2, '#222222')).toEqual({
      accent: '#111111',
      'data-3': '#222222',
    });
  });

  it('reads assigned hexes and occupied neighbors for derivation', () => {
    const tokens = sampleTokens();
    expect(isAccentSlotAssigned(tokens, 0)).toBe(true);
    expect(accentSlotHex(tokens, 0)).toBe(normalizeHex(tokens.accent.hex));

    const occupied = accentFamilyOccupiedHexes(tokens, 0);
    expect(occupied.length).toBeGreaterThan(0);
    for (let index = 1; index < ACCENT_FAMILY_SIZE; index += 1) {
      const hex = accentSlotHex(tokens, index);
      if (hex) expect(occupied).toContain(hex);
    }

    const withGap = {
      ...tokens,
      'data-2': { ...tokens['data-2'], gap: 'pending' },
    };
    expect(isAccentSlotAssigned(withGap, 1)).toBe(false);
    expect(accentSlotHex(withGap, 1)).toBeNull();
    expect(accentFamilyOccupiedHexes(withGap, 0)).not.toContain(normalizeHex(tokens['data-2'].hex));
  });

  it('derives distinct accent-family colors when slots are occupied', () => {
    const tokens = sampleTokens();
    const first = deriveFromPrimary(tokens.primary.hex);
    const second = deriveFromPrimary(tokens.primary.hex, [first]);
    const third = deriveFromPrimary(tokens.primary.hex, [first, second]);

    expect(normalizeHex(second)).not.toBe(normalizeHex(first));
    expect(normalizeHex(third)).not.toBe(normalizeHex(first));
    expect(normalizeHex(third)).not.toBe(normalizeHex(second));
  });

  it('varies slot 0 as an accent role and later slots away from occupied family hexes', () => {
    const tokens = sampleTokens();
    const slot0 = varyAccentSlotHex(tokens, 0, {}, () => 0.25);
    const slot1 = varyAccentSlotHex(tokens, 1);
    const occupied = accentFamilyOccupiedHexes(tokens, 1);

    expect(normalizeHex(slot0)).toMatch(/^#[0-9a-f]{6}$/i);
    expect(occupied).not.toContain(normalizeHex(slot1));
  });

  it('builds vary candidates from similar colors excluding current and occupied hexes', () => {
    const base = '#345B46';
    const candidates = buildAccentVaryCandidates(base, ['#2A4A38']);

    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates).not.toContain(normalizeHex(base));
    expect(candidates).not.toContain(normalizeHex('#2A4A38'));
    expect(candidates.every((hex) => isChromaticAccentCandidate(hex))).toBe(true);
  });

  it('keeps vary candidates away from near-white and near-black neutrals', () => {
    const candidates = buildAccentVaryCandidates('#E8D44D', ['#F4A261']);

    expect(candidates.length).toBeGreaterThan(2);
    for (const hex of candidates) {
      const { l, c } = hexToOklchChannels(hex);
      expect(c).toBeGreaterThanOrEqual(0.06);
      expect(l).toBeGreaterThanOrEqual(0.28);
      expect(l).toBeLessThanOrEqual(0.78);
    }
  });

  it('cycles through multiple similar colors on repeated vary clicks', () => {
    const tokens = sampleTokens();
    const base = accentSlotHex(tokens, 1)!;
    const candidates = buildAccentVaryCandidates(base, accentFamilyOccupiedHexes(tokens, 1));
    expect(candidates.length).toBeGreaterThan(1);

    const first = nextAccentSlotHex(tokens, 1, 0);
    const second = nextAccentSlotHex(tokens, 1, first.nextCursor);

    expect(normalizeHex(first.hex)).not.toBe(normalizeHex(base));
    expect(normalizeHex(second.hex)).not.toBe(normalizeHex(first.hex));
    expect(isChromaticAccentCandidate(first.hex)).toBe(true);
    expect(isChromaticAccentCandidate(second.hex)).toBe(true);
  });

  it('still produces chromatic colors after many vary steps from a vivid base', () => {
    let tokens = sampleTokens();
    let cursor = 0;

    for (let step = 0; step < 12; step += 1) {
      const next = nextAccentSlotHex(tokens, 0, cursor);
      expect(isChromaticAccentCandidate(next.hex)).toBe(true);
      tokens = {
        ...tokens,
        accent: { ...tokens.accent, hex: next.hex, gap: undefined },
        'data-1': { ...tokens['data-1'], hex: next.hex, gap: undefined },
      };
      cursor = next.nextCursor;
    }
  });
});
