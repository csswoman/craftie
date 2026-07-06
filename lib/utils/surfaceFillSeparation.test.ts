import { describe, expect, it } from 'vitest';

import { converter } from 'culori';

import { assignRolesFromHexes } from '../color/rolePalette';
import { deriveFondo, deriveSuperficie } from './deriveRoles';
import { primaryButtonVariant } from './buttonVariants';
import {
  deriveSeparatedHueSurface,
  hasAdequateSurfaceFillSeparation,
  intensityDelta,
  MIN_SURFACE_FILL_INTENSITY_DELTA,
} from './surfaceFillSeparation';

const toOklch = converter('oklch');

describe('surfaceFillSeparation', () => {
  const fondo = deriveFondo(260, 'light');
  const fill = '#3366CC';

  it('derives surface as a fondo mix capped at 6%', () => {
    const surface = deriveSeparatedHueSurface(fondo, fill, 'light');

    expect(hasAdequateSurfaceFillSeparation(surface, fill)).toBe(true);
    expect(intensityDelta(surface, fill)).toBeGreaterThanOrEqual(MIN_SURFACE_FILL_INTENSITY_DELTA);
    expect((toOklch(surface)?.c ?? 0)).toBeLessThan(toOklch(fill)?.c ?? 1);
  });

  it('keeps card and brand filled button visually distinct for the same hue', () => {
    const palette = assignRolesFromHexes(['#F7F7F5', '#3366CC', '#E8D44D']);
    const surface = palette.superficie.hex;
    const buttonFill = primaryButtonVariant(palette, 'filled').backgroundColor;

    expect(buttonFill).toBe(palette.primario.hex);
    expect(hasAdequateSurfaceFillSeparation(surface, buttonFill)).toBe(true);
    expect((toOklch(surface)?.c ?? 0)).toBeLessThan((toOklch(buttonFill)?.c ?? 0) * 0.65);
  });

  it('reduces surface tint further when primario is muted', () => {
    const mutedFill = '#9CB3D9';
    const vividSurface = deriveSeparatedHueSurface(fondo, fill, 'light');
    const mutedSurface = deriveSeparatedHueSurface(fondo, mutedFill, 'light');

    expect(intensityDelta(vividSurface, fill)).toBeGreaterThanOrEqual(
      MIN_SURFACE_FILL_INTENSITY_DELTA,
    );
    expect(intensityDelta(mutedSurface, mutedFill)).toBeGreaterThanOrEqual(
      MIN_SURFACE_FILL_INTENSITY_DELTA,
    );
    expect(deriveSuperficie(fondo, mutedFill, 'light')).toBe(mutedSurface);
  });
});
