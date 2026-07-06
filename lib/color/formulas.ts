import { evaluateContrast } from './contrast';
import { generateAccent } from './formulaAccent';
import {
  assertNonEmptySeeds,
  hueDistance,
  isChromatic,
  neutralChroma,
  oklchToHex,
  parseSeedOklch,
  type SeedOklch,
} from './formulaColorMath';
import { generateNeutrals } from './formulaNeutrals';
import { normalizeHex } from './normalizeHex';
import {
  type GeneratedPalette,
  type NeutralScale,
  type NeutralStep,
  type PaletteRole,
} from './paletteTypes';
import { sortSelectedColors, type SelectableColor } from './selectableColors';

export type { GeneratedPalette, NeutralScale, NeutralStep } from './paletteTypes';
export { generateAccent } from './formulaAccent';
export { generateNeutrals } from './formulaNeutrals';

const MIN_ACCENT_HUE_SEPARATION = 30;
const ON_SURFACE_CHROMA = 0.03;
const NORMAL_TEXT_AA = 4.5;

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

export function generatePalette(seeds: string[]): GeneratedPalette {
  assertNonEmptySeeds(seeds);

  const uniqueSeeds = dedupeSeedsInOrder(seeds);
  const primarySeedHex = uniqueSeeds[0]!;
  const baseline = buildBaselinePalette(primarySeedHex);

  const palette =
    uniqueSeeds.length === 1 ? baseline : assignUserSeeds(uniqueSeeds, baseline);

  return finalizePalette(palette, primarySeedHex);
}
