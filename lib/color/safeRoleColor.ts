import {
  adjustLightnessForContrast,
  contrastRatio,
  hexToOklchChannels,
} from '../utils/colorMath';
import { normalizeHex } from './normalizeHex';
import type { PaletteRoleId, RolePalette } from './roleTypes';

const AA_RATIO = 4.5;

export type SafeRoleColor = {
  hex: string;
  ratio: number;
};

function passesAll(hex: string, backgrounds: string[]): boolean {
  return backgrounds.every((background) => contrastRatio(hex, background) >= AA_RATIO);
}

function minRatio(hex: string, backgrounds: string[]): number {
  return Math.min(...backgrounds.map((background) => contrastRatio(hex, background)));
}

function lightnessDelta(fromHex: string, toHex: string): number {
  return Math.abs(hexToOklchChannels(fromHex).l - hexToOklchChannels(toHex).l);
}

/**
 * Finds a foreground close to `foregroundHex` (same hue/chroma, minimal lightness
 * shift) that stays AA across every background it paints on.
 */
function safeForegroundNear(
  foregroundHex: string,
  backgrounds: string[],
): SafeRoleColor | null {
  const candidates = backgrounds
    .map((background) => adjustLightnessForContrast(foregroundHex, background, AA_RATIO))
    .filter((hex) => passesAll(hex, backgrounds));

  if (candidates.length === 0) {
    return null;
  }

  const best = candidates.reduce((closest, hex) =>
    lightnessDelta(hex, foregroundHex) < lightnessDelta(closest, foregroundHex) ? hex : closest,
  );

  return { hex: best, ratio: minRatio(best, backgrounds) };
}

/**
 * Keeps `backgroundHex` visually close (same hue/chroma) but shifts its lightness
 * so the existing text stays legible on it.
 */
function safeBackgroundNear(
  backgroundHex: string,
  textHex: string,
): SafeRoleColor | null {
  const candidate = adjustLightnessForContrast(backgroundHex, textHex, AA_RATIO);

  if (contrastRatio(candidate, textHex) < AA_RATIO) {
    return null;
  }

  return { hex: candidate, ratio: contrastRatio(candidate, textHex) };
}

/**
 * Returns a color near the role's current value that satisfies AA, or null when
 * the role has no fixable neutral text pair (or no nearby color works).
 */
export function getSafeRoleColorNearCurrent(
  palette: RolePalette,
  role: PaletteRoleId,
): SafeRoleColor | null {
  let candidate: SafeRoleColor | null;

  switch (role) {
    case 'texto':
      candidate = safeForegroundNear(palette.texto.hex, [
        palette.fondo.hex,
        palette.superficie.hex,
      ]);
      break;
    case 'fondo':
      candidate = safeBackgroundNear(palette.fondo.hex, palette.texto.hex);
      break;
    case 'superficie':
      candidate = safeBackgroundNear(palette.superficie.hex, palette.texto.hex);
      break;
    default:
      return null;
  }

  if (!candidate) {
    return null;
  }

  const currentHex = normalizeHex(palette[role].hex);

  if (normalizeHex(candidate.hex) === currentHex) {
    return null;
  }

  return candidate;
}
