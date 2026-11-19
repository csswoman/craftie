import { describe, expect, it } from 'vitest';

import { hexToOklchChannels } from '../utils/colorMath';
import { getFailingContrastRoles, suggestRoleLightnessFix } from './roleContrastFixes';
import { assignRolesFromHexes, type PaletteRoleId, type RolePalette } from './rolePalette';
import { deltaEOK, solveSystemContrast } from './systemContrastSolver';

function withRoles(palette: RolePalette, hexByRole: Partial<Record<PaletteRoleId, string>>): RolePalette {
  const next = { ...palette };
  for (const [role, hex] of Object.entries(hexByRole) as Array<[PaletteRoleId, string]>) {
    next[role] = { ...next[role], hex };
  }
  return next;
}

const base = assignRolesFromHexes(['#FBFAF8', '#2F6FED', '#E4572E', '#1A1A1A']);
const broken = withRoles(base, { primario: '#CF4174', texto: '#9A9A9A' });

describe('deltaEOK', () => {
  it('is zero for identical colors and symmetric', () => {
    expect(deltaEOK('#336699', '#336699')).toBe(0);
    expect(deltaEOK('#336699', '#993366')).toBeCloseTo(deltaEOK('#993366', '#336699'), 10);
  });

  it('spans roughly 1 between black and white', () => {
    expect(deltaEOK('#000000', '#FFFFFF')).toBeCloseTo(1, 2);
  });
});

describe('solveSystemContrast', () => {
  it('fixes several failing roles in one solution', () => {
    const failing = getFailingContrastRoles(broken);
    expect(failing.size).toBeGreaterThanOrEqual(2);

    const solution = solveSystemContrast(broken);

    expect(solution.unresolved).toEqual([]);
    expect(getFailingContrastRoles(solution.palette).size).toBe(0);
    expect(solution.changes.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps hue and changes only failing roles', () => {
    const failing = getFailingContrastRoles(broken);
    const solution = solveSystemContrast(broken);

    for (const change of solution.changes) {
      expect(failing.has(change.role)).toBe(true);
      const from = hexToOklchChannels(change.fromHex);
      const to = hexToOklchChannels(change.toHex);
      if (from.c > 0.03 && to.c > 0.03) {
        expect(Math.abs(from.h - to.h)).toBeLessThan(4);
      }
    }
  });

  it('never moves more than the single-role fix', () => {
    const palette = withRoles(base, { primario: '#CF4174' });
    const single = suggestRoleLightnessFix(palette, 'primario');
    const solution = solveSystemContrast(palette);
    const change = solution.changes.find((entry) => entry.role === 'primario');

    expect(single).not.toBeNull();
    expect(change).toBeDefined();
    expect(change!.deltaE).toBeLessThanOrEqual(deltaEOK('#CF4174', single!) + 1e-9);
  });

  it('leaves locked roles untouched and reports them as unresolved', () => {
    const solution = solveSystemContrast(broken, { lockedRoles: ['primario'] });

    expect(solution.palette.primario.hex).toBe(broken.primario.hex);
    expect(solution.changes.some((change) => change.role === 'primario')).toBe(false);
    expect(solution.unresolved).toContain('primario');
  });

  it('returns no changes for a palette that already passes', () => {
    const solution = solveSystemContrast(base);

    if (getFailingContrastRoles(base).size === 0) {
      expect(solution.changes).toEqual([]);
      expect(solution.totalDeltaE).toBe(0);
    }
    expect(solution.unresolved).toEqual([...getFailingContrastRoles(base)].sort());
  });
});
