import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import { deriveForegroundForBackground } from './pairedForeground';
import type { SemanticTokens } from './semanticTokens';
import {
  contrastRatio,
  maxOklchChromaForSrgb,
  oklchChannelsToHex,
} from '../utils/colorMath';

const toOklch = converter('oklch');

export const STATUS_COLORS_ON_DEMAND = true;

export const STATUS_COLOR_DEFINITIONS = [
  { role: 'success', label: 'Success', anchorHue: 140 },
  { role: 'warning', label: 'Warning', anchorHue: 68 },
  { role: 'danger', label: 'Danger', anchorHue: 25 },
] as const;

export type UiStatusRole = (typeof STATUS_COLOR_DEFINITIONS)[number]['role'];

export const STATUS_CHROMA_FLOORS: Record<UiStatusRole, number> = {
  success: 0.11,
  warning: 0.13,
  danger: 0.15,
};

export const STATUS_FULL_CHROMA: Record<UiStatusRole, number> = {
  success: 0.15,
  warning: 0.17,
  danger: 0.19,
};

export const STATUS_ON_COLOR_MIN_CONTRAST = 4.5;

export type UiStatusColorOrigin = 'found' | 'found-adjusted' | 'synthetic';

export type UiStatusColor = {
  role: UiStatusRole;
  anchorHue: number;
  hex: string;
  onHex: string;
  resultHue: number;
  hueDrift: number;
  origin: UiStatusColorOrigin;
  sourceHex?: string;
  contrastOnBackground: number;
  contrastWithOnColor: number;
};

export type UiStatusColorSet = Record<UiStatusRole, UiStatusColor>;
export type UiStatusCandidate = UiStatusColor & { id: string; label: string };
export type ForcedStatusColor = Pick<UiStatusColor, 'hex' | 'origin' | 'sourceHex'>;

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

function materializeStatusColor(
  role: UiStatusRole,
  baseHex: string,
  backgroundHex: string,
  origin: UiStatusColor['origin'],
  sourceHex?: string,
): UiStatusColor {
  const definition = STATUS_COLOR_DEFINITIONS.find((entry) => entry.role === role)!;
  const base = toOklch(baseHex);
  const sourceChroma = base?.c ?? 0;
  const adjustedForChroma = sourceChroma < STATUS_CHROMA_FLOORS[role];
  const hex = adjustedForChroma
    ? statusHexAtChroma(role, baseHex, STATUS_CHROMA_FLOORS[role])
    : baseHex;
  const resultHue = toOklch(hex)?.h ?? definition.anchorHue;
  const foreground = deriveForegroundForBackground(hex, STATUS_ON_COLOR_MIN_CONTRAST);
  return {
    role,
    anchorHue: definition.anchorHue,
    hex,
    onHex: foreground.hex,
    resultHue,
    hueDrift: hueDistance(resultHue, definition.anchorHue),
    origin: origin === 'found' && adjustedForChroma ? 'found-adjusted' : origin,
    ...(sourceHex ? { sourceHex } : {}),
    contrastOnBackground: contrastRatio(hex, backgroundHex),
    contrastWithOnColor: contrastRatio(hex, foreground.hex),
  };
}

/** Re-materializes a user adjustment through the existing status constraints. */
export function adjustUiStatusColor(
  status: UiStatusColor,
  hex: string,
  backgroundHex: string,
): UiStatusColor {
  return materializeStatusColor(
    status.role,
    hex,
    backgroundHex,
    status.sourceHex ? 'found-adjusted' : 'synthetic',
    status.sourceHex,
  );
}

/** Raises chroma without sacrificing the floor to sRGB gamut mapping. */
function statusHexAtChroma(role: UiStatusRole, baseHex: string, requestedChroma: number): string {
  const definition = STATUS_COLOR_DEFINITIONS.find((entry) => entry.role === role)!;
  const base = toOklch(baseHex);
  const originalLightness = base?.l ?? 0.58;
  const hue = base?.h ?? definition.anchorHue;
  const floor = STATUS_CHROMA_FLOORS[role];
  // A small encoding margin keeps 8-bit hex round-trips from falling just below the named floor.
  const chroma = Math.max(requestedChroma, floor + 0.002);

  const lightnessCandidates = Array.from({ length: 201 }, (_, index) => {
    if (index === 0) return originalLightness;
    const distance = Math.ceil(index / 2) * 0.005;
    return originalLightness + (index % 2 === 1 ? -distance : distance);
  });

  for (const lightness of lightnessCandidates) {
    if (lightness < 0 || lightness > 1) continue;
    if (maxOklchChromaForSrgb(lightness, hue) < chroma) continue;
    const candidate = oklchChannelsToHex(lightness, chroma, hue);
    if ((toOklch(candidate)?.c ?? 0) >= floor) return candidate;
  }

  // The semantic anchors and floors are sRGB-representable, but retain a safe fallback.
  return oklchChannelsToHex(0.58, chroma, hue);
}

