import { remainsDistinctWithColorVisionDeficiency } from './colorVision';
import { EXPRESSIVE_SOURCE_CHROMA_MIN, hueDistance } from './expressiveSelection';
import { normalizeHex } from './normalizeHex';
import { toOklch } from './oklchMath';
import type { FitnessColor } from './roleFitness';
import type { SemanticToken } from './semanticTokens';
import {
  contrastRatio,
  oklchChannelsToHex,
  relativeLuminance,
} from '../utils/colorMath';
import { calibrateDataSeriesHex, dataSeriesChromaFloorForVibrancy } from './vibrancy';

/**
 * Data series (chart) colors: six categorical colors derived from source
 * hues, legible on the surface and distinct for common color vision
 * deficiencies.
 */

function seriesToken(
  hex: string,
  source: SemanticToken['source'],
  details?: Pick<SemanticToken, 'originalHex' | 'gap'>,
): SemanticToken {
  return { hex: normalizeHex(hex), source, ...details };
}

const DATA_SERIES_MIN_HUE_DISTANCE = 24;
const DATA_SERIES_MIN_LIGHTNESS_DISTANCE = 0.02;
const DATA_SERIES_MIN_CONTRAST = 3;
// Data marks are display colors optimized for legibility, not source-fidelity.
// Low-chroma source palettes are boosted toward this floor, capped below neon.
const DATA_SERIES_MIN_CHROMA = 0.18;
const DATA_SERIES_REALIZED_CHROMA_MIN = DATA_SERIES_MIN_CHROMA * 0.5;
const DATA_SERIES_CHROMA_CAP = 0.34;
const DATA_SERIES_LIGHT_TARGET = 0.56;
const DATA_SERIES_LIGHT_L = [0.56, 0.52, 0.6, 0.48, 0.44, 0.64, 0.4, 0.36] as const;
const DATA_SERIES_DARK_L = [0.62, 0.68, 0.56, 0.74, 0.5, 0.8, 0.44] as const;
const DATA_SERIES_MONO_LIGHT_L = [0.6, 0.54, 0.48, 0.42, 0.36, 0.3] as const;
const DATA_SERIES_MONO_DARK_L = [0.54, 0.6, 0.66, 0.72, 0.78, 0.84] as const;
const DATA_SERIES_HUE_NUDGE = [0, -18, 18, -36, 36, -54, 54] as const;
function colorsAreDistinguishable(leftHex: string, rightHex: string): boolean {
  const left = toOklch(leftHex);
  const right = toOklch(rightHex);
  const leftHue = left?.h;
  const rightHue = right?.h;
  const hueSeparated =
    typeof leftHue === 'number' &&
    typeof rightHue === 'number' &&
    hueDistance(leftHue, rightHue) >= DATA_SERIES_MIN_HUE_DISTANCE;
  const lightnessSeparated = Math.abs((left?.l ?? 0) - (right?.l ?? 0)) >= DATA_SERIES_MIN_LIGHTNESS_DISTANCE;

  return hueSeparated || lightnessSeparated;
}

function dataSeriesIdentityScore(hex: string): number {
  const channels = toOklch(hex);
  return (channels?.c ?? 0) * 4 - Math.abs((channels?.l ?? DATA_SERIES_LIGHT_TARGET) - DATA_SERIES_LIGHT_TARGET);
}

