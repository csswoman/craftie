import { converter, formatHex } from 'culori';

import { contrastRatio, evaluateContrast } from './contrast';
import { CHROMA_MIN } from './harmony';
import { normalizeHex } from './normalizeHex';
import { sortSelectedColors, type SelectableColor } from './selectableColors';

export type NeutralStep =
  | 'veryLight'
  | 'light'
  | 'medium'
  | 'dark'
  | 'veryDark';

export interface NeutralScale {
  veryLight: string;
  light: string;
  medium: string;
  dark: string;
  veryDark: string;
}

export interface GeneratedPalette {
  primary: string;
  accent: string;
  surface: string;
  onSurface: string;
  neutralLight: string;
  neutralDark: string;
}

type PaletteRole = keyof GeneratedPalette;

const NEUTRAL_LIGHTNESS: Record<NeutralStep, number> = {
  veryLight: 0.97,
  light: 0.92,
  medium: 0.62,
  dark: 0.38,
  veryDark: 0.2,
};

const NEUTRAL_STEPS: NeutralStep[] = [
  'veryLight',
  'light',
  'medium',
  'dark',
  'veryDark',
];

const MIN_ACCENT_HUE_SEPARATION = 30;
const ON_SURFACE_CHROMA = 0.03;
const NORMAL_TEXT_AA = 4.5;

const toOklch = converter('oklch');

interface SeedOklch {
  l: number;
  c: number;
  h: number | undefined;
}

function assertValidSeed(seed: string): void {
  if (typeof seed !== 'string' || seed.trim() === '') {
    throw new Error('Seed must be a non-empty color string');
  }
}

function assertNonEmptySeeds(seeds: string[]): void {
  if (!Array.isArray(seeds) || seeds.length === 0) {
    throw new Error('At least one seed color is required');
  }
}

function parseSeedOklch(seed: string): SeedOklch {
  assertValidSeed(seed);
  const normalized = normalizeHex(seed);
  const converted = toOklch(normalized);

  if (!converted || converted.mode !== 'oklch') {
    throw new Error(`Unable to convert seed to OKLCH: "${normalized}"`);
  }

  return {
    l: converted.l ?? 0,
    c: converted.c ?? 0,
    h: converted.h,
  };
}

function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function neutralChroma(seedChroma: number): number {
  if (seedChroma < CHROMA_MIN) {
    return 0.012;
  }

  return Math.min(0.06, Math.max(0.01, seedChroma * 0.12));
}

function oklchToHex(l: number, c: number, h: number | undefined): string {
  const hex = formatHex({
    mode: 'oklch',
    l,
    c,
    h,
  });

  if (!hex) {
    throw new Error('Unable to format OKLCH color as hex');
  }

  return normalizeHex(hex);
}

function isChromatic(oklch: SeedOklch): boolean {
  return oklch.c >= CHROMA_MIN && oklch.h !== undefined;
}

function accentChroma(seed: SeedOklch): number {
  return Math.min(0.28, Math.max(0.08, seed.c * 1.1 + 0.04));
}

function accentLightness(seed: SeedOklch): number {
  return Math.min(0.78, Math.max(0.62, 0.72 - (seed.l - 0.5) * 0.2));
}

function harmonyAccentCandidates(seed: SeedOklch): SeedOklch[] {
  const baseHue = seed.h ?? 0;
  const l = accentLightness(seed);
  const c = accentChroma(seed);
  const offsets = [30, 180, 150, 210, 120, 240];

  return offsets.map((offset) => ({
    l,
    c,
    h: (baseHue + offset) % 360,
  }));
}

function scoreAccentCandidate(
  candidate: SeedOklch,
  primary: SeedOklch,
  darkNeutral: string,
): number {
  const primaryHue = primary.h ?? 0;
  const candidateHue = candidate.h ?? 0;
  const hueSeparation = hueDistance(primaryHue, candidateHue);

  if (hueSeparation < MIN_ACCENT_HUE_SEPARATION) {
    return 0;
  }

  const hex = oklchToHex(candidate.l, candidate.c, candidate.h);
  const contrast = contrastRatio(hex, darkNeutral);
  const distinctnessBonus = Math.min(hueSeparation / 90, 1.5);

  return contrast * distinctnessBonus;
}

