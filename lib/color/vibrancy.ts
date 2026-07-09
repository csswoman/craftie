import { converter } from 'culori';

import { oklchChannelsToHex } from '../utils/colorMath';
import { normalizeHex } from './normalizeHex';

export const VIBRANCY_MIN = 0;
export const VIBRANCY_MID = 50;
export const VIBRANCY_MAX = 100;

/**
 * Tunable OKLCH vibrancy curve endpoints.
 *
 * - 0 Pastel: raises lightness and lowers chroma for soft, light color.
 * - 50 Equilibrado: identity transform; existing derived colors stay unchanged.
 * - 100 Brillante: raises chroma and centers lightness for vivid color.
 *
 * Hue is always preserved. Structural neutral tokens never use this curve.
 */
export const VIBRANCY_CURVE = {
  pastel: {
    lightness: 0.8,
    chromaMultiplier: 0.42,
    chromaCeiling: 0.09,
  },
  balanced: {
    value: VIBRANCY_MID,
  },
  bright: {
    lightness: 0.58,
    chromaMultiplier: 1.55,
    chromaFloor: 0.17,
    chromaCeiling: 0.36,
  },
} as const;

const toOklch = converter('oklch');

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * amount;
}

export function dataSeriesChromaFloorForVibrancy(chromaFloor: number, vibrancy: number): number {
  if (vibrancy >= VIBRANCY_MID) {
    return chromaFloor;
  }

  const amount = (VIBRANCY_MID - vibrancy) / VIBRANCY_MID;
  const pastelFloor = chromaFloor * VIBRANCY_CURVE.pastel.chromaMultiplier;

  return lerp(chromaFloor, pastelFloor, amount);
}

export function normalizeVibrancy(value: number | undefined): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return VIBRANCY_MID;
  }

  return clamp(value, VIBRANCY_MIN, VIBRANCY_MAX);
}

export function calibrateExpressiveHex(hex: string, vibrancyInput: number | undefined): string {
  const vibrancy = normalizeVibrancy(vibrancyInput);
  const normalized = normalizeHex(hex);

  if (vibrancy === VIBRANCY_MID) {
    return normalized;
  }

  const channels = toOklch(normalized);

  if (!channels || channels.mode !== 'oklch') {
    return normalized;
  }

  const lightness = channels.l ?? 0.5;
  const chroma = channels.c ?? 0;
  const hue = channels.h ?? 0;

  if (vibrancy < VIBRANCY_MID) {
    const amount = (VIBRANCY_MID - vibrancy) / VIBRANCY_MID;
    const pastelChroma = Math.min(
      VIBRANCY_CURVE.pastel.chromaCeiling,
      chroma * VIBRANCY_CURVE.pastel.chromaMultiplier,
    );

    return oklchChannelsToHex(
      lerp(lightness, VIBRANCY_CURVE.pastel.lightness, amount),
      lerp(chroma, pastelChroma, amount),
      hue,
    );
  }

  const amount = (vibrancy - VIBRANCY_MID) / (VIBRANCY_MAX - VIBRANCY_MID);
  const brightChroma = Math.min(
    VIBRANCY_CURVE.bright.chromaCeiling,
    Math.max(
      VIBRANCY_CURVE.bright.chromaFloor,
      chroma * VIBRANCY_CURVE.bright.chromaMultiplier,
    ),
  );

  return oklchChannelsToHex(
    lerp(lightness, VIBRANCY_CURVE.bright.lightness, amount),
    lerp(chroma, brightChroma, amount),
    hue,
  );
}

export function calibrateDataSeriesHex(
  hex: string,
  vibrancyInput: number | undefined,
  chromaFloor: number,
  chromaCap: number,
): string {
  const vibrancy = normalizeVibrancy(vibrancyInput);
  const calibrated = calibrateExpressiveHex(hex, vibrancyInput);
  const channels = toOklch(calibrated);

  if (!channels || channels.mode !== 'oklch') {
    return calibrated;
  }

  const effectiveChromaFloor = dataSeriesChromaFloorForVibrancy(chromaFloor, vibrancy);

  return oklchChannelsToHex(
    channels.l ?? 0.56,
    clamp(channels.c ?? 0, effectiveChromaFloor, chromaCap),
    channels.h ?? 0,
  );
}
