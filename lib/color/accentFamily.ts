import { converter } from 'culori';

import { getSimilarNamedColors } from './colorDetails';
import { normalizeHex } from './normalizeHex';
import { randomRoleColor } from './randomRoleColor';
import { paletteRoleForTokenName } from './semanticRoleProjection';
import type { PaletteRoleId } from './roleTypes';
import type { SemanticTokenName, SemanticTokenOverrides, SemanticTokens } from './semanticTokens';
import { deriveFromPrimary } from './uiColorCandidates';
import { oklchChannelsToHex } from '../utils/colorMath';

const toOklch = converter('oklch');

export const ACCENT_FAMILY_SIZE = 6;

const DATA_BY_SLOT = [
  'data-1',
  'data-2',
  'data-3',
  'data-4',
  'data-5',
  'data-6',
] as const satisfies readonly SemanticTokenName[];

function assertSlotIndex(index: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= ACCENT_FAMILY_SIZE) {
    throw new RangeError(`Accent family slot must be 0..${ACCENT_FAMILY_SIZE - 1}`);
  }
}

/** Tokens written when assigning a family slot. Slot 0 owns UI accent + chart series 1. */
export function accentFamilySlotTokens(index: number): SemanticTokenName[] {
  assertSlotIndex(index);
  if (index === 0) return ['accent', 'data-1'];
  return [DATA_BY_SLOT[index]!];
}

/** Token used for gap / assignment state in the panel (always a data-* token). */
export function accentFamilyPrimaryToken(index: number): SemanticTokenName {
  assertSlotIndex(index);
  return DATA_BY_SLOT[index]!;
}

export function accentFamilyLabel(index: number): string {
  assertSlotIndex(index);
  return `Acento ${index + 1}`;
}

/** Companion tokens that must stay in sync when editing accent or data-1. */
export function accentFamilyCompanionTokens(tokenName: SemanticTokenName): SemanticTokenName[] {
  if (tokenName === 'accent') return ['data-1'];
  if (tokenName === 'data-1') return ['accent'];
  return [];
}

/** Role anchor for building a same-hue counterpart when syncing accent-family tokens across themes. */
export function counterpartRoleForAccentFamilySync(
  tokenName: SemanticTokenName,
): PaletteRoleId | null {
  const direct = paletteRoleForTokenName(tokenName);
  if (direct) return direct;

  for (const companion of accentFamilyCompanionTokens(tokenName)) {
    const role = paletteRoleForTokenName(companion);
    if (role) return role;
  }

  if (tokenName.startsWith('data-')) return 'acento';

  return null;
}

export function syncAccentFamilyOverrides(
  overrides: SemanticTokenOverrides,
  tokenName: SemanticTokenName,
  hex: string,
): SemanticTokenOverrides {
  const normalized = normalizeHex(hex);
  const next: SemanticTokenOverrides = {
    ...overrides,
    [tokenName]: normalized,
  };

  for (const companion of accentFamilyCompanionTokens(tokenName)) {
    next[companion] = normalized;
  }

  return next;
}

export function applyAccentSlotToOverrides(
  overrides: SemanticTokenOverrides,
  index: number,
  hex: string,
): SemanticTokenOverrides {
  const normalized = normalizeHex(hex);
  const next = { ...overrides };

  for (const tokenName of accentFamilySlotTokens(index)) {
    next[tokenName] = normalized;
  }

  return next;
}

export function isAccentSlotAssigned(tokens: SemanticTokens, index: number): boolean {
  return !tokens[accentFamilyPrimaryToken(index)].gap;
}

export function accentSlotHex(tokens: SemanticTokens, index: number): string | null {
  if (!isAccentSlotAssigned(tokens, index)) return null;
  if (index === 0) return normalizeHex(tokens.accent.hex);
  return normalizeHex(tokens[accentFamilyPrimaryToken(index)].hex);
}

/** Hexes of other assigned family slots, for distinct derivation. */
export function accentFamilyOccupiedHexes(tokens: SemanticTokens, activeIndex: number): string[] {
  assertSlotIndex(activeIndex);
  const occupied: string[] = [];

  for (let index = 0; index < ACCENT_FAMILY_SIZE; index += 1) {
    if (index === activeIndex) continue;
    const hex = accentSlotHex(tokens, index);
    if (hex) occupied.push(hex);
  }

  return occupied;
}

export function accentFamilyHelpText(): string {
  return 'El 1 se usa en UI; 2–6 en gráficos.';
}

export type VaryAccentSlotContext = {
  fondoHex?: string;
  superficieHex?: string;
  textoHex?: string;
};