function passesPrimaryOnSurface(hex: string, surface: string): boolean {
  return evaluateContrast(hex, surface).normalText !== 'fail';
}

function deriveAccessiblePrimary(seedHex: string, surface: string): string {
  const seed = parseSeedOklch(seedHex);
  const chroma = isChromatic(seed)
    ? Math.min(Math.max(seed.c * 0.75, 0.05), 0.16)
    : ON_SURFACE_CHROMA;
  let lightness = Math.min(seed.l, 0.42);

  while (lightness >= 0.12) {
    const candidate = oklchToHex(lightness, chroma, seed.h);

    if (passesPrimaryOnSurface(candidate, surface)) {
      return candidate;
    }

    lightness -= 0.02;
  }

  return findAccessibleOnSurface(surface, seed.h);
}

function findAccessibleOnSurface(surface: string, seedHue: number | undefined): string {
  let lightness = 0.28;

  while (lightness >= 0.08) {
    const candidate = oklchToHex(lightness, ON_SURFACE_CHROMA, seedHue);

    if (evaluateContrast(candidate, surface).normalText !== 'fail') {
      return candidate;
    }

    lightness -= 0.02;
  }

  return '#000000';
}

function dedupeSeedsInOrder(seeds: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const seed of seeds) {
    const normalized = normalizeHex(seed);

    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(normalized);
    }
  }

  return unique;
}

function classifySeedRole(
  seed: SeedOklch,
  primary: SeedOklch,
): PaletteRole | null {
  if (isChromatic(seed) && isChromatic(primary) && seed.h !== undefined && primary.h !== undefined) {
    if (hueDistance(seed.h, primary.h) >= MIN_ACCENT_HUE_SEPARATION) {
      return 'accent';
    }
  }

  if (seed.l >= 0.84 && seed.c <= 0.08) {
    return 'surface';
  }

  if (seed.l <= 0.32 && seed.c <= 0.08) {
    return 'onSurface';
  }

  if (seed.l >= 0.75 && seed.c <= 0.06) {
    return 'neutralLight';
  }

  if (seed.l <= 0.35 && seed.c <= 0.06) {
    return 'neutralDark';
  }

  return null;
}

function buildBaselinePalette(primarySeedHex: string): GeneratedPalette {
  const seed = parseSeedOklch(primarySeedHex);
  const neutrals = generateNeutrals(primarySeedHex);
  const surface = neutrals.veryLight;
  let primary = primarySeedHex;
  let accent: string;

  if (!passesPrimaryOnSurface(primarySeedHex, surface)) {
    accent = primarySeedHex;
    primary = deriveAccessiblePrimary(primarySeedHex, surface);

    if (normalizeHex(accent) === normalizeHex(primary)) {
      accent = generateAccent(primary);
    }
  } else {
    accent = generateAccent(primarySeedHex);
  }

  const onSurface = findAccessibleOnSurface(surface, seed.h);

  return {
    primary,
    accent,
    surface,
    onSurface,
    neutralLight: neutrals.light,
    neutralDark: neutrals.dark,
  };
}

function assignUserSeeds(
  seeds: string[],
  baseline: GeneratedPalette,
): GeneratedPalette {
  const palette: GeneratedPalette = { ...baseline };
  const usedHexes = new Set<string>([palette.primary]);

  for (const seedHex of seeds.slice(1)) {
    if (usedHexes.has(seedHex)) {
      continue;
    }

    const seed = parseSeedOklch(seedHex);
    const primary = parseSeedOklch(palette.primary);
    const suggestedRole = classifySeedRole(seed, primary);

    if (!suggestedRole || palette[suggestedRole] === seedHex) {
      continue;
    }

    const currentRoleValue = palette[suggestedRole];

    if (!usedHexes.has(currentRoleValue)) {
      usedHexes.add(currentRoleValue);
    }

    palette[suggestedRole] = seedHex;
    usedHexes.add(seedHex);
  }

  const roleValues = Object.values(palette);
  const uniqueRoles = new Set(roleValues);

  if (uniqueRoles.size !== roleValues.length) {
    return resolveDuplicateRoles(palette, baseline);
  }

  if (evaluateContrast(palette.onSurface, palette.surface).normalText === 'fail') {
    palette.onSurface = findAccessibleOnSurface(
      palette.surface,
      parseSeedOklch(palette.primary).h,
    );
  }

  return palette;
}

