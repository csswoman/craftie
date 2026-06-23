import { formatHex, parse } from 'culori';

function hasTransparency(color: { alpha?: number; mode?: string }): boolean {
  if (color.mode === 'transparent') {
    return true;
  }

  return typeof color.alpha === 'number' && color.alpha < 1;
}

/**
 * Normalizes a color string to uppercase #RRGGBB.
 */
export function normalizeHex(input: string): string {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('Invalid color input: expected a non-empty string');
  }

  const parsed = parse(input.trim());

  if (parsed === undefined) {
    throw new Error(`Unable to parse color: "${input.trim()}"`);
  }

  if (hasTransparency(parsed)) {
    throw new Error(`Unsupported alpha/transparency in color: "${input.trim()}"`);
  }

  const hex = formatHex(parsed);

  if (hex === undefined) {
    throw new Error(`Unable to format color as hex: "${input.trim()}"`);
  }

  return hex.toUpperCase();
}

export function isValidOpaqueHex(input: string): boolean {
  try {
    normalizeHex(input);
    return true;
  } catch {
    return false;
  }
}

const STRICT_HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** True when input is exactly `#RRGGBB` (case-insensitive). */
export function isStrictHex(input: string): boolean {
  return STRICT_HEX_PATTERN.test(input.trim());
}
