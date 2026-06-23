import { normalizeHex, isStrictHex } from './normalizeHex';

export const MIN_SEED_COUNT = 1;
export const MAX_SEED_COUNT = 3;

export const DEFAULT_SEED_HEX = '#2F5644';

export type SeedValidationResult =
  | { ok: true; seeds: string[] }
  | { ok: false; error: string };

export function createDefaultSeeds(): string[] {
  return [DEFAULT_SEED_HEX];
}

export function canAddSeed(seeds: string[]): boolean {
  return seeds.length < MAX_SEED_COUNT;
}

export function canRemoveSeed(seeds: string[]): boolean {
  return seeds.length > MIN_SEED_COUNT;
}

export function addSeed(seeds: string[]): string[] {
  if (!canAddSeed(seeds)) {
    return seeds;
  }

  return [...seeds, DEFAULT_SEED_HEX];
}

export function removeSeedAt(seeds: string[], index: number): string[] {
  if (!canRemoveSeed(seeds) || index < 0 || index >= seeds.length) {
    return seeds;
  }

  return seeds.filter((_, seedIndex) => seedIndex !== index);
}

export function updateSeedAt(seeds: string[], index: number, value: string): string[] {
  if (index < 0 || index >= seeds.length) {
    return seeds;
  }

  return seeds.map((seed, seedIndex) => (seedIndex === index ? value : seed));
}

export function replaceSeeds(nextSeeds: string[]): string[] {
  if (nextSeeds.length < MIN_SEED_COUNT) {
    return createDefaultSeeds();
  }

  if (nextSeeds.length > MAX_SEED_COUNT) {
    return nextSeeds.slice(0, MAX_SEED_COUNT);
  }

  return [...nextSeeds];
}

/**
 * Validates seed inputs for palette generation. Requires 1–3 strict `#RRGGBB` values.
 */
export function validateSeedsForGeneration(seeds: string[]): SeedValidationResult {
  if (seeds.length < MIN_SEED_COUNT) {
    return { ok: false, error: 'Añade al menos un color semilla.' };
  }

  if (seeds.length > MAX_SEED_COUNT) {
    return { ok: false, error: `Admite hasta ${MAX_SEED_COUNT} colores semilla.` };
  }

  for (let index = 0; index < seeds.length; index += 1) {
    const seed = seeds[index]!.trim();

    if (seed === '') {
      return {
        ok: false,
        error: `El color semilla ${index + 1} no puede estar vacío.`,
      };
    }

    if (!isStrictHex(seed)) {
      return {
        ok: false,
        error: `El color semilla ${index + 1} debe ser un HEX válido (#RRGGBB).`,
      };
    }
  }

  try {
    const normalized = seeds.map((seed) => normalizeHex(seed));
    return { ok: true, seeds: normalized };
  } catch {
    return { ok: false, error: 'Uno o más colores semilla no son válidos.' };
  }
}
