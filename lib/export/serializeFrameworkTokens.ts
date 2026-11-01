import type { ExportTokenSet, ExportTypeRole } from './exportTokenSet';

/**
 * Serializers for CSS-first frameworks: a Tailwind CSS v4 `@theme` block and the
 * variable set used by shadcn/ui. Both read the same {@link ExportTokenSet} as
 * the other exports, so locks, overrides and type roles stay consistent.
 */

type ThemeMode = 'light' | 'dark';

function quoteFont(family: string): string {
  return family.includes(' ') ? `"${family}"` : family;
}

function remSize(px: number): string {
  return `${Number((px / 16).toFixed(4))}rem`;
}

function colorOf(set: ExportTokenSet, tokens: readonly string[], mode: ThemeMode): string | null {
  for (const token of tokens) {
    const value = set.colors[token]?.[mode];
    if (value) return value;
  }
  return null;
}

/** Tailwind v4: `@theme` holds light values; dark overrides the same variables. */
export function toTailwindTheme(set: ExportTokenSet): string {
  const themeLines: string[] = [];
  const darkLines: string[] = [];

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) themeLines.push(`  --color-${token}: ${value.light};`);
    if (value?.dark) darkLines.push(`  --color-${token}: ${value.dark};`);
  }

  if (set.typography?.heading?.family) {
    themeLines.push(`  --font-heading: ${quoteFont(set.typography.heading.family)}, sans-serif;`);
  }
  if (set.typography?.body?.family) {
    themeLines.push(`  --font-body: ${quoteFont(set.typography.body.family)}, sans-serif;`);
  }

  const roles = Object.entries(set.typography?.roles ?? {}) as Array<[string, ExportTypeRole]>;
  for (const [id, role] of roles) {
    themeLines.push(`  --text-${id}: ${remSize(role.size)};`);
    themeLines.push(`  --text-${id}--line-height: ${role.lineHeight};`);
    themeLines.push(`  --text-${id}--letter-spacing: ${role.letterSpacing}em;`);
    themeLines.push(`  --text-${id}--font-weight: ${role.weight};`);
  }

  const blocks = [
    '/* Craftie · Tailwind CSS v4. Pega esto en tu CSS principal tras @import "tailwindcss". */',
    `@theme {\n${themeLines.join('\n')}\n}`,
  ];
  if (darkLines.length > 0) {
    blocks.push(
      '/* Activa el modo oscuro con data-theme="dark" en <html> o en un contenedor. */',
      `[data-theme="dark"] {\n${darkLines.join('\n')}\n}`,
    );
  }
  return `${blocks.join('\n\n')}\n`;
}

/** shadcn/ui variable → candidate Craftie tokens, first match wins. */
export const SHADCN_VARIABLE_MAP: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['background', ['background']],
  ['foreground', ['on-background']],
  ['card', ['surface', 'background']],
  ['card-foreground', ['on-surface', 'on-background']],
  ['popover', ['surface-elevated', 'surface', 'background']],
  ['popover-foreground', ['on-surface', 'on-background']],
  ['primary', ['primary']],
  ['primary-foreground', ['on-primary']],
  ['secondary', ['secondary', 'surface']],
  ['secondary-foreground', ['on-secondary', 'on-surface', 'on-background']],
  ['muted', ['surface', 'background']],
  ['muted-foreground', ['on-background-muted', 'on-surface-muted']],
  ['accent', ['accent', 'surface']],
  ['accent-foreground', ['on-accent', 'on-surface', 'on-background']],
  ['destructive', ['error']],
  ['border', ['border', 'divider']],
  ['input', ['border', 'divider']],
  ['ring', ['primary']],
  ['chart-1', ['data-1']],
  ['chart-2', ['data-2']],
  ['chart-3', ['data-3']],
  ['chart-4', ['data-4']],
  ['chart-5', ['data-5']],
];

/** shadcn components always need a destructive color; used until the user confirms an error color. */
const FALLBACK_DESTRUCTIVE: Record<ThemeMode, string> = { light: '#b3261e', dark: '#f2b8b5' };

function shadcnLines(set: ExportTokenSet, mode: ThemeMode): string[] {
  const lines: string[] = [];
  for (const [variable, candidates] of SHADCN_VARIABLE_MAP) {
    const value =
      colorOf(set, candidates, mode) ?? (variable === 'destructive' ? FALLBACK_DESTRUCTIVE[mode] : null);
    if (value) lines.push(`  --${variable}: ${value};`);
  }
  return lines;
}

/** shadcn/ui: `:root` and `.dark` variables plus the Tailwind v4 `@theme inline` bridge. */
export function toShadcnTheme(set: ExportTokenSet): string {
  const light = shadcnLines(set, 'light');
  const dark = shadcnLines(set, 'dark');
  const bridge = SHADCN_VARIABLE_MAP.map(([variable]) => variable)
    .filter((variable) => light.some((line) => line.startsWith(`  --${variable}:`)))
    .map((variable) => `  --color-${variable}: var(--${variable});`);

  const blocks = [
    '/* Craftie · shadcn/ui. Reemplaza las variables de tu globals.css. */',
    `:root {\n${[...light, '  --radius: 0.625rem;'].join('\n')}\n}`,
  ];
  if (dark.length > 0) {
    blocks.push(`.dark {\n${dark.join('\n')}\n}`);
  }
  blocks.push(`@theme inline {\n${bridge.join('\n')}\n  --radius-lg: var(--radius);\n}`);
  return `${blocks.join('\n\n')}\n`;
}
