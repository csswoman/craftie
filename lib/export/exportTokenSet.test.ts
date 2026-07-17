import { describe, expect, it } from 'vitest';

import type { RolePalette, RoleSlot } from '../color/rolePalette';
import type { FontPair } from '../typography/pairings';
import {
  buildExportTokenSet,
  canExportTokenSet,
  CORE_EXPORT_TOKENS,
} from './exportTokenSet';

function slot(role: keyof RolePalette, hex: string): RoleSlot {
  return { role, hex, name: role, source: 'extracted' };
}

function palette(partial: Partial<Record<keyof RolePalette, string>>): RolePalette {
  const base: Record<keyof RolePalette, string> = {
    fondo: '#FFFFFF',
    superficie: '#F5F5F5',
    texto: '#111111',
    primario: '#3366FF',
    secundario: '#88AAFF',
    acento: '#FFAA00',
    borde: '#DDDDDD',
  };
  const merged = { ...base, ...partial };
  return Object.fromEntries(
    (Object.keys(merged) as (keyof RolePalette)[]).map((role) => [role, slot(role, merged[role])]),
  ) as RolePalette;
}

const emptyOverrides = { light: {}, dark: {} };

describe('buildExportTokenSet', () => {
  it('projects assigned roles to English semantic names (light only)', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: emptyOverrides,
      pairing: null,
      name: 'Test',
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.primary).toEqual({ light: '#3366FF' });
    expect(set.colors.background).toEqual({ light: '#FFFFFF' });
    expect(set.colors['on-background']).toEqual({ light: '#111111' });
    expect(set.colors.surface).toEqual({ light: '#F5F5F5' });
    expect(set.meta.included).toEqual(
      expect.arrayContaining(['primary', 'background', 'on-background', 'surface']),
    );
    expect(set.meta.missingCore).toEqual([]);
    expect(set.typography).toBeUndefined();
  });

  it('includes only explicit semantic overrides, not derived tokens', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: { success: '#228B22', 'data-2': '#AABBCC' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.success).toEqual({ light: '#228B22' });
    expect(set.colors['data-2']).toEqual({ light: '#AABBCC' });
    expect(set.colors['data-3']).toBeUndefined();
    expect(set.colors['on-primary']).toBeUndefined();
  });

  it('attaches dark values only when dark overrides exist', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: {},
        dark: { primary: '#99AABB', success: '#114411' },
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.primary).toEqual({ light: '#3366FF', dark: '#99AABB' });
    expect(set.colors.success).toEqual({ dark: '#114411' });
  });

  it('ignores invalid override hexes', () => {
    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: {
        light: { success: 'not-a-color', warning: '#FFCC00' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.colors.success).toBeUndefined();
    expect(set.colors.warning).toEqual({ light: '#FFCC00' });
  });

  it('lists missingCore when primary/background/on-background absent', () => {
    const set = buildExportTokenSet({
      rolePalette: null,
      tokenOverridesByTheme: {
        light: { accent: '#FFAA00' },
        dark: {},
      },
      pairing: null,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.meta.missingCore).toEqual([...CORE_EXPORT_TOKENS]);
    expect(canExportTokenSet(set)).toBe(false);
  });

  it('includes typography when pairing is present', () => {
    const pairing = {
      id: 'p1',
      displayName: 'Test',
      heading: {
        family: 'Playfair Display',
        googleFontsRef: 'Playfair+Display',
        classification: 'serif',
        contrast: 'high',
        xHeight: 'medium',
        personality: [],
        bestFor: 'heading',
        defaultWeight: 700,
      },
      body: {
        family: 'Source Sans 3',
        googleFontsRef: 'Source+Sans+3',
        classification: 'sans-serif',
        contrast: 'medium',
        xHeight: 'high',
        personality: [],
        bestFor: 'body',
        defaultWeight: 400,
      },
      rationale: '',
      mood: [],
      character: [],
    } satisfies FontPair;

    const set = buildExportTokenSet({
      rolePalette: palette({}),
      tokenOverridesByTheme: emptyOverrides,
      pairing,
      exportedAt: '2026-07-16T00:00:00.000Z',
    });

    expect(set.typography).toEqual({
      heading: { family: 'Playfair Display', weight: 700 },
      body: { family: 'Source Sans 3', weight: 400 },
    });
  });
});
