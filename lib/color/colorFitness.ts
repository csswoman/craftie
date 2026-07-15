import { converter } from 'culori';

import { remainsDistinctWithColorVisionDeficiency } from './colorVision';
import { deriveForegroundForBackground } from './pairedForeground';
import { contrastRatio, readableOn } from '../utils/colorMath';

const toOklab = converter('oklab');
const toOklch = converter('oklch');

export type ColorUse = 'text' | 'fill' | 'accent' | 'surface' | 'data';

export type ColorFitness = {
  asText: { ok: boolean; ratio: number };
  asFill: { ok: boolean; ratio: number };
  asAccent: { ok: boolean };
  asSurface: { ok: boolean; ratio: number };
  asData: { ok: boolean; ratio: number };
  bestUse: ColorUse;
};

export type FitnessResult = { ok: boolean; ratio?: number };

export type FitnessScenario = {
  backgroundHex: string;
  lightOnColorBaseHex: string;
  darkTextBaseHex: string;
  occupiedDataHexes?: string[];
};

const TEXT_MIN = 4.5;
const DATA_MIN = 3;
const ACCENT_MIN_OKLAB_DISTANCE = 0.03;

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function oklabDistance(leftHex: string, rightHex: string): number {
  const left = toOklab(leftHex);
  const right = toOklab(rightHex);
  if (!left || !right) return 0;
  return Math.hypot(
    (left.l ?? 0) - (right.l ?? 0),
    (left.a ?? 0) - (right.a ?? 0),
    (left.b ?? 0) - (right.b ?? 0),
  );
}

function separatedFromData(hex: string, occupiedHexes: string[]): boolean {
  const candidate = toOklch(hex);
  if (!candidate) return false;

  return occupiedHexes.every((occupiedHex) => {
    const occupied = toOklch(occupiedHex);
    if (!occupied) return false;
    const deltaHue = typeof candidate.h === 'number' && typeof occupied.h === 'number'
      ? hueDistance(candidate.h, occupied.h)
      : 0;
    const deltaL = Math.abs((candidate.l ?? 0) - (occupied.l ?? 0));
    return (deltaHue >= 25 || deltaL >= 0.15)
      && remainsDistinctWithColorVisionDeficiency(hex, occupiedHex);
  });
}

/** Evaluates one color against the real foreground/background used by each UI role. */
export function evaluateColorFitness(hex: string, scenario: FitnessScenario): ColorFitness {
  const textRatio = contrastRatio(hex, scenario.backgroundHex);
  const fillForeground = readableOn(scenario.lightOnColorBaseHex, hex, TEXT_MIN);
  const fillRatio = contrastRatio(fillForeground, hex);
  const surfaceForeground = readableOn(scenario.darkTextBaseHex, hex, TEXT_MIN);
  const surfaceRatio = contrastRatio(surfaceForeground, hex);
  const derivedSurfaceForeground = deriveForegroundForBackground(hex, TEXT_MIN);
  const candidateLightness = toOklch(hex)?.l ?? 0.5;
  const surfaceTextLightness = toOklch(surfaceForeground)?.l ?? 0.5;
  const derivedTextLightness = derivedSurfaceForeground.lightness;
  const dataRatio = textRatio;

  const asText = { ok: textRatio >= TEXT_MIN, ratio: textRatio };
  const asFill = { ok: fillRatio >= TEXT_MIN, ratio: fillRatio };
  const asAccent = {
    ok: oklabDistance(hex, scenario.backgroundHex) >= ACCENT_MIN_OKLAB_DISTANCE,
  };
  const asSurface = {
    ok: surfaceRatio >= TEXT_MIN
      && surfaceTextLightness < candidateLightness
      && derivedTextLightness < candidateLightness,
    ratio: surfaceRatio,
  };
  const asData = {
    ok: dataRatio >= DATA_MIN && separatedFromData(hex, scenario.occupiedDataHexes ?? []),
    ratio: dataRatio,
  };
  const bestUse: ColorUse = asText.ok
    ? 'text'
    : asData.ok
      ? 'data'
      : asFill.ok
        ? 'fill'
        : asSurface.ok
          ? 'surface'
          : 'accent';

  return { asText, asFill, asAccent, asSurface, asData, bestUse };
}

export function colorFitnessRecommendation(fitness: ColorFitness): string {
  if (fitness.bestUse === 'text' && fitness.asData.ok) return 'Ideal como texto o dato';
  if (fitness.bestUse === 'text') return 'Ideal como texto';
  if (fitness.bestUse === 'data') return 'Ideal como dato';
  if (fitness.bestUse === 'fill') return 'Mejor como fill o botón';
  if (fitness.bestUse === 'surface') return 'Mejor como superficie tintada';
  return 'Mejor como acento decorativo';
}

export function fitnessForUse(fitness: ColorFitness, use: ColorUse): FitnessResult {
  if (use === 'text') return fitness.asText;
  if (use === 'fill') return fitness.asFill;
  if (use === 'accent') return fitness.asAccent;
  if (use === 'surface') return fitness.asSurface;
  return fitness.asData;
}