/** Next color for an accent-family slot: UI-safe accent for slot 0, distinct derive for 2–6. */
export function varyAccentSlotHex(
  tokens: SemanticTokens,
  index: number,
  context: VaryAccentSlotContext = {},
  random: () => number = Math.random,
): string {
  assertSlotIndex(index);
  if (index === 0) {
    return randomRoleColor('acento', context, random);
  }
  return deriveFromPrimary(
    tokens.primary.hex,
    accentFamilyOccupiedHexes(tokens, index),
  );
}

const ACCENT_VARY_SIMILAR_LIMIT = 12;
const ACCENT_VARY_MIN_CHROMA = 0.06;
const ACCENT_VARY_MIN_LIGHTNESS = 0.28;
const ACCENT_VARY_MAX_LIGHTNESS = 0.78;
const ACCENT_VARY_HUE_OFFSETS = [18, -18, 34, -34, 52, -52, 86, -86, 120, -120] as const;

/** Keeps accent cycling on colorful fills — skips near-white, near-black, and gray. */
export function isChromaticAccentCandidate(hex: string): boolean {
  const channels = toOklch(normalizeHex(hex));
  if (!channels) return false;
  const lightness = channels.l ?? 0;
  const chroma = channels.c ?? 0;
  return chroma >= ACCENT_VARY_MIN_CHROMA
    && lightness >= ACCENT_VARY_MIN_LIGHTNESS
    && lightness <= ACCENT_VARY_MAX_LIGHTNESS;
}

function synthesizeChromaticNeighbors(baseHex: string): string[] {
  const channels = toOklch(normalizeHex(baseHex));
  if (!channels || typeof channels.h !== 'number') return [];

  const lightness = Math.min(
    ACCENT_VARY_MAX_LIGHTNESS,
    Math.max(ACCENT_VARY_MIN_LIGHTNESS, channels.l ?? 0.55),
  );
  const chroma = Math.max(ACCENT_VARY_MIN_CHROMA, channels.c ?? 0.1);
  const baseHue = channels.h;

  return ACCENT_VARY_HUE_OFFSETS.map((offset) =>
    normalizeHex(oklchChannelsToHex(lightness, chroma, (baseHue + offset + 360) % 360)),
  );
}

/** Chromatic similar + hue neighbors, excluding the current hex and other occupied family slots. */
export function buildAccentVaryCandidates(
  baseHex: string,
  occupiedHexes: string[] = [],
): string[] {
  const base = normalizeHex(baseHex);
  const blocked = new Set(occupiedHexes.map((hex) => normalizeHex(hex)));
  blocked.add(base);

  const seen = new Set<string>();
  const candidates: string[] = [];

  function push(hex: string) {
    const normalized = normalizeHex(hex);
    if (blocked.has(normalized) || seen.has(normalized)) return;
    if (!isChromaticAccentCandidate(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  }

  for (const entry of getSimilarNamedColors(base, ACCENT_VARY_SIMILAR_LIMIT)) {
    push(entry.hex);
  }
  for (const hex of synthesizeChromaticNeighbors(base)) {
    push(hex);
  }

  return candidates;
}

export type AccentVaryStep = {
  hex: string;
  nextCursor: number;
};

/** Picks the next similar color in the cycle, or falls back to derive/random when none remain. */
export function nextAccentVaryHex(
  currentHex: string,
  occupiedHexes: string[],
  cursor: number,
  fallback: () => string,
): AccentVaryStep {
  const seed = normalizeHex(currentHex);
  let candidates = buildAccentVaryCandidates(seed, occupiedHexes);

  if (candidates.length === 0) {
    const fallbackHex = normalizeHex(fallback());
    candidates = buildAccentVaryCandidates(fallbackHex, occupiedHexes);
    if (candidates.length > 0) {
      const index = cursor % candidates.length;
      return { hex: candidates[index]!, nextCursor: cursor + 1 };
    }
    return { hex: fallbackHex, nextCursor: 0 };
  }

  const index = cursor % candidates.length;
  return { hex: candidates[index]!, nextCursor: cursor + 1 };
}

/** Cycles similar colors for an accent slot; uses primary when the slot is empty or too neutral. */
export function nextAccentSlotHex(
  tokens: SemanticTokens,
  index: number,
  cursor: number,
  context: VaryAccentSlotContext = {},
  random: () => number = Math.random,
): AccentVaryStep {
  assertSlotIndex(index);
  const occupied = accentFamilyOccupiedHexes(tokens, index);
  const assigned = accentSlotHex(tokens, index);
  const primary = normalizeHex(tokens.primary.hex);
  const current = assigned && isChromaticAccentCandidate(assigned)
    ? assigned
    : isChromaticAccentCandidate(primary)
      ? primary
      : assigned ?? primary;

  return nextAccentVaryHex(current, occupied, cursor, () => {
    if (index === 0) {
      return randomRoleColor('acento', context, random);
    }
    return deriveFromPrimary(tokens.primary.hex, occupied);
  });
}
