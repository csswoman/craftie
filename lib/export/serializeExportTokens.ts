import type { ExportTokenSet } from './exportTokenSet';

function cssTokenName(token: string): string {
  return `--color-${token}`;
}

function quoteFont(family: string): string {
  return family.includes(' ') ? `"${family}"` : family;
}

export function toCss(set: ExportTokenSet): string {
  const lightLines: string[] = [];
  const darkLines: string[] = [];

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      lightLines.push(`  ${cssTokenName(token)}: ${value.light};`);
    }
    if (value?.dark) {
      darkLines.push(`  ${cssTokenName(token)}: ${value.dark};`);
    }
  }

  if (set.typography?.heading?.family) {
    lightLines.push(`  --font-heading: ${quoteFont(set.typography.heading.family)};`);
  }
  if (set.typography?.body?.family) {
    lightLines.push(`  --font-body: ${quoteFont(set.typography.body.family)};`);
  }

  const blocks: string[] = [];
  if (lightLines.length > 0) {
    blocks.push(`:root {\n${lightLines.join('\n')}\n}`);
  }
  if (darkLines.length > 0) {
    blocks.push(`[data-theme="dark"] {\n${darkLines.join('\n')}\n}`);
  }
  return blocks.join('\n\n');
}

export function toW3cJson(set: ExportTokenSet): string {
  const color: Record<string, { $type: 'color'; $value: string }> = {};
  const darkColor: Record<string, { $type: 'color'; $value: string }> = {};

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      color[token] = { $type: 'color', $value: value.light };
    }
    if (value?.dark) {
      darkColor[token] = { $type: 'color', $value: value.dark };
    }
  }

  const payload: Record<string, unknown> = { color };
  if (Object.keys(darkColor).length > 0) {
    payload.dark = { color: darkColor };
  }

  if (set.typography) {
    const fontFamily: Record<string, { $type: 'fontFamily'; $value: string }> = {};
    if (set.typography.heading?.family) {
      fontFamily.heading = { $type: 'fontFamily', $value: set.typography.heading.family };
    }
    if (set.typography.body?.family) {
      fontFamily.body = { $type: 'fontFamily', $value: set.typography.body.family };
    }
    if (Object.keys(fontFamily).length > 0) {
      payload.fontFamily = fontFamily;
    }
  }

  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function toTokensStudio(set: ExportTokenSet): string {
  const lightColor: Record<string, { value: string; type: 'color' }> = {};
  const darkColor: Record<string, { value: string; type: 'color' }> = {};

  for (const token of Object.keys(set.colors).sort()) {
    const value = set.colors[token];
    if (value?.light) {
      lightColor[token] = { value: value.light, type: 'color' };
    }
    if (value?.dark) {
      darkColor[token] = { value: value.dark, type: 'color' };
    }
  }

  const light: Record<string, unknown> = { color: lightColor };
  const dark: Record<string, unknown> = { color: darkColor };

  if (set.typography?.heading?.family || set.typography?.body?.family) {
    const fontFamilies: Record<string, { value: string; type: 'fontFamilies' }> = {};
    if (set.typography.heading?.family) {
      fontFamilies.heading = {
        value: set.typography.heading.family,
        type: 'fontFamilies',
      };
    }
    if (set.typography.body?.family) {
      fontFamilies.body = {
        value: set.typography.body.family,
        type: 'fontFamilies',
      };
    }
    light.fontFamilies = fontFamilies;
  }

  const tokenSetOrder = ['light'];
  const payload: Record<string, unknown> = { light };

  if (Object.keys(darkColor).length > 0) {
    payload.dark = dark;
    tokenSetOrder.push('dark');
  }

  payload.$themes = [];
  payload.$metadata = { tokenSetOrder };

  return `${JSON.stringify(payload, null, 2)}\n`;
}
