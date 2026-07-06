import { converter, formatHex } from 'culori';

import { CHROMA_MIN } from './harmony';
import { normalizeHex } from './normalizeHex';

const toOklch = converter('oklch');

export interface SeedOklch {
  l: number;
  c: number;
  h: number | undefined;
}

export function assertValidSeed(seed: string): void {
  if (typeof seed !== 'string' || seed.trim() === '') {
    throw new Error('Seed must be a non-empty color string');
  }
}

export function assertNonEmptySeeds(seeds: string[]): void {
  if (!Array.isArray(seeds) || seeds.length === 0) {
    throw new Error('At least one seed color is required');
  }
}

export function parseSeedOklch(seed: string): SeedOklch {
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

export function hueDistance(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

export function neutralChroma(seedChroma: number): number {
  if (seedChroma < CHROMA_MIN) {
    return 0.012;
  }

  return Math.min(0.06, Math.max(0.01, seedChroma * 0.12));
}

export function oklchToHex(l: number, c: number, h: number | undefined): string {
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

export function isChromatic(oklch: SeedOklch): boolean {
  return oklch.c >= CHROMA_MIN && oklch.h !== undefined;
}
