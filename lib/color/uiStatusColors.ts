import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import { deriveForegroundForBackground } from './pairedForeground';
import type { SemanticTokens } from './semanticTokens';
import { contrastRatio, oklchChannelsToHex, readableOn } from '../utils/colorMath';

const toOklch = converter('oklch');

export const STATUS_COLORS_ON_DEMAND = true;

export const STATUS_COLOR_DEFINITIONS = [
  { role: 'success', label: 'Success', anchorHue: 140 },
  { role: 'warning', label: 'Warning', anchorHue: 68 },
  { role: 'danger', label: 'Danger', anchorHue: 25 },
] as const;

export type UiStatusRole = (typeof STATUS_COLOR_DEFINITIONS)[number]['role'];

export type UiStatusColor = {
  role: UiStatusRole;
  anchorHue: number;
  hex: string;
  onHex: string;
  resultHue: number;
  hueDrift: number;
  origin: 'found' | 'synthetic';
  sourceHex?: string;
  contrastOnBackground: number;
};

export type UiStatusColorSet = Record<UiStatusRole, UiStatusColor>;

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function closestStatusRole(hex: string): UiStatusRole | null {
  const hue = toOklch(hex)?.h;
  if (typeof hue !== 'number') return null;
  const closest = [...STATUS_COLOR_DEFINITIONS].sort(
    (left, right) => hueDistance(hue, left.anchorHue) - hueDistance(hue, right.anchorHue),
  )[0]!;
  return hueDistance(hue, closest.anchorHue) <= 25 ? closest.role : null;
}

export function statusAcceptsSource(role: UiStatusRole, hex: string): boolean {
  const definition = STATUS_COLOR_DEFINITIONS.find((entry) => entry.role === role)!;
  const hue = toOklch(hex)?.h;
  return typeof hue === 'number' && hueDistance(hue, definition.anchorHue) <= 25;
}

function paletteTexture(colors: ExtractedColor[]) {
  const entries = colors.flatMap((color) => {
    const channels = toOklch(color.hex);
    return channels ? [{ channels, weight: Math.max(0.001, color.prominence) }] : [];
  });
  const weight = entries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
  return {
    chroma: Math.min(0.16, Math.max(0.035, entries.reduce(
      (sum, entry) => sum + (entry.channels.c ?? 0) * entry.weight,
      0,
    ) / weight)),
    lightness: entries.reduce(
      (sum, entry) => sum + (entry.channels.l ?? 0.55) * entry.weight,
      0,
    ) / weight,
  };
}

function findSource(
  role: UiStatusRole,
  colors: ExtractedColor[],
  forcedHex?: string,
): ExtractedColor | null {
  if (forcedHex) {
    const forced = colors.find((color) => color.hex.toUpperCase() === forcedHex.toUpperCase());
    if (forced && statusAcceptsSource(role, forced.hex)) return forced;
  }

  const definition = STATUS_COLOR_DEFINITIONS.find((entry) => entry.role === role)!;
  return colors
    .filter((color) => statusAcceptsSource(role, color.hex) && closestStatusRole(color.hex) === role)
    .sort((left, right) => {
      const leftHue = toOklch(left.hex)?.h ?? definition.anchorHue;
      const rightHue = toOklch(right.hex)?.h ?? definition.anchorHue;
      return hueDistance(leftHue, definition.anchorHue) - hueDistance(rightHue, definition.anchorHue) ||
        right.prominence - left.prominence;
    })[0] ?? null;
}

export function buildUiStatusColors({
  colors,
  backgroundHex,
  forcedSources = {},
}: {
  colors: ExtractedColor[];
  backgroundHex: string;
  forcedSources?: Partial<Record<UiStatusRole, string>>;
}): UiStatusColorSet {
  const texture = paletteTexture(colors);

  return Object.fromEntries(STATUS_COLOR_DEFINITIONS.map((definition) => {
    const source = findSource(definition.role, colors, forcedSources[definition.role]);
    const baseHex = source?.hex ?? oklchChannelsToHex(
      Math.min(0.72, Math.max(0.38, texture.lightness)),
      texture.chroma,
      definition.anchorHue,
    );
    const hex = readableOn(baseHex, backgroundHex, 3);
    const resultHue = toOklch(hex)?.h ?? definition.anchorHue;
    const foreground = deriveForegroundForBackground(hex, 4.5);
    const status: UiStatusColor = {
      role: definition.role,
      anchorHue: definition.anchorHue,
      hex,
      onHex: foreground.hex,
      resultHue,
      hueDrift: hueDistance(resultHue, definition.anchorHue),
      origin: source ? 'found' : 'synthetic',
      ...(source ? { sourceHex: source.hex } : {}),
      contrastOnBackground: contrastRatio(hex, backgroundHex),
    };
    return [definition.role, status];
  })) as UiStatusColorSet;
}

export function applyUiStatusColors(
  tokens: SemanticTokens,
  statusColors: UiStatusColorSet | null,
): SemanticTokens {
  if (!statusColors) {
    const pending = {
      hex: tokens['on-surface-muted'].hex,
      source: 'derived' as const,
      gap: 'Los colores de estado todavía no se han generado.',
    };
    return { ...tokens, success: pending, warning: pending, error: pending };
  }

  return {
    ...tokens,
    success: { hex: statusColors.success.hex, source: statusColors.success.origin === 'found' ? 'extracted' : 'derived' },
    warning: { hex: statusColors.warning.hex, source: statusColors.warning.origin === 'found' ? 'extracted' : 'derived' },
    error: { hex: statusColors.danger.hex, source: statusColors.danger.origin === 'found' ? 'extracted' : 'derived' },
  };
}

export function statusColorCssVariables(statusColors: UiStatusColorSet): Record<string, string> {
  return {
    '--c-success': statusColors.success.hex,
    '--c-warning': statusColors.warning.hex,
    '--c-danger': statusColors.danger.hex,
    '--c-on-success': statusColors.success.onHex,
    '--c-on-warning': statusColors.warning.onHex,
    '--c-on-danger': statusColors.danger.onHex,
  };
}