function resolveDuplicateRoles(
  palette: GeneratedPalette,
  baseline: GeneratedPalette,
): GeneratedPalette {
  const resolved: GeneratedPalette = { ...palette };
  const seen = new Set<string>();

  for (const role of Object.keys(baseline) as PaletteRole[]) {
    const hex = resolved[role];

    if (seen.has(hex)) {
      resolved[role] = baseline[role];
    }

    seen.add(resolved[role]);
  }

  if (evaluateContrast(resolved.onSurface, resolved.surface).normalText === 'fail') {
    resolved.onSurface = findAccessibleOnSurface(
      resolved.surface,
      parseSeedOklch(resolved.primary).h,
    );
  }

  return resolved;
}

function sortHexesByLightness(hexes: string[], direction: 'asc' | 'desc'): string[] {
  return [...hexes].sort((left, right) => {
    const leftL = parseSeedOklch(left).l;
    const rightL = parseSeedOklch(right).l;
    return direction === 'asc' ? leftL - rightL : rightL - leftL;
  });
}

function resolvePrimaryAndAccent(
  boldHexes: string[],
  surface: string,
): { primary: string; accent: string } {
  const bolds = dedupeSeedsInOrder(boldHexes);

  if (bolds.length === 0) {
    const primary = normalizeHex('#2F5644');
    return { primary, accent: generateAccent(primary) };
  }

  if (bolds.length === 1) {
    const only = bolds[0]!;

    if (passesPrimaryOnSurface(only, surface)) {
      return { primary: only, accent: generateAccent(only) };
    }

    return { primary: deriveAccessiblePrimary(only, surface), accent: only };
  }

  const accessibleBolds = bolds.filter((hex) => passesPrimaryOnSurface(hex, surface));

  if (accessibleBolds.length > 0) {
    const primary = accessibleBolds[0]!;
    const accent =
      bolds.find((hex) => normalizeHex(hex) !== normalizeHex(primary)) ?? accessibleBolds[1]!;

    return { primary, accent };
  }

  const primary = deriveAccessiblePrimary(bolds[0]!, surface);

  if (normalizeHex(bolds[0]!) !== normalizeHex(primary)) {
    return { primary, accent: bolds[0]! };
  }

  const accent =
    bolds.slice(1).find((hex) => normalizeHex(hex) !== normalizeHex(primary)) ??
    generateAccent(primary);

  return { primary, accent };
}

function resolveOnSurface(darkHexes: string[], surface: string, primaryHue: number | undefined): string {
  const darks = dedupeSeedsInOrder(darkHexes);

  for (const dark of darks) {
    if (evaluateContrast(dark, surface).normalText !== 'fail') {
      return dark;
    }
  }

  return findAccessibleOnSurface(surface, primaryHue);
}

export function finalizePalette(
  palette: GeneratedPalette,
  primarySeedHex: string,
  options?: { skipGeneratedAccent?: boolean },
): GeneratedPalette {
  const result: GeneratedPalette = { ...palette };

  if (!passesPrimaryOnSurface(result.primary, result.surface)) {
    const inaccessiblePrimary = result.primary;
    result.primary = deriveAccessiblePrimary(inaccessiblePrimary, result.surface);

    const seed = parseSeedOklch(inaccessiblePrimary);

    if (
      !options?.skipGeneratedAccent &&
      isChromatic(seed) &&
      normalizeHex(inaccessiblePrimary) !== normalizeHex(result.primary)
    ) {
      const autoAccentFromSeed = generateAccent(inaccessiblePrimary);
      const autoAccentFromPrimary = generateAccent(result.primary);

      if (
        normalizeHex(result.accent) === normalizeHex(autoAccentFromSeed) ||
        normalizeHex(result.accent) === normalizeHex(autoAccentFromPrimary)
      ) {
        result.accent = inaccessiblePrimary;
      }
    }
  }

  if (evaluateContrast(result.onSurface, result.surface).normalText === 'fail') {
    result.onSurface = findAccessibleOnSurface(
      result.surface,
      parseSeedOklch(result.primary).h,
    );
  }

  if (normalizeHex(result.primary) === normalizeHex(result.accent) && !options?.skipGeneratedAccent) {
    result.accent = generateAccent(result.primary);
  }

  return result;
}

