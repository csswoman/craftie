import { describe, expect, it } from 'vitest';

import { contrastRatio, bestTextOn } from '../utils/colorMath';
import { getFailingContrastRoles, suggestRoleContrastFixes } from './roleContrastFixes';
import { assignRolesFromHexes, type RolePalette } from './rolePalette';

function withPrimary(palette: RolePalette, hex: string): RolePalette {
  return { ...palette, primario: { ...palette.primario, hex } };
}

describe('suggestRoleContrastFixes', () => {
  it('shifts a mid-tone primary until its filled button reaches AA', () => {
    const base = assignRolesFromHexes(['#FBFAF8', '#2F6FED', '#E4572E', '#1A1A1A']);
    const palette = withPrimary(base, '#CF4174');

    expect(getFailingContrastRoles(palette).has('primario')).toBe(true);

    const fix = suggestRoleContrastFixes(palette).find((entry) => entry.role === 'primario');

    expect(fix).toBeDefined();
    expect(fix!.fromHex).toBe('#CF4174');
    expect(contrastRatio(bestTextOn(fix!.toHex), fix!.toHex)).toBeGreaterThanOrEqual(4.5);
    expect(getFailingContrastRoles(withPrimary(palette, fix!.toHex)).has('primario')).toBe(false);
  });

  it('returns no fixes when every role passes', () => {
    const palette = assignRolesFromHexes(['#FFFFFF', '#1F4FB8', '#111111']);
    const failing = getFailingContrastRoles(palette);
    const fixes = suggestRoleContrastFixes(palette);

    expect(fixes.every((fix) => failing.has(fix.role))).toBe(true);
  });
});
