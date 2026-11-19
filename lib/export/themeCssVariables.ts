import { formatHex, parse } from 'culori';

/**
 * Reads the color variables a theme stylesheet defines for light and dark
 * mode, the way a consuming app would: `:root` is light; `.dark` and
 * `[data-theme="dark"]` override it. Anything else (`@theme`, `@layer`,
 * component rules) is ignored. Values may be any CSS color (HEX, rgb, hsl,
 * oklch…) or a `var()` reference to another variable in the same mode.
 */

export type ThemeMode = 'light' | 'dark';

export type ThemeCssVariables = Record<ThemeMode, Record<string, string>>;

/** Upper bound for pasted stylesheets; larger input is treated as empty. */
export const MAX_THEME_CSS_LENGTH = 100_000;

const LIGHT_SELECTORS = new Set([':root', 'html', ':host']);
const DARK_SELECTORS = new Set(['.dark', '[data-theme="dark"]', "[data-theme='dark']", ':root.dark', 'html.dark']);

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Top-level `selector { body }` rules; nested at-rule blocks are skipped whole. */
function topLevelRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  let depth = 0;
  let start = 0;
  let selector = '';

  for (let i = 0; i < css.length; i += 1) {
    const char = css[i];
    if (char === '{') {
      if (depth === 0) {
        selector = css.slice(start, i).trim();
        start = i + 1;
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth < 0) return rules;
      if (depth === 0) {
        rules.push({ selector, body: css.slice(start, i) });
        start = i + 1;
      }
    } else if (char === ';' && depth === 0) {
      start = i + 1;
    }
  }

  return rules;
}

function declarations(body: string): Array<[string, string]> {
  const result: Array<[string, string]> = [];
  for (const match of body.matchAll(/--([\w-]+)\s*:\s*([^;{}]+)/g)) {
    result.push([match[1], match[2].trim()]);
  }
  return result;
}

function modesFor(selector: string): ThemeMode[] {
  const parts = selector.split(',').map((part) => part.trim().replace(/\s+/g, ' '));
  const modes = new Set<ThemeMode>();
  for (const part of parts) {
    if (LIGHT_SELECTORS.has(part)) modes.add('light');
    if (DARK_SELECTORS.has(part)) modes.add('dark');
  }
  return [...modes];
}

export function parseThemeCssVariables(css: string): ThemeCssVariables {
  const result: ThemeCssVariables = { light: {}, dark: {} };
  if (css.length > MAX_THEME_CSS_LENGTH) return result;

  for (const { selector, body } of topLevelRules(stripComments(css))) {
    if (selector.startsWith('@')) continue;
    for (const mode of modesFor(selector)) {
      for (const [name, value] of declarations(body)) {
        result[mode][name] = value;
      }
    }
  }

  return result;
}

/** Variables in effect for `mode`: dark inherits every light value it does not override. */
export function variablesForMode(vars: ThemeCssVariables, mode: ThemeMode): Record<string, string> {
  return mode === 'light' ? { ...vars.light } : { ...vars.light, ...vars.dark };
}

/**
 * Resolves `name` to an opaque sRGB HEX in `mode`, following `var(--x)`
 * references (with fallbacks). Returns null for missing or non-color values.
 */
export function resolveThemeColor(
  vars: ThemeCssVariables,
  mode: ThemeMode,
  name: string,
): string | null {
  const scope = variablesForMode(vars, mode);
  let value: string | undefined = scope[name];

  for (let hops = 0; value !== undefined && hops < 8; hops += 1) {
    const reference: RegExpMatchArray | null = value.match(/^var\(\s*--([\w-]+)\s*(?:,\s*(.+))?\)$/);
    if (!reference) break;
    value = scope[reference[1]] ?? reference[2]?.trim();
  }

  if (!value) return null;
  const color = parse(value);
  if (!color) return null;
  if (color.alpha !== undefined && color.alpha < 1) return null;
  return formatHex(color)?.toUpperCase() ?? null;
}
