import { normalizeHex } from './normalizeHex';
import { randomRoleColor } from './randomRoleColor';
import type { SemanticTokenName, SemanticTokenOverrides, SemanticTokens } from './semanticTokens';
import { deriveFromPrimary } from './uiColorCandidates';

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