export function buildDataSeriesIdentities(
  tokens: SemanticToken[],
  dominantHueValue: number,
  expressivePoolSize: number,
  vibrancy: number,
): string[] {
  const chromaFloor = dataSeriesChromaFloorForVibrancy(DATA_SERIES_MIN_CHROMA, vibrancy);

  if (expressivePoolSize <= 1) {
    return DATA_SERIES_LIGHT_L.map((lightness) =>
      calibrateDataSeriesHex(
        oklchChannelsToHex(lightness, DATA_SERIES_CHROMA_CAP, dominantHueValue),
        vibrancy,
        DATA_SERIES_MIN_CHROMA,
        DATA_SERIES_CHROMA_CAP,
      ),
    ).slice(0, 6);
  }

  const candidates = tokens
    .filter((entry, index, entries) => {
      const hex = normalizeHex(entry.hex);
      return entries.findIndex((candidate) => normalizeHex(candidate.hex) === hex) === index;
    })
    .map((entry) => {
      const channels = toOklch(entry.hex);
      const chroma = Math.min(
        DATA_SERIES_CHROMA_CAP,
        Math.max(channels?.c ?? 0, chromaFloor),
      );
      return calibrateDataSeriesHex(
        oklchChannelsToHex(channels?.l ?? DATA_SERIES_LIGHT_TARGET, chroma, channels?.h ?? dominantHueValue),
        vibrancy,
        DATA_SERIES_MIN_CHROMA,
        DATA_SERIES_CHROMA_CAP,
      );
    })
    .sort((left, right) => dataSeriesIdentityScore(right) - dataSeriesIdentityScore(left));
  const picked: string[] = [];

  for (const hex of candidates) {
    if (picked.every((entry) => colorsAreDistinguishable(hex, entry))) {
      picked.push(hex);
    }

    if (picked.length === 6) {
      return picked;
    }
  }

  const offsets = [0, 52, 104, 156, 208, 260];

  for (const offset of offsets) {
    if (picked.length === 6) {
      break;
    }

    const hue = (dominantHueValue + offset) % 360;
    const fallback = calibrateDataSeriesHex(
      oklchChannelsToHex(DATA_SERIES_LIGHT_TARGET, DATA_SERIES_CHROMA_CAP, hue),
      vibrancy,
      DATA_SERIES_MIN_CHROMA,
      DATA_SERIES_CHROMA_CAP,
    );

    if (picked.every((entry) => colorsAreDistinguishable(fallback, entry))) {
      picked.push(fallback);
    }
  }

  return picked.slice(0, 6);
}

function chooseSeriesLightness(
  identityHex: string,
  surfaceHex: string,
  lightnesses: readonly number[],
  picked: SemanticToken[],
  chromaFloor: number,
): SemanticToken | null {
  const channels = toOklch(identityHex);

  if (!channels) {
    return null;
  }

  const identityHue = channels.h ?? 0;
  const identityChroma = channels.c ?? 0;

  let best: { hex: string; score: number } | null = null;

  for (const lightness of lightnesses) {
    const hex = oklchChannelsToHex(lightness, identityChroma, identityHue);
    const channels = toOklch(hex);
    const resolved = channels
      ? oklchChannelsToHex(
        channels.l ?? lightness,
        Math.min(DATA_SERIES_CHROMA_CAP, Math.max(channels.c ?? 0, chromaFloor)),
        channels.h ?? identityHue,
      )
      : hex;
    const resolvedChroma = toOklch(resolved)?.c ?? 0;

    if (contrastRatio(resolved, surfaceHex) < DATA_SERIES_MIN_CONTRAST) {
      continue;
    }

    if (resolvedChroma < Math.min(chromaFloor * 0.85, DATA_SERIES_REALIZED_CHROMA_MIN)) {
      continue;
    }

    if (!picked.every((entry) => colorsAreDistinguishable(resolved, entry.hex))) {
      continue;
    }

    const score = resolvedChroma * 4 - Math.abs((toOklch(resolved)?.l ?? lightness) - DATA_SERIES_LIGHT_TARGET);

    if (!best || score > best.score) {
      best = { hex: resolved, score };
    }
  }

  return best ? seriesToken(best.hex, 'derived') : null;
}

