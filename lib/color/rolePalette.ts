import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
  LIGHT_NEUTRAL_LIGHTNESS_MIN,
  NEUTRAL_CHROMA_MAX,
} from './colorGroupClassification';
import type { GeneratedPalette } from './formulas';
import type { ExtractedColor } from './imageExtractor';
import { nameForHex } from './naming';
import { normalizeHex } from './normalizeHex';
import { deriveChromatic, toOklch } from './oklchMath';
import {
  brandScore,
  pickBestChromaticRole,
  type ChromaticRoleId,
} from './roleFitness';
import type { ColorGroupId } from './selectableColors';
import {
  deriveFondo,
  deriveNeutralRoles,
  deriveSecondary,
} from '../utils/deriveRoles';
import {
  DERIVED_ROLES,
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  SEED_ROLES,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
} from './roleTypes';
import {
  generatePaletteFromRolePalette,
  rolePaletteToGeneratedPalette,
  validateRolePalette,
} from './rolePaletteGenerated';
import { recomputeDerivedRoles } from './rolePaletteDerived';
import {
  applyUniqueRoleNames,
  buildPaletteInput,
  createRoleSlot,
} from './rolePaletteSlots';

export {
  DERIVED_ROLES,
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  SEED_ROLES,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
  type RoleSlot,
} from './roleTypes';

export {
  generatePaletteFromRolePalette,
  rolePaletteToGeneratedPalette,
  validateRolePalette,
} from './rolePaletteGenerated';

export { recomputeDerivedRoles } from './rolePaletteDerived';

type ColorCandidate = {
  hex: string;
  prominence: number;
  lightness: number;
  chroma: number;
  hue: number;
  isNeutral: boolean;
};

function toCandidate(color: ExtractedColor): ColorCandidate {
  const hex = normalizeHex(color.hex);
  const oklch = toOklch(hex);
  const lightness = oklch?.l ?? 0;
  const chroma = oklch?.c ?? 0;
  const hue = oklch?.h ?? 0;

  return {
    hex,
    prominence: color.prominence,
    lightness,
    chroma,
    hue,
    isNeutral: chroma <= NEUTRAL_CHROMA_MAX,
  };
}

function uniqueCandidates(extracted: ExtractedColor[]): ColorCandidate[] {
  const byHex = new Map<string, ColorCandidate>();

  for (const color of extracted) {
    const candidate = toCandidate(color);
    const existing = byHex.get(candidate.hex);

    if (!existing || candidate.prominence > existing.prominence) {
      byHex.set(candidate.hex, candidate);
    }
  }

  return [...byHex.values()];
}

function pickNeutral(
  neutrals: ColorCandidate[],
  used: Set<string>,
  preference: 'lightest',
): ColorCandidate | null {
  if (neutrals.length === 0) {
    return null;
  }

  const sorted = [...neutrals].sort((left, right) => right.lightness - left.lightness);

  if (preference === 'lightest') {
    return sorted.find((entry) => !used.has(entry.hex)) ?? null;
  }

  return null;
}

function resolveDominantSeed(
  candidates: ColorCandidate[],
  chromatics: ColorCandidate[],
): string {
  if (chromatics[0]) {
    return chromatics[0].hex;
  }

  const byProminence = [...candidates].sort((left, right) => right.prominence - left.prominence);

  return byProminence[0]?.hex ?? '#808080';
}

function resolveNeutralHue(
  candidates: ColorCandidate[],
  lightNeutrals: ColorCandidate[],
  chromatics: ColorCandidate[],
): number {
  const neutrals = candidates.filter((entry) => entry.isNeutral);

  if (neutrals.length > 0) {
    const mostFrequentNeutral = [...neutrals].sort(
      (left, right) => right.prominence - left.prominence,
    )[0];

    if (mostFrequentNeutral) {
      return mostFrequentNeutral.hue;
    }
  }

  const lightest = pickNeutral(lightNeutrals, new Set(), 'lightest');

  if (lightest) {
    return lightest.hue;
  }

  if (lightNeutrals[0]) {
    return lightNeutrals[0].hue;
  }

  const dominant = resolveDominantSeed(candidates, chromatics);
  const oklch = toOklch(dominant);

  return oklch?.h ?? 0;
}

export type PaletteSeeds = {
  primario: string;
  acento: string;
  neutralHue: number;
};

export function extractSeedsFromPalette(palette: RolePalette): PaletteSeeds {
  const fondo = toOklch(palette.fondo.hex);
  const primario = toOklch(palette.primario.hex);

  return {
    primario: palette.primario.hex,
    acento: palette.acento.hex,
    neutralHue: fondo?.h ?? primario?.h ?? 0,
  };
}

