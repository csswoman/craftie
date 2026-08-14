import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import {
  deriveSemanticTokens,
  ensureSurfaceLightnessSeparation,
  MIN_BG_SURFACE_LIGHTNESS_DELTA,
} from './semanticTokens';

const toOklch = converter('oklch');
const MIN_DELTA = 0.035;

describe('background/surface lightness separation', () => {
  it('keeps light theme surface at least MIN_DELTA away from background', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'light',
      synthesisStrategy: 'analogous',
    });
    const bg = toOklch(tokens.background.hex)?.l ?? 0;
    const surface = toOklch(tokens.surface.hex)?.l ?? 0;
    const border = toOklch(tokens.border.hex)?.l ?? 0;

    expect(Math.abs(bg - surface)).toBeGreaterThanOrEqual(MIN_DELTA - 1e-6);
    expect(surface).toBeGreaterThanOrEqual(Math.min(bg, border) - 1e-6);
    expect(surface).toBeLessThanOrEqual(Math.max(bg, border) + 1e-6);
  });

  it('keeps dark theme surface at least MIN_DELTA away from background', () => {
    const tokens = deriveSemanticTokens({
      extracted: [{ hex: '#3366CC', prominence: 1 }],
      theme: 'dark',
      synthesisStrategy: 'analogous',
    });
    const bg = toOklch(tokens.background.hex)?.l ?? 0;
    const surface = toOklch(tokens.surface.hex)?.l ?? 0;
    const border = toOklch(tokens.border.hex)?.l ?? 0;

    expect(Math.abs(bg - surface)).toBeGreaterThanOrEqual(MIN_DELTA - 1e-6);
    expect(surface).toBeGreaterThanOrEqual(Math.min(bg, border) - 1e-6);
    expect(surface).toBeLessThanOrEqual(Math.max(bg, border) + 1e-6);
  });

  it('pushes surface away when delta is below threshold', () => {
    const bg = '#FAFAFA';
    const same = '#FAFAFA';
    const border = '#E0E0E0';
    const next = ensureSurfaceLightnessSeparation(bg, same, border, 'light');
    const bgL = toOklch(bg)?.l ?? 0;
    const nextL = toOklch(next)?.l ?? 0;

    expect(Math.abs(bgL - nextL)).toBeGreaterThanOrEqual(
      MIN_BG_SURFACE_LIGHTNESS_DELTA - 1e-6,
    );
  });
});
