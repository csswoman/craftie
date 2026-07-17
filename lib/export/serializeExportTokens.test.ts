import { describe, expect, it } from 'vitest';

import type { ExportTokenSet } from './exportTokenSet';
import { toCss, toTokensStudio, toW3cJson } from './serializeExportTokens';

const set: ExportTokenSet = {
  name: 'Test Kit',
  exportedAt: '2026-07-16T00:00:00.000Z',
  colors: {
    primary: { light: '#3366FF', dark: '#99AABB' },
    background: { light: '#FFFFFF' },
    success: { dark: '#114411' },
  },
  typography: {
    heading: { family: 'Playfair Display', weight: 700 },
    body: { family: 'Source Sans 3', weight: 400 },
  },
  meta: { included: ['background', 'primary', 'success'], missingCore: [] },
};

describe('toCss', () => {
  it('emits English custom properties for light and dark', () => {
    const css = toCss(set);

    expect(css).toContain(':root {');
    expect(css).toContain('  --color-primary: #3366FF;');
    expect(css).toContain('  --color-background: #FFFFFF;');
    expect(css).toContain('  --font-heading: "Playfair Display";');
    expect(css).toContain('  --font-body: "Source Sans 3";');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('  --color-primary: #99AABB;');
    expect(css).toContain('  --color-success: #114411;');
    expect(css).not.toContain('--color-primario');
  });
});

describe('toW3cJson', () => {
  it('emits $type/$value groups for color and fontFamily', () => {
    const json = JSON.parse(toW3cJson(set));

    expect(json.color.primary.$type).toBe('color');
    expect(json.color.primary.$value).toBe('#3366FF');
    expect(json.dark.color.primary.$value).toBe('#99AABB');
    expect(json.dark.color.success.$value).toBe('#114411');
    expect(json.fontFamily.heading.$type).toBe('fontFamily');
    expect(json.fontFamily.heading.$value).toBe('Playfair Display');
  });
});

describe('toTokensStudio', () => {
  it('emits Tokens Studio token sets for light/dark', () => {
    const json = JSON.parse(toTokensStudio(set));

    expect(json.light.color.primary).toEqual({ value: '#3366FF', type: 'color' });
    expect(json.dark.color.primary).toEqual({ value: '#99AABB', type: 'color' });
    expect(json.dark.color.success).toEqual({ value: '#114411', type: 'color' });
    expect(json.light.fontFamilies.heading).toEqual({
      value: 'Playfair Display',
      type: 'fontFamilies',
    });
    expect(json.$metadata.tokenSetOrder).toEqual(['light', 'dark']);
  });
});