export function buildBasePalette(
  slots: { fondo: string; primario: string; acento: string },
  sources?: Partial<Record<'fondo' | 'primario' | 'acento', ColorSource>>,
): RolePalette {
  const paletteInput = buildPaletteInput(slots);
  const palette = {} as RolePalette;

  palette.fondo = createRoleSlot(
    'fondo',
    slots.fondo,
    sources?.fondo ?? 'derived',
    paletteInput,
  );
  palette.primario = createRoleSlot(
    'primario',
    slots.primario,
    sources?.primario ?? 'derived',
    paletteInput,
  );
  palette.acento = createRoleSlot(
    'acento',
    slots.acento,
    sources?.acento ?? 'derived',
    paletteInput,
  );

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    palette[role] = createRoleSlot(role, slots.fondo, 'derived', paletteInput);
  }

  return palette;
}

export function buildPaletteFromSeeds(
  seeds: PaletteSeeds,
  theme: 'light' | 'dark' = 'light',
  lockedRoles: PaletteRoleId[] = [],
): RolePalette {
  const fondo = deriveFondo(seeds.neutralHue, theme);
  const base = buildBasePalette(
    {
      fondo,
      primario: seeds.primario,
      acento: seeds.acento,
    },
    {
      fondo: 'derived',
      primario: 'extracted',
      acento: 'extracted',
    },
  );

  return recomputeDerivedRoles(base, lockedRoles, seeds, theme);
}

/** @deprecated Use buildBasePalette */
export function buildSeedPalette(
  seeds: { fondo: string; primario: string; acento: string },
  seedSources?: Partial<Record<'fondo' | 'primario' | 'acento', ColorSource>>,
): RolePalette {
  return buildBasePalette(seeds, seedSources);
}

export function finalizeRolePalette(palette: RolePalette): RolePalette {
  return applyUniqueRoleNames(palette);
}

export function assignRolesFromExtracted(extracted: ExtractedColor[]): RolePalette {
  const candidates = uniqueCandidates(extracted);
  const neutrals = candidates.filter((entry) => entry.isNeutral);
  const lightNeutrals = neutrals.filter((entry) => entry.lightness >= LIGHT_NEUTRAL_LIGHTNESS_MIN);
  const chromatics = candidates
    .filter((entry) => !entry.isNeutral)
    .sort((left, right) => brandScore(right) - brandScore(left));
  const dominantSeed = resolveDominantSeed(candidates, chromatics);
  const neutralHue = resolveNeutralHue(candidates, lightNeutrals, chromatics);

  const used = new Set<string>();
  const chromaticPool = chromatics.filter((entry) => !used.has(entry.hex));
  const slotHex: Partial<Record<'primario' | 'acento', { hex: string; source: ColorSource }>> = {};

  function assignChromaticSeed(
    role: Extract<ChromaticRoleId, 'primario' | 'acento'>,
    anchors: ColorCandidate[],
    fallbackHueOffset: number,
  ) {
    const candidate = pickBestChromaticRole(chromaticPool, used, anchors, role);

    if (candidate) {
      used.add(candidate.hex);
      return { hex: candidate.hex, source: 'extracted' as const };
    }

    const seedHex = slotHex.primario?.hex ?? dominantSeed;

    return {
      hex: deriveChromatic(seedHex, fallbackHueOffset),
      source: 'derived' as const,
    };
  }

  const primarioCandidate = assignChromaticSeed('primario', [], 0);
  slotHex.primario = primarioCandidate;
  const primarioAnchors =
    primarioCandidate.source === 'extracted'
      ? [toCandidate({ hex: primarioCandidate.hex, prominence: 1 })]
      : [];
  slotHex.acento = assignChromaticSeed('acento', primarioAnchors, 180);

  const seeds: PaletteSeeds = {
    primario: slotHex.primario!.hex,
    acento: slotHex.acento!.hex,
    neutralHue,
  };

  return buildPaletteFromSeeds(seeds, 'light');
}

export function assignRolesFromHexes(hexes: string[]): RolePalette {
  const extracted: ExtractedColor[] = hexes.map((hex, index) => ({
    hex,
    prominence: 1 - index * 0.05,
  }));

  return assignRolesFromExtracted(extracted);
}

export function mergeRolePalettePreservingLocks(
  current: RolePalette,
  next: RolePalette,
  lockedRoles: PaletteRoleId[],
): RolePalette {
  if (lockedRoles.length === 0) {
    return next;
  }

  const locked = new Set<PaletteRoleId>(lockedRoles);
  const merged = { ...next };

  for (const role of PALETTE_ROLE_ORDER) {
    if (locked.has(role)) {
      merged[role] = current[role];
    }
  }

  return applyUniqueRoleNames(merged);
}

export function isPaletteRoleId(id: string): id is PaletteRoleId {
  return (PALETTE_ROLE_ORDER as string[]).includes(id);
}

