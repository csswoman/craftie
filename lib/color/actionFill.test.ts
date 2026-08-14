import { converter } from 'culori';
import { describe, expect, it } from 'vitest';

import { pickActionFillTokens } from './actionFill';
import { deriveSemanticTokens } from './semanticTokens';

const toOklch = converter('oklch');

describe('pickActionFillTokens', () => {
  it('picks a mid-lightness action step for a dark primary on light chrome', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#F7F7F5', prominence: 1 },
        { hex: '#2F5644', prominence: 0.9 },
        { hex: '#3D6A8A', prominence: 0.4 },
      ],
      theme: 'light',
      overrides: { primary: '#2F5644' },
    });

    const picked = pickActionFillTokens(tokens);
    const lightness = toOklch(tokens[picked.fill].hex)?.l ?? 0;

    expect(['primary-500', 'primary-600']).toContain(picked.fill);
    expect(picked.on).toBe(`on-${picked.fill}`);
    expect(lightness).toBeGreaterThan(0.4);
    expect(lightness).toBeLessThan(0.58);
  });

  it('prefers a tonal action step when dark-theme primary is a washed pastel', () => {
    const tokens = deriveSemanticTokens({
      extracted: [
        { hex: '#1A1214', prominence: 1 },
        { hex: '#E8B4B8', prominence: 0.8 },
        { hex: '#C47A80', prominence: 0.5 },
      ],
      theme: 'dark',
      overrides: { primary: '#E8B4B8' },
    });

    const picked = pickActionFillTokens(tokens);
    const sourceLightness = toOklch(tokens.primary.hex)?.l ?? 1;
    const pickedLightness = toOklch(tokens[picked.fill].hex)?.l ?? 1;

    expect(picked.fill).not.toBe('primary');
    expect(['primary-500', 'primary-600']).toContain(picked.fill);
    expect(picked.on).toBe(`on-${picked.fill}`);
    expect(pickedLightness).toBeLessThan(sourceLightness);
    expect(pickedLightness).toBeGreaterThan(0.4);
    expect(pickedLightness).toBeLessThan(0.6);
  });
});
