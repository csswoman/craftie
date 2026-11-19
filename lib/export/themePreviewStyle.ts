import { SHADCN_VARIABLE_MAP } from './serializeFrameworkTokens';
import { resolveThemeColor, variablesForMode, type ThemeCssVariables, type ThemeMode } from './themeCssVariables';

/**
 * Custom properties to paint the theme preview with. Only resolved opaque
 * colors and a plain `--radius` length are passed through, so pasted CSS can
 * never inject `url()`, expressions or other values into the page.
 */
export function themePreviewProperties(
  vars: ThemeCssVariables,
  mode: ThemeMode,
): Record<`--${string}`, string> {
  const properties: Record<`--${string}`, string> = {};

  for (const [name] of SHADCN_VARIABLE_MAP) {
    const hex = resolveThemeColor(vars, mode, name);
    if (hex) properties[`--${name}`] = hex;
  }

  const radius = variablesForMode(vars, mode).radius;
  if (radius && /^\d+(\.\d+)?(rem|px|em)$/.test(radius)) {
    properties['--radius'] = radius;
  }

  return properties;
}

/** Variables the preview needs that the stylesheet does not provide as colors. */
export function missingPreviewVariables(vars: ThemeCssVariables, mode: ThemeMode): string[] {
  return SHADCN_VARIABLE_MAP.map(([name]) => name).filter(
    (name) => !name.startsWith('chart-') && resolveThemeColor(vars, mode, name) === null,
  );
}

/** Small original sample so the tester is useful before anything is pasted. */
export const SAMPLE_SHADCN_THEME = `:root {
  --background: #fbfaf7;
  --foreground: #1d1b18;
  --card: #f3f1ec;
  --card-foreground: #1d1b18;
  --popover: #ffffff;
  --popover-foreground: #1d1b18;
  --primary: #2c5d4a;
  --primary-foreground: #ffffff;
  --secondary: #e7e3da;
  --secondary-foreground: #2a2722;
  --muted: #efece6;
  --muted-foreground: #66615a;
  --accent: #b84a33;
  --accent-foreground: #ffffff;
  --destructive: #b3261e;
  --border: #d9d4ca;
  --input: #d9d4ca;
  --ring: #2c5d4a;
  --radius: 0.625rem;
}

.dark {
  --background: #151412;
  --foreground: #f1eee8;
  --card: #1f1d1a;
  --card-foreground: #f1eee8;
  --popover: #262420;
  --popover-foreground: #f1eee8;
  --primary: #7cc4a6;
  --primary-foreground: #0d1f17;
  --secondary: #2e2b26;
  --secondary-foreground: #f1eee8;
  --muted: #2a2723;
  --muted-foreground: #aaa49a;
  --accent: #e98a72;
  --accent-foreground: #1d0f0a;
  --destructive: #f2b8b5;
  --border: #3a3631;
  --input: #3a3631;
  --ring: #7cc4a6;
}
`;