export function replaceRoleHex(
  palette: RolePalette,
  role: PaletteRoleId,
  newHex: string,
  options?: {
    lockedRoles?: PaletteRoleId[];
    neutralHue?: number;
    theme?: 'light' | 'dark';
  },
): RolePalette {
  const normalized = normalizeHex(newHex);
  const paletteInput = PALETTE_ROLE_ORDER.map((entry) => ({
    hex: entry === role ? normalized : palette[entry].hex,
  }));

  const next = { ...palette };
  const slot = palette[role];

  next[role] = {
    ...slot,
    hex: normalized,
    source: 'extracted',
    name: slot.name && slot.name !== ROLE_LABELS[role] && !slot.name.match(/ \d+$/)
      ? slot.name
      : nameForHex(normalized, paletteInput, { style: 'creative' }),
  };

  const updated = applyUniqueRoleNames(next);

  if (role === 'fondo' || role === 'primario') {
    const neutralHue =
      options?.neutralHue ??
      (role === 'fondo' ? (toOklch(normalized)?.h ?? undefined) : undefined);

    return recomputeDerivedRoles(
      updated,
      options?.lockedRoles ?? [],
      neutralHue !== undefined ? { neutralHue } : undefined,
      options?.theme ?? 'light',
    );
  }

  return updated;
}

export function renameRoleSlot(
  palette: RolePalette,
  role: PaletteRoleId,
  newName: string,
): RolePalette | null {
  const trimmed = newName.trim();

  if (trimmed.length === 0 || trimmed.length > 40) {
    return null;
  }

  return {
    ...palette,
    [role]: {
      ...palette[role],
      name: trimmed,
    },
  };
}

const STRUCTURAL_DERIVED_ROLES = new Set<PaletteRoleId>(['superficie', 'borde']);

const GROUP_TO_ROLES: Record<ColorGroupId, PaletteRoleId[]> = {
  'light-neutral': ['fondo'],
  bold: ['primario', 'secundario', 'acento'],
  'dark-neutral': ['texto'],
};

function pickRoleForGroup(palette: RolePalette, group: ColorGroupId): PaletteRoleId {
  const roles = GROUP_TO_ROLES[group].filter((role) => !STRUCTURAL_DERIVED_ROLES.has(role));

  const derived = roles.find((role) => palette[role].source === 'derived');

  if (derived) {
    return derived;
  }

  return roles[0]!;
}

export function assignColorToRolePalette(
  palette: RolePalette,
  hex: string,
  preferredRole?: PaletteRoleId,
): RolePalette {
  const normalized = normalizeHex(hex);
  const group = classifyColorToGroup(normalized, DEFAULT_COLOR_GROUP_THRESHOLDS);
  const role = preferredRole ?? pickRoleForGroup(palette, group);

  return replaceRoleHex(palette, role, normalized);
}

function deriveSlotHex(
  role: PaletteRoleId,
  palette: RolePalette,
  neutralHue?: number,
  theme: 'light' | 'dark' = 'light',
): string {
  const fondoHex =
    neutralHue !== undefined ? deriveFondo(neutralHue, theme) : palette.fondo.hex;
  const neutrals = deriveNeutralRoles(fondoHex, palette.primario.hex, theme);

  switch (role) {
    case 'fondo':
      return neutralHue !== undefined
        ? deriveFondo(neutralHue, theme)
        : palette.fondo.hex;
    case 'superficie':
      return neutrals.superficie;
    case 'texto':
      return neutrals.texto;
    case 'borde':
      return neutrals.borde;
    case 'primario':
      return deriveChromatic(palette.primario.hex, 0);
    case 'secundario':
      return deriveSecondary(palette.primario.hex);
    case 'acento':
      return deriveChromatic(palette.primario.hex, 180);
  }
}

function setDerivedRoleSlot(palette: RolePalette, role: PaletteRoleId): RolePalette {
  const hex = deriveSlotHex(role, palette);
  const paletteInput = PALETTE_ROLE_ORDER.map((entry) => ({
    hex: entry === role ? hex : palette[entry].hex,
  }));

  return applyUniqueRoleNames({
    ...palette,
    [role]: createRoleSlot(role, hex, 'derived', paletteInput),
  });
}

export function toggleColorInRolePalette(
  palette: RolePalette,
  hex: string,
  preferredRole?: PaletteRoleId,
): RolePalette {
  const normalized = normalizeHex(hex);
  const matchingRole = PALETTE_ROLE_ORDER.find(
    (role) => normalizeHex(palette[role].hex) === normalized,
  );

  if (matchingRole) {
    return setDerivedRoleSlot(palette, matchingRole);
  }

  return assignColorToRolePalette(palette, hex, preferredRole);
}
