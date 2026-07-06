import { converter, formatHex } from 'culori';

import {
  classifyColorToGroup,
  DEFAULT_COLOR_GROUP_THRESHOLDS,
  LIGHT_NEUTRAL_LIGHTNESS_MIN,
  NEUTRAL_CHROMA_MAX,
} from './colorGroupClassification';
import type { GeneratedPalette } from './formulas';
import { finalizePalette } from './formulas';
import type { ExtractedColor } from './imageExtractor';
import { nameForHex, namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
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

export type PaletteRoleId =
  | 'fondo'
  | 'superficie'
  | 'texto'
  | 'primario'
  | 'secundario'
  | 'acento'
  | 'borde';

export type ColorSource = 'extracted' | 'derived';

export type RoleSlot = {
  role: PaletteRoleId;
  hex: string;
  name: string;
  source: ColorSource;
};

export type RolePalette = Record<PaletteRoleId, RoleSlot>;

export const PALETTE_ROLE_ORDER: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'primario',
  'secundario',
  'acento',
  'borde',
];

export const ROLE_LABELS: Record<PaletteRoleId, string> = {
  fondo: 'Fondo',
  superficie: 'Superficie',
  texto: 'Texto',
  primario: 'Primario',
  secundario: 'Secundario',
  acento: 'Acento',
  borde: 'Borde',
};

export const SEED_ROLES: PaletteRoleId[] = ['primario', 'acento'];

export const DERIVED_ROLES: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'secundario',
  'borde',
];

const toOklch = converter('oklch');

type ColorCandidate = {
  hex: string;
  prominence: number;
  lightness: number;
  chroma: number;
  hue: number;
  isNeutral: boolean;
};

function oklchToHex(lightness: number, chroma: number, hue: number): string {
  const converted = toOklch({ mode: 'oklch', l: lightness, c: chroma, h: hue });

  if (!converted || converted.mode !== 'oklch') {
    return '#000000';
  }

  return formatHex(converted) ?? '#000000';
}

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

function createSlot(
  role: PaletteRoleId,
  hex: string,
  source: ColorSource,
  paletteInput: { hex: string }[],
): RoleSlot {
  const normalized = normalizeHex(hex);

  return {
    role,
    hex: normalized,
    name: nameForHex(normalized, paletteInput, { style: 'creative' }),
    source,
  };
}

function deriveChromatic(seedHex: string, hueOffset: number): string {
  const seed = toOklch(seedHex);

  if (!seed || seed.mode !== 'oklch') {
    return seedHex;
  }

  const hue = ((seed.h ?? 0) + hueOffset) % 360;
  const chroma = Math.max(seed.c ?? 0.1, 0.08);
  const lightness = Math.min(Math.max(seed.l ?? 0.55, 0.45), 0.72);

  return oklchToHex(lightness, chroma, hue);
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

function buildPaletteInput(slots: Partial<Record<PaletteRoleId, string>>): { hex: string }[] {
  return PALETTE_ROLE_ORDER.map((role) => slots[role]).filter(Boolean).map((hex) => ({ hex: hex! }));
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

  palette.fondo = createSlot(
    'fondo',
    slots.fondo,
    sources?.fondo ?? 'derived',
    paletteInput,
  );
  palette.primario = createSlot(
    'primario',
    slots.primario,
    sources?.primario ?? 'derived',
    paletteInput,
  );
  palette.acento = createSlot(
    'acento',
    slots.acento,
    sources?.acento ?? 'derived',
    paletteInput,
  );

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    palette[role] = createSlot(role, slots.fondo, 'derived', paletteInput);
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
  return applyUniqueNames(palette);
}

export function recomputeDerivedRoles(
  palette: RolePalette,
  lockedRoles: PaletteRoleId[] = [],
  seeds?: Pick<PaletteSeeds, 'neutralHue'>,
  theme: 'light' | 'dark' = 'light',
): RolePalette {
  const locked = new Set<PaletteRoleId>(lockedRoles);
  const fondoHex =
    seeds && !locked.has('fondo')
      ? deriveFondo(seeds.neutralHue, theme)
      : palette.fondo.hex;
  const neutrals = deriveNeutralRoles(fondoHex, palette.primario.hex, theme);
  const textoHex = locked.has('texto') ? palette.texto.hex : neutrals.texto;

  const slotHex: Partial<Record<PaletteRoleId, string>> = {
    fondo: fondoHex,
    primario: palette.primario.hex,
    acento: palette.acento.hex,
    secundario: locked.has('secundario')
      ? palette.secundario.hex
      : deriveSecondary(palette.primario.hex),
    texto: textoHex,
    superficie: locked.has('superficie') ? palette.superficie.hex : neutrals.superficie,
    borde: locked.has('borde') ? palette.borde.hex : neutrals.borde,
  };

  const paletteInput = buildPaletteInput(slotHex);
  const next = { ...palette };

  if (!locked.has('fondo')) {
    next.fondo = createSlot('fondo', fondoHex, 'derived', paletteInput);
  }

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    const hex = slotHex[role]!;
    const source: ColorSource = locked.has(role) ? palette[role].source : 'derived';
    next[role] = createSlot(role, hex, source, paletteInput);
  }

  return applyUniqueNames(next);
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

function applyUniqueNames(palette: RolePalette): RolePalette {
  const names = namePalette(
    PALETTE_ROLE_ORDER.map((role) => ({ hex: palette[role].hex })),
    { style: 'creative' },
  );

  const next = { ...palette };

  for (const role of PALETTE_ROLE_ORDER) {
    next[role] = {
      ...next[role],
      name: names.get(normalizeHex(next[role].hex)) ?? ROLE_LABELS[role],
    };
  }

  return next;
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

  return applyUniqueNames(merged);
}

export function isPaletteRoleId(id: string): id is PaletteRoleId {
  return (PALETTE_ROLE_ORDER as string[]).includes(id);
}

export function validateRolePalette(palette: RolePalette | null): { ok: true } | { ok: false; error: string } {
  if (!palette) {
    return { ok: false, error: 'Sube una imagen o elige inspiración para armar tu paleta.' };
  }

  return { ok: true };
}

export function rolePaletteToGeneratedPalette(palette: RolePalette): GeneratedPalette {
  return {
    primary: palette.primario.hex,
    accent: palette.acento.hex,
    surface: palette.fondo.hex,
    onSurface: palette.texto.hex,
    neutralLight: palette.superficie.hex,
    neutralDark: palette.borde.hex,
  };
}

export function generatePaletteFromRolePalette(palette: RolePalette): GeneratedPalette {
  const base = rolePaletteToGeneratedPalette(palette);

  return finalizePalette(base, palette.primario.hex, {
    skipGeneratedAccent: palette.acento.source === 'extracted',
  });
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

  const updated = applyUniqueNames(next);

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

  return applyUniqueNames({
    ...palette,
    [role]: createSlot(role, hex, 'derived', paletteInput),
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