export function buildUiStatusCandidates({
  role,
  colors,
  backgroundHex,
  current,
}: {
  role: UiStatusRole;
  colors: ExtractedColor[];
  backgroundHex: string;
  current: UiStatusColor;
}): UiStatusCandidate[] {
  const candidates: UiStatusCandidate[] = [{ ...current, id: `current-${role}`, label: 'Actual' }];
  const currentChannels = toOklch(current.hex);
  const definition = STATUS_COLOR_DEFINITIONS.find((entry) => entry.role === role)!;
  const fullChromaHex = statusHexAtChroma(
    role,
    oklchChannelsToHex(currentChannels?.l ?? 0.58, STATUS_FULL_CHROMA[role], definition.anchorHue),
    STATUS_FULL_CHROMA[role],
  );
  const fullChromaCandidate: UiStatusCandidate = {
    ...materializeStatusColor(role, fullChromaHex, backgroundHex, 'synthetic'),
    id: `synthetic-anchor-${role}`,
    label: 'Sintético pleno',
  };
  candidates.push(fullChromaCandidate);

  for (const [index, color] of colors.entries()) {
    if (!statusAcceptsSource(role, color.hex)) continue;
    candidates.push({
      ...materializeStatusColor(role, color.hex, backgroundHex, 'found', color.hex),
      id: `source-${index}-${color.hex}`,
      label: 'De tu imagen',
    });
    const channels = toOklch(color.hex);
    if (!channels || typeof channels.h !== 'number') continue;
    for (const delta of [-0.18, 0.18]) {
      const lightness = Math.min(0.9, Math.max(0.12, (channels.l ?? 0.5) + delta));
      const derivedHex = oklchChannelsToHex(lightness, channels.c ?? 0, channels.h);
      candidates.push({
        ...materializeStatusColor(role, derivedHex, backgroundHex, 'synthetic'),
        id: `derived-${index}-${delta}`,
        label: 'Derivado',
      });
    }
  }

  const unique = new Map<string, UiStatusCandidate>();
  const originRank: Record<UiStatusColorOrigin, number> = {
    found: 3,
    'found-adjusted': 2,
    synthetic: 1,
  };
  for (const candidate of candidates) {
    const key = candidate.hex.toUpperCase();
    const existing = unique.get(key);
    if (!existing || originRank[candidate.origin] > originRank[existing.origin]) unique.set(key, candidate);
  }
  const ordered = [...unique.values()]
    .filter((candidate) => candidate.hueDrift <= 25)
    .sort((left, right) => originRank[right.origin] - originRank[left.origin] || left.hueDrift - right.hueDrift);
  const selected = ordered.find((candidate) =>
    candidate.hex.toUpperCase() === current.hex.toUpperCase() && candidate.origin === current.origin,
  ) ?? { ...current, id: `current-${role}`, label: 'Actual' };
  const selectedIsFullSynthetic = selected.origin === 'synthetic'
    && selected.hex.toUpperCase() === fullChromaCandidate.hex.toUpperCase();
  return [
    selected,
    ...(selectedIsFullSynthetic ? [] : [fullChromaCandidate]),
    ...ordered.filter((candidate) =>
      candidate.id !== selected.id
      && candidate.id !== fullChromaCandidate.id
      && candidate.hex.toUpperCase() !== selected.hex.toUpperCase()
      && candidate.hex.toUpperCase() !== fullChromaCandidate.hex.toUpperCase()
    ),
  ].slice(0, 8);
}

export function buildUiStatusColors({
  colors,
  backgroundHex,
  forcedSources = {},
  forcedColors = {},
}: {
  colors: ExtractedColor[];
  backgroundHex: string;
  forcedSources?: Partial<Record<UiStatusRole, string>>;
  forcedColors?: Partial<Record<UiStatusRole, ForcedStatusColor>>;
}): UiStatusColorSet {
  const texture = paletteTexture(colors);

  return Object.fromEntries(STATUS_COLOR_DEFINITIONS.map((definition) => {
    const forcedColor = forcedColors[definition.role];
    if (forcedColor) {
      return [definition.role, materializeStatusColor(
        definition.role,
        forcedColor.hex,
        backgroundHex,
        forcedColor.origin,
        forcedColor.sourceHex,
      )];
    }
    const source = findSource(definition.role, colors, forcedSources[definition.role]);
    const baseHex = source?.hex ?? oklchChannelsToHex(
      Math.min(0.72, Math.max(0.38, texture.lightness)),
      texture.chroma,
      definition.anchorHue,
    );
    const status = materializeStatusColor(
      definition.role,
      baseHex,
      backgroundHex,
      source ? 'found' : 'synthetic',
      source?.hex,
    );
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