export function generatePaletteFromSelection(colors: SelectableColor[]): GeneratedPalette {
  if (colors.length === 0) {
    throw new Error('At least one selected color is required');
  }

  const sorted = sortSelectedColors(colors);
  const lightHexes = sorted.filter((color) => color.group === 'light-neutral').map((color) => color.hex);
  const boldHexes = sorted.filter((color) => color.group === 'bold').map((color) => color.hex);
  const darkHexes = sorted.filter((color) => color.group === 'dark-neutral').map((color) => color.hex);

  const lightsByLightness = sortHexesByLightness(lightHexes, 'desc');
  const darksByLightness = sortHexesByLightness(darkHexes, 'asc');
  const primarySeedHex = boldHexes[0] ?? lightHexes[0] ?? darkHexes[0]!;

  const surface = lightsByLightness[0] ?? generateNeutrals(primarySeedHex).veryLight;
  const { primary, accent } = resolvePrimaryAndAccent(boldHexes, surface);
  const neutralLight = lightsByLightness[1] ?? generateNeutrals(primary).light;
  const neutralDark = darksByLightness[0] ?? generateNeutrals(primary).dark;

  const palette: GeneratedPalette = {
    primary,
    accent,
    surface,
    onSurface: resolveOnSurface(darkHexes, surface, parseSeedOklch(primary).h),
    neutralLight,
    neutralDark,
  };

  const roleValues = Object.values(palette);
  if (new Set(roleValues.map(normalizeHex)).size !== roleValues.length) {
    return finalizePalette(
      resolveDuplicateRoles(palette, buildBaselinePalette(primarySeedHex)),
      primarySeedHex,
      { skipGeneratedAccent: boldHexes.length >= 2 },
    );
  }

  return finalizePalette(palette, primarySeedHex, {
    skipGeneratedAccent: boldHexes.length >= 2,
  });
}

export function generateNeutrals(seed: string): NeutralScale {
  const seedOklch = parseSeedOklch(seed);
  const chroma = neutralChroma(seedOklch.c);
  const hue = seedOklch.h;
  const scale = {} as NeutralScale;

  for (const step of NEUTRAL_STEPS) {
    scale[step] = oklchToHex(NEUTRAL_LIGHTNESS[step], chroma, hue);
  }

  return scale;
}

export function generateAccent(seed: string): string {
  const primary = parseSeedOklch(seed);
  const darkNeutral = generateNeutrals(seed).veryDark;
  const candidates = harmonyAccentCandidates(primary);

  let bestHex = oklchToHex(
    accentLightness(primary),
    accentChroma(primary),
    ((primary.h ?? 0) + 180) % 360,
  );
  let bestScore = 0;

  for (const candidate of candidates) {
    const score = scoreAccentCandidate(candidate, primary, darkNeutral);

    if (score > bestScore) {
      bestScore = score;
      bestHex = oklchToHex(candidate.l, candidate.c, candidate.h);
    }
  }

  if (bestScore === 0) {
    const fallbackHue = ((primary.h ?? 0) + 180) % 360;
    return oklchToHex(
      accentLightness(primary),
      accentChroma(primary),
      fallbackHue,
    );
  }

  return bestHex;
}

export function generatePalette(seeds: string[]): GeneratedPalette {
  assertNonEmptySeeds(seeds);

  const uniqueSeeds = dedupeSeedsInOrder(seeds);
  const primarySeedHex = uniqueSeeds[0]!;
  const baseline = buildBaselinePalette(primarySeedHex);

  const palette =
    uniqueSeeds.length === 1 ? baseline : assignUserSeeds(uniqueSeeds, baseline);

  return finalizePalette(palette, primarySeedHex);
}
