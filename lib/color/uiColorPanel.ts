import { converter } from 'culori';

import { remainsDistinctWithColorVisionDeficiency } from './colorVision';
import { normalizeHex } from './normalizeHex';
import type { SelectableColor } from './selectableColors';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';
import { contrastRatio, oklchChannelsToHex } from '../utils/colorMath';

const toOklch = converter('oklch');

export const UI_SYSTEM_ROLES = [
  { token: 'background', label: 'Fondo', contrast: true },
  { token: 'surface', label: 'Superficie', contrast: true },
  { token: 'border', label: 'Borde', contrast: false },
  { token: 'on-background', label: 'Texto', contrast: true },
  { token: 'on-surface-muted', label: 'Texto sutil', contrast: true },
  { token: 'primary', label: 'Primario', contrast: true },
  { token: 'secondary', label: 'Secundario', contrast: true },
  { token: 'accent', label: 'Acento', contrast: true },
] as const satisfies ReadonlyArray<{
  token: SemanticTokenName;
  label: string;
  contrast: boolean;
}>;

export type UiSystemTokenName = (typeof UI_SYSTEM_ROLES)[number]['token'];

export const DATA_TOKEN_NAMES = [
  'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6',
] as const satisfies readonly SemanticTokenName[];

export const TINTED_NEUTRAL_LIGHTNESS = [0.98, 0.96, 0.93, 0.88, 0.72, 0.53, 0.33, 0.2] as const;
const TINTED_NEUTRAL_CHROMA = [0.008, 0.012, 0.016, 0.02, 0.025, 0.03, 0.03, 0.03] as const;

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

export function dominantSourceHue(colors: SelectableColor[]): number {
  const chromatic = colors.flatMap((color) => {
    const channels = toOklch(color.hex);
    return channels && (channels.c ?? 0) > 0.01 && typeof channels.h === 'number'
      ? [{ hue: channels.h, weight: color.prominence ?? 1 }]
      : [];
  });

  if (chromatic.length === 0) return 0;

  const vector = chromatic.reduce(
    (sum, color) => {
      const radians = color.hue * Math.PI / 180;
      return {
        x: sum.x + Math.cos(radians) * color.weight,
        y: sum.y + Math.sin(radians) * color.weight,
      };
    },
    { x: 0, y: 0 },
  );

  return (Math.atan2(vector.y, vector.x) * 180 / Math.PI + 360) % 360;
}

export function buildTintedNeutralRamp(colors: SelectableColor[]) {
  const hue = dominantSourceHue(colors);
  return {
    hue,
    steps: TINTED_NEUTRAL_LIGHTNESS.map((lightness, index) => ({
      lightness,
      hex: oklchChannelsToHex(lightness, TINTED_NEUTRAL_CHROMA[index], hue),
    })),
  };
}

export function sourceHueCause(colors: SelectableColor[]): string {
  const hue = dominantSourceHue(colors);
  const hues = colors.flatMap((color) => {
    const channels = toOklch(color.hex);
    return typeof channels?.h === 'number' && (channels.c ?? 0) > 0.01 ? [channels.h] : [];
  }).sort((left, right) => left - right);
  const family = hue < 18 || hue >= 345
    ? 'rojo-rosa'
    : hue < 48 ? 'rojo-naranja'
      : hue < 82 ? 'naranja-amarillo'
        : hue < 150 ? 'amarillo-verde'
          : hue < 205 ? 'verde-cian'
            : hue < 255 ? 'cian-azul'
              : hue < 300 ? 'azul-violeta'
                : 'violeta-rosa';
  const range = hues.length > 0
    ? `${Math.round(hues[0]!)}°–${Math.round(hues[hues.length - 1]!)}°`
    : 'sin rango cromático';
  return `Los colores fuente comparten hue ${family} (${range}). Dos series adyacentes colapsarían al mismo color bajo deuteranopía.`;
}

function separatedFrom(candidateHex: string, pickedHexes: string[]): boolean {
  const candidate = toOklch(candidateHex);
  if (!candidate) return false;

  return pickedHexes.every((hex) => {
    const previous = toOklch(hex);
    if (!previous) return false;
    const hueSeparated = typeof candidate.h === 'number' && typeof previous.h === 'number'
      ? hueDistance(candidate.h, previous.h) >= 25
      : false;
    const lightnessSeparated = Math.abs((candidate.l ?? 0) - (previous.l ?? 0)) >= 0.15;
    return (hueSeparated || lightnessSeparated) &&
      remainsDistinctWithColorVisionDeficiency(candidateHex, hex);
  });
}

export function deriveMissingDataColors(
  tokens: SemanticTokens,
  colors: SelectableColor[],
): string[] {
  const existing = DATA_TOKEN_NAMES
    .filter((name) => !tokens[name].gap)
    .map((name) => normalizeHex(tokens[name].hex));
  const missingCount = DATA_TOKEN_NAMES.length - existing.length;
  const result: string[] = [];
  const targets = [0.25, 0.4, 0.55, 0.7, 0.85];

  for (const source of colors) {
    const channels = toOklch(source.hex);
    if (!channels || typeof channels.h !== 'number') continue;

    for (const lightness of targets) {
      const candidate = oklchChannelsToHex(lightness, channels.c ?? 0, channels.h);
      if (contrastRatio(candidate, tokens.background.hex) < 3) continue;
      if (!separatedFrom(candidate, [...existing, ...result])) continue;
      result.push(candidate);
      if (result.length === missingCount) return result;
    }
  }

  return result;
}

export function rolesBySourceHex(tokens: SemanticTokens): Map<string, string[]> {
  const roles = new Map<string, string[]>();
  for (const role of UI_SYSTEM_ROLES) {
    if (tokens[role.token].gap) continue;
    const hex = normalizeHex(tokens[role.token].hex);
    roles.set(hex, [...(roles.get(hex) ?? []), role.label]);
  }
  return roles;
}
