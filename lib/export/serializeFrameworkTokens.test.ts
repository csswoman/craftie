import { describe, expect, it } from 'vitest';

import type { ExportTokenSet } from './exportTokenSet';
import { toShadcnTheme, toTailwindTheme } from './serializeFrameworkTokens';

const set: ExportTokenSet = {
  name: 'test',
  exportedAt: '2026-01-01T00:00:00.000Z',
  colors: {
    background: { light: '#ffffff', dark: '#111111' },
    'on-background': { light: '#111111', dark: '#f5f5f5' },
    surface: { light: '#f4f4f4', dark: '#1c1c1c' },
    primary: { light: '#1f6f54', dark: '#5bbf99' },
    'on-primary': { light: '#ffffff', dark: '#06130e' },
    error: { light: '#b3261e', dark: '#f2b8b5' },
    'data-1': { light: '#1f6f54' },
  },
  typography: {
    heading: { family: 'Playfair Display' },
    body: { family: 'Inter' },
    roles: {
      hero: { family: 'heading', weight: 700, size: 48, lineHeight: 1.1, letterSpacing: -0.02, uppercase: false },
    },
  },
  meta: { included: [], missingCore: [] },
};

describe('toTailwindTheme', () => {
  it('puts light values in @theme and dark overrides in data-theme', () => {
    const css = toTailwindTheme(set);
    expect(css).toContain('@theme {');
    expect(css).toContain('--color-primary: #1f6f54;');
    expect(css).toContain('[data-theme="dark"] {');
    expect(css).toContain('--color-primary: #5bbf99;');
  });

  it('exports fonts and type roles with Tailwind v4 variable names', () => {
    const css = toTailwindTheme(set);
    expect(css).toContain('--font-heading: "Playfair Display", sans-serif;');
    expect(css).toContain('--text-hero: 3rem;');
    expect(css).toContain('--text-hero--line-height: 1.1;');
    expect(css).toContain('--text-hero--letter-spacing: -0.02em;');
    expect(css).toContain('--text-hero--font-weight: 700;');
  });
});

describe('toShadcnTheme', () => {
  it('maps Craftie roles to shadcn variables for both themes', () => {
    const css = toShadcnTheme(set);
    expect(css).toContain('--background: #ffffff;');
    expect(css).toContain('--foreground: #111111;');
    expect(css).toContain('--primary-foreground: #ffffff;');
    expect(css).toContain('--destructive: #b3261e;');
    expect(css).toContain('.dark {');
    expect(css).toContain('--primary: #5bbf99;');
  });

  it('falls back to related tokens and skips variables with no source', () => {
    const css = toShadcnTheme(set);
    expect(css).toContain('--card: #f4f4f4;');
    expect(css).toContain('--card-foreground: #111111;');
    expect(css).not.toContain('--chart-2:');
  });

  it('adds a destructive fallback when no error color is confirmed', () => {
    const css = toShadcnTheme({ ...set, colors: { ...set.colors, error: {} } });
    expect(css).toContain('--destructive: #b3261e;');
    expect(css).toContain('--destructive: #f2b8b5;');
  });

  it('bridges only the variables it defines into Tailwind', () => {
    const css = toShadcnTheme(set);
    expect(css).toContain('--color-primary: var(--primary);');
    expect(css).toContain('--color-chart-1: var(--chart-1);');
    expect(css).not.toContain('--color-chart-2');
  });
});
