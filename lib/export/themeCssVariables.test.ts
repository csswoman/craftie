import { describe, expect, it } from 'vitest';

import type { ExportTokenSet } from './exportTokenSet';
import { toShadcnTheme } from './serializeFrameworkTokens';
import { auditShadcnTheme } from './shadcnThemeAudit';
import { SAMPLE_SHADCN_THEME, themePreviewProperties } from './themePreviewStyle';
import {
  MAX_THEME_CSS_LENGTH,
  parseThemeCssVariables,
  resolveThemeColor,
} from './themeCssVariables';

const set: ExportTokenSet = {
  name: 'test',
  exportedAt: '2026-01-01T00:00:00.000Z',
  colors: {
    background: { light: '#ffffff', dark: '#111111' },
    'on-background': { light: '#111111', dark: '#f5f5f5' },
    surface: { light: '#f4f4f4', dark: '#1c1c1c' },
    'on-background-muted': { light: '#5c5c5c', dark: '#a8a8a8' },
    primary: { light: '#1f6f54', dark: '#5bbf99' },
    'on-primary': { light: '#ffffff', dark: '#06130e' },
    error: { light: '#b3261e', dark: '#f2b8b5' },
  },
  meta: { included: [], missingCore: [] },
};

describe('parseThemeCssVariables', () => {
  it('reads :root as light and .dark as dark, ignoring @theme', () => {
    const vars = parseThemeCssVariables(`
      /* comment { --ignored: red; } */
      :root { --background: #fff; --radius: 0.5rem; }
      .dark { --background: oklch(0.2 0 0); }
      @theme inline { --color-background: var(--background); }
      .button { --background: red; }
    `);

    expect(vars.light).toEqual({ background: '#fff', radius: '0.5rem' });
    expect(vars.dark).toEqual({ background: 'oklch(0.2 0 0)' });
  });

  it('accepts data-theme dark selectors and selector lists', () => {
    const vars = parseThemeCssVariables(':root, [data-theme="dark"] { --ring: #000; }');
    expect(vars.light.ring).toBe('#000');
    expect(vars.dark.ring).toBe('#000');
  });

  it('treats oversized input as empty', () => {
    const vars = parseThemeCssVariables(`:root { --a: #fff; }${' '.repeat(MAX_THEME_CSS_LENGTH)}`);
    expect(vars).toEqual({ light: {}, dark: {} });
  });
});

describe('resolveThemeColor', () => {
  const vars = parseThemeCssVariables(`
    :root { --brand: hsl(160 56% 28%); --primary: var(--brand); --see-through: rgb(0 0 0 / 50%); --size: 4px; }
    .dark { --brand: oklch(0.75 0.1 160); }
  `);

  it('follows var() references within the mode, and dark inherits light', () => {
    expect(resolveThemeColor(vars, 'light', 'primary')).toMatch(/^#[0-9A-F]{6}$/);
    expect(resolveThemeColor(vars, 'dark', 'primary')).not.toBe(resolveThemeColor(vars, 'light', 'primary'));
  });

  it('rejects missing, translucent and non-color values', () => {
    expect(resolveThemeColor(vars, 'light', 'nope')).toBeNull();
    expect(resolveThemeColor(vars, 'light', 'see-through')).toBeNull();
    expect(resolveThemeColor(vars, 'light', 'size')).toBeNull();
  });
});

describe('auditShadcnTheme', () => {
  it('audits the Craftie shadcn export in both modes', () => {
    const audit = auditShadcnTheme(parseThemeCssVariables(toShadcnTheme(set)));

    expect(audit.modes).toEqual(['light', 'dark']);
    const page = audit.results.find((result) => result.id === 'page' && result.mode === 'light');
    expect(page).toMatchObject({ foregroundHex: '#111111', backgroundHex: '#FFFFFF', required: 4.5, passes: true });
    const ring = audit.results.find((result) => result.id === 'ring');
    expect(ring?.required).toBe(3);
    expect(audit.failures).toBe(audit.results.filter((result) => !result.passes).length);
  });

  it('reports failing and uncheckable pairs', () => {
    const audit = auditShadcnTheme(
      parseThemeCssVariables(':root { --background: #ffffff; --foreground: #bbbbbb; }'),
    );

    expect(audit.modes).toEqual(['light']);
    expect(audit.results).toHaveLength(1);
    expect(audit.results[0].passes).toBe(false);
    expect(audit.failures).toBe(1);
    expect(audit.missing.some((entry) => entry.id === 'primary')).toBe(true);
  });

  it('ships a sample theme that passes every pair in both modes', () => {
    const audit = auditShadcnTheme(parseThemeCssVariables(SAMPLE_SHADCN_THEME));
    expect(audit.modes).toEqual(['light', 'dark']);
    expect(audit.missing).toEqual([]);
    expect(audit.failures).toBe(0);
  });
});

describe('themePreviewProperties', () => {
  it('passes only resolved colors and a plain radius', () => {
    const vars = parseThemeCssVariables(
      ':root { --background: url(https://example.com/x.png); --primary: #123456; --radius: calc(1px + 1rem); }',
    );
    expect(themePreviewProperties(vars, 'light')).toEqual({ '--primary': '#123456' });
  });
});