export function materializeSeries(
  identities: string[],
  surfaceHex: string,
  theme: 'light' | 'dark',
  vibrancy: number,
): SemanticToken[] {
  const picked: SemanticToken[] = [];
  const chromaFloor = dataSeriesChromaFloorForVibrancy(DATA_SERIES_MIN_CHROMA, vibrancy);
  const surfaceIsLight = relativeLuminance(surfaceHex) >= 0.5;
  const preferredLightnesses = surfaceIsLight
    ? [0.42, 0.48, 0.54, 0.6, 0.66, 0.72, 0.36]
    : [0.62, 0.68, 0.74, 0.8, 0.56, 0.48, 0.84];

  for (const identity of identities) {
    const tokenCandidate = chooseSeriesLightness(
      identity,
      surfaceHex,
      preferredLightnesses,
      picked,
      chromaFloor,
    );

    if (tokenCandidate) {
      picked.push(tokenCandidate);
    }
  }

  if (picked.length === 6) {
    return picked;
  }

  const backupLightnesses = theme === 'dark'
    ? DATA_SERIES_DARK_L
    : DATA_SERIES_LIGHT_L;

  for (const identity of identities) {
    if (picked.length === 6) {
      break;
    }

    const tokenCandidate = chooseSeriesLightness(
      identity,
      surfaceHex,
      backupLightnesses,
      picked,
      chromaFloor,
    );

    if (tokenCandidate) {
      picked.push(tokenCandidate);
    }
  }

  return picked.slice(0, 6);
}

/** Expressive sources for data series, most chromatic first. */
export function dataSeriesSources(candidates: FitnessColor[]): FitnessColor[] {
  const maximumProminence = Math.max(...candidates.map((candidate) => candidate.prominence), 0);
  const areaFloor = maximumProminence * 0.12;

  return candidates
    .filter((candidate) => candidate.chroma >= EXPRESSIVE_SOURCE_CHROMA_MIN && candidate.prominence >= areaFloor)
    .sort((left, right) => right.chroma - left.chroma || right.prominence - left.prominence);
}

export function sourceDataSeries(
  expressive: FitnessColor[],
  backgroundHex: string,
  theme: 'light' | 'dark',
  fallback: SemanticToken,
): SemanticToken[] {
  const lightnessTargets = theme === 'dark'
    ? [0.58, 0.73, 0.88, 0.43]
    : [0.62, 0.47, 0.32, 0.77];
  const picked: SemanticToken[] = [];
  const tryAdd = (source: FitnessColor, lightness: number): boolean => {
    const candidateHex = oklchChannelsToHex(lightness, source.chroma, source.hue);
    const candidate = toOklch(candidateHex);

    if (contrastRatio(candidateHex, backgroundHex) < DATA_SERIES_MIN_CONTRAST) {
      return false;
    }

    const separated = picked.every((entry) => {
      const previous = toOklch(entry.hex);
      const hueSeparated = hueDistance(candidate?.h ?? source.hue, previous?.h ?? source.hue) >= 25;
      const lightnessSeparated = Math.abs((candidate?.l ?? lightness) - (previous?.l ?? 0)) >= 0.15;

      return (hueSeparated || lightnessSeparated) &&
        remainsDistinctWithColorVisionDeficiency(candidateHex, entry.hex);
    });

    if (!separated || picked.some((entry) => entry.hex === candidateHex)) {
      return false;
    }

    picked.push(seriesToken(candidateHex, 'derived', { originalHex: source.hex }));
    return true;
  };

  // First give every source hue one series, then fill with lightness
  // variants; otherwise the most chromatic source could take every slot with
  // shades of itself while other source hues go unused.
  for (const source of expressive) {
    for (const lightness of [source.lightness, ...lightnessTargets]) {
      if (tryAdd(source, lightness)) {
        break;
      }
    }

    if (picked.length === 6) {
      return picked;
    }
  }

  for (const source of expressive) {
    for (const lightness of [source.lightness, ...lightnessTargets]) {
      tryAdd(source, lightness);

      if (picked.length === 6) {
        return picked;
      }
    }
  }

  const gapMessage = 'La imagen no ofrece variedad suficiente para otra categoría de datos. Deriva una variante de luminosidad o elige un color fuente.';

  while (picked.length < 6) {
    picked.push(seriesToken(picked.at(-1)?.hex ?? fallback.hex, 'derived', { gap: gapMessage }));
  }

  return picked;
}
