import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import { normalizeHex } from './normalizeHex';
import { classifyPalette, type PaletteType } from './paletteClassification';
import { deriveOnTokenHexForFill } from './pairedOnToken';
import { remainsDistinctWithColorVisionDeficiency } from './colorVision';
import { brandScore, type FitnessColor } from './roleFitness';
import {
  deriveTonalScale,
  TONAL_SCALE_STEPS,
  TONAL_TEXT_CARRIER_STEPS,
  type TonalScaleStep,
} from './tonalScale';
import {
  adjustLightnessForContrast,
  bestTextOn,
  contrastRatio,
  oklchChannelsToHex,
  relativeLuminance,
  readableOn,
} from '../utils/colorMath';
import {
  calibrateDataSeriesHex,
  calibrateExpressiveHex,
  dataSeriesChromaFloorForVibrancy,
  normalizeVibrancy,
} from './vibrancy';

export type ExpressiveScaleBase = 'primary' | 'secondary' | 'accent';
export type TonalTokenName = `${ExpressiveScaleBase}-${TonalScaleStep}`;
export type OnTonalTokenName =
  | `on-${ExpressiveScaleBase}-500`
  | `on-${ExpressiveScaleBase}-600`;

export type SemanticTokenName =
  | 'background'
  | 'surface'
  | 'surface-elevated'
  | 'background-inverse'
  | 'surface-inverse'
  | 'surface-inverse-elevated'
  | 'on-background'
  | 'on-surface'
  | 'on-surface-muted'
  | 'on-background-inverse'
  | 'on-surface-inverse'
  | 'border'
  | 'divider'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'on-primary'
  | 'on-secondary'
  | 'on-accent'
  | 'hero-surface'
  | 'on-hero'
  | 'success'
  | 'warning'
  | 'error'
  | 'data-1'
  | 'data-2'
  | 'data-3'
  | 'data-4'
  | 'data-5'
  | 'data-6'
  | TonalTokenName
  | OnTonalTokenName;

export type SemanticTokenSource = 'extracted' | 'derived' | 'corrected' | 'override';

export type SemanticToken = {
  hex: string;
  source: SemanticTokenSource;
  originalHex?: string;
  gap?: string;
};

export type SemanticTokens = Record<SemanticTokenName, SemanticToken>;

export type SemanticTokenOverrides = Partial<Record<SemanticTokenName, string>>;

export type ExpressiveSynthesisStrategy = 'analogous' | 'complementary' | 'analogous-with-accent';
export type NeutralStyle = 'pure' | 'tinted';

export type SemanticTokenDerivationInput = {
  extracted: ExtractedColor[];
  overrides?: SemanticTokenOverrides;
  theme?: 'light' | 'dark';
  synthesisStrategy?: ExpressiveSynthesisStrategy;
  neutralStyle?: NeutralStyle;
  vibrancy?: number;
  paletteType?: PaletteType;
};

const toOklch = converter('oklch');

const AA_RATIO = 4.5;
const EXPRESSIVE_CHROMA_MIN = 0.055;
const ACHROMATIC_CHROMA_MAX = 0.01;
type NeutralRamp = {
  background: readonly [number, number];
  surface: readonly [number, number];
  elevated: readonly [number, number];
  border: readonly [number, number];
  divider: readonly [number, number];
  textMuted: readonly [number, number];
  text: readonly [number, number];
};

const LIGHT_NEUTRAL: NeutralRamp = {
  background: [0.98, 0.008],
  surface: [0.96, 0.012],
  elevated: [0.94, 0.016],
  border: [0.88, 0.02],
  divider: [0.92, 0.018],
  // 0.53 is the nearest AA-safe realization of the 0.55 design target on
  // the 0.96 surface after sRGB/HEX round-trip.
  textMuted: [0.53, 0.03],
  text: [0.25, 0.03],
};
const DARK_NEUTRAL: NeutralRamp = {
  background: [0.15, 0.02],
  surface: [0.19, 0.024],
  elevated: [0.23, 0.028],
  border: [0.32, 0.03],
  divider: [0.27, 0.03],
  textMuted: [0.7, 0.03],
  text: [0.92, 0.02],
};
export const DEFAULT_NEUTRAL_STYLE: NeutralStyle = 'tinted';
const STANDARD_STATE_HUES = {
  success: 145,
  warning: 82,
  error: 28,
};
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
const EXPRESSIVE_SYNTHESIS = {
  // Fallback strategy used only when chroma-filtered extracted candidates are
  // missing or insufficient. Tune here without changing layout mode renderers.
  synthesisStrategy: 'analogous-with-accent' as ExpressiveSynthesisStrategy,
  // Analogous fallbacks stay close to primary: +/- 34deg inside the requested
  // 30-40deg band.
  analogousSecondaryOffset: 34,
  analogousAccentOffset: -34,
  // Complementary fallbacks keep the previous comparison family near 180deg;
  // secondary is split slightly to avoid identical synthesized colors.
  complementarySecondaryOffset: 170,
  complementaryAccentOffset: 180,
};

function toCandidate(color: ExtractedColor): FitnessColor {
  const hex = normalizeHex(color.hex);
  const oklch = toOklch(hex);
  const chroma = oklch?.c ?? 0;

  return {
    hex,
    prominence: color.prominence,
    lightness: oklch?.l ?? 0,
    chroma,
    hue: oklch?.h ?? 0,
    isNeutral: chroma <= EXPRESSIVE_CHROMA_MIN,
  };
}

function uniqueCandidates(extracted: ExtractedColor[]): FitnessColor[] {
  const byHex = new Map<string, FitnessColor>();

  for (const color of extracted) {
    const candidate = toCandidate(color);
    const existing = byHex.get(candidate.hex);

    if (!existing || candidate.prominence > existing.prominence) {
      byHex.set(candidate.hex, candidate);
    }
  }

  return [...byHex.values()];
}

function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function mixHue(baseHue: number, targetHue: number, targetWeight: number): number {
  const delta = ((((targetHue - baseHue) % 360) + 540) % 360) - 180;
  return (baseHue + delta * targetWeight + 360) % 360;
}

function dominantHue(candidates: FitnessColor[]): { hue: number; achromatic: boolean } {
  const chromatic = candidates.filter((candidate) => candidate.chroma > ACHROMATIC_CHROMA_MAX);

  if (chromatic.length === 0) {
    return { hue: 0, achromatic: false };
  }

  const vector = chromatic.reduce(
    (total, candidate) => {
      const radians = (candidate.hue * Math.PI) / 180;
      return {
        x: total.x + Math.cos(radians) * candidate.prominence,
        y: total.y + Math.sin(radians) * candidate.prominence,
      };
    },
    { x: 0, y: 0 },
  );
  const hue = (Math.atan2(vector.y, vector.x) * 180) / Math.PI;

  return { hue: (hue + 360) % 360, achromatic: false };
}

function neutralHex(
  lightness: number,
  chroma: number,
  hue: number,
): string {
  let best = oklchChannelsToHex(lightness, chroma, hue);
  let bestDistance = hueDistance(toOklch(best)?.h ?? hue, hue);

  // Near-white gamut clipping and 8-bit HEX quantization can rotate very low
  // chroma colors. Search a small requested-hue window for the closest
  // realized hue so the published token preserves the image hue.
  for (let offset = -30; offset <= 30; offset += 0.5) {
    const candidate = oklchChannelsToHex(lightness, chroma, (hue + offset + 360) % 360);
    const distance = hueDistance(toOklch(candidate)?.h ?? hue, hue);

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

function token(
  hex: string,
  source: SemanticTokenSource,
  details?: Pick<SemanticToken, 'originalHex' | 'gap'>,
): SemanticToken {
  return { hex: normalizeHex(hex), source, ...details };
}

function expressiveTokenWithVibrancy(
  expressive: SemanticToken,
  vibrancy: number,
): SemanticToken {
  const calibrated = calibrateExpressiveHex(expressive.hex, vibrancy);

  if (calibrated === expressive.hex) {
    return expressive;
  }

  return token(calibrated, expressive.source === 'override' ? 'override' : 'derived');
}

function applyOverride(
  name: SemanticTokenName,
  fallback: SemanticToken,
  overrides: SemanticTokenOverrides,
): SemanticToken {
  const override = overrides[name];
  return override ? token(override, 'override') : fallback;
}

function expressiveCandidates(candidates: FitnessColor[]): FitnessColor[] {
  // This filter is the hard boundary for extracted expressive colors. Colors
  // below it may tint neutrals, but never become primary/secondary/accent.
  return candidates
    .filter((candidate) => candidate.chroma >= EXPRESSIVE_CHROMA_MIN)
    .sort((left, right) => brandScore(right) - brandScore(left));
}

function synthesizeExpressive(hue: number, offset: number, theme: 'light' | 'dark'): string {
  const lightness = theme === 'dark' ? 0.72 : 0.42;
  return oklchChannelsToHex(lightness, 0.13, (hue + offset + 360) % 360);
}

function synthesisOffsets(strategy: ExpressiveSynthesisStrategy): {
  secondary: number;
  accent: number;
} {
  switch (strategy) {
    case 'analogous':
      return {
        secondary: EXPRESSIVE_SYNTHESIS.analogousSecondaryOffset,
        accent: EXPRESSIVE_SYNTHESIS.analogousAccentOffset,
      };
    case 'complementary':
      return {
        secondary: EXPRESSIVE_SYNTHESIS.complementarySecondaryOffset,
        accent: EXPRESSIVE_SYNTHESIS.complementaryAccentOffset,
      };
    case 'analogous-with-accent':
      return {
        secondary: EXPRESSIVE_SYNTHESIS.analogousSecondaryOffset,
        accent: EXPRESSIVE_SYNTHESIS.complementaryAccentOffset,
      };
  }
}

function adjustExpressiveForSurface(hex: string, surfaceHex: string): SemanticToken {
  if (contrastRatio(hex, surfaceHex) >= AA_RATIO) {
    return token(hex, 'extracted');
  }

  return token(adjustLightnessForContrast(hex, surfaceHex, AA_RATIO), 'corrected', {
    originalHex: normalizeHex(hex),
  });
}

function pickExpressive(
  pool: FitnessColor[],
  used: Set<string>,
  surfaceHex: string,
  fallbackHex: string,
  minHueDistance = 0,
): SemanticToken {
  const picked = pool.find((candidate) => {
    if (used.has(candidate.hex)) {
      return false;
    }

    if (minHueDistance === 0) {
      return true;
    }

    return [...used].every((hex) => {
      const usedOklch = toOklch(hex);
      return hueDistance(candidate.hue, usedOklch?.h ?? candidate.hue) >= minHueDistance;
    });
  });

  if (!picked) {
    return token(adjustLightnessForContrast(fallbackHex, surfaceHex, AA_RATIO), 'derived');
  }

  used.add(picked.hex);
  return adjustExpressiveForSurface(picked.hex, surfaceHex);
}

function pickState(
  pool: FitnessColor[],
  stateHue: number,
  dominant: number,
  surfaceHex: string,
  theme: 'light' | 'dark',
): SemanticToken {
  const picked = pool
    .filter((candidate) => hueDistance(candidate.hue, stateHue) <= 35)
    .sort((left, right) => hueDistance(left.hue, stateHue) - hueDistance(right.hue, stateHue))[0];

  if (picked) {
    return adjustExpressiveForSurface(picked.hex, surfaceHex);
  }

  const tintedStateHue = mixHue(stateHue, dominant, 0.18);
  const synthesized = oklchChannelsToHex(theme === 'dark' ? 0.72 : 0.43, 0.12, tintedStateHue);

  return token(adjustLightnessForContrast(synthesized, surfaceHex, AA_RATIO), 'derived');
}

function tonalTokenEntries(
  base: ExpressiveScaleBase,
  expressive: SemanticToken,
  overrides: SemanticTokenOverrides,
): Array<[SemanticTokenName, SemanticToken]> {
  const scale = deriveTonalScale(expressive.hex);
  const entries: Array<[SemanticTokenName, SemanticToken]> = TONAL_SCALE_STEPS.map((step) => {
    const name = `${base}-${step}` as TonalTokenName;

    return [name, applyOverride(name, token(scale[step], 'derived'), overrides)];
  });
  const resolvedScale = Object.fromEntries(
    entries.map(([name, entry]) => [Number(String(name).split('-').at(-1)), entry.hex]),
  ) as Record<TonalScaleStep, string>;

  for (const step of TONAL_TEXT_CARRIER_STEPS) {
    const name = `on-${base}-${step}` as OnTonalTokenName;

    entries.push([
      name,
      applyOverride(name, token(bestTextOn(resolvedScale[step]), 'derived'), overrides),
    ]);
  }

  return entries;
}

function mutedOnSurface(surfaceHex: string, onSurfaceHex: string): SemanticToken {
  const surface = toOklch(surfaceHex);
  const text = toOklch(onSurfaceHex);

  if (!surface || !text) {
    return token(onSurfaceHex, 'derived');
  }

  const surfaceLightness = surface.l ?? 0.95;
  const textLightness = text.l ?? 0.15;
  let best = onSurfaceHex;

  for (let step = 1; step <= 24; step += 1) {
    const amount = step / 24;
    const lightness = textLightness + (surfaceLightness - textLightness) * amount;
    const candidate = oklchChannelsToHex(lightness, Math.min(text.c ?? 0, 0.03), text.h ?? surface.h ?? 0);

    if (contrastRatio(candidate, surfaceHex) >= AA_RATIO) {
      best = candidate;
    } else {
      break;
    }
  }

  return token(best, 'derived');
}

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

function buildDataSeriesIdentities(
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

  return best ? token(best.hex, 'derived') : null;
}

function materializeSeries(
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

/**
 * Semantic token flow:
 * extracted colors + user overrides -> token derivation -> tokens ->
 * projection -> legacy RolePalette -> editor/export.
 *
 * The structural ramps above define a fixed area-aware chroma budget. Source
 * colors remain unchanged on small expressive roles; legacy synthesis is used
 * only when a caller explicitly requests a synthesis strategy.
 */
function deriveBaseSemanticTokens(input: SemanticTokenDerivationInput): SemanticTokens {
  const theme = input.theme ?? 'light';
  const overrides = input.overrides ?? {};
  const strategy = input.synthesisStrategy ?? EXPRESSIVE_SYNTHESIS.synthesisStrategy;
  const vibrancy = normalizeVibrancy(input.vibrancy);
  const candidates = uniqueCandidates(input.extracted);
  const { hue } = dominantHue(candidates);
  const ramp = theme === 'dark' ? DARK_NEUTRAL : LIGHT_NEUTRAL;
  const inverseRamp = theme === 'dark' ? LIGHT_NEUTRAL : DARK_NEUTRAL;
  const offsets = synthesisOffsets(strategy);

  const background = applyOverride(
    'background',
    token(neutralHex(ramp.background[0], ramp.background[1], hue), 'derived'),
    overrides,
  );
  const surface = applyOverride(
    'surface',
    token(neutralHex(ramp.surface[0], ramp.surface[1], hue), 'derived'),
    overrides,
  );
  const surfaceElevated = applyOverride(
    'surface-elevated',
    token(neutralHex(ramp.elevated[0], ramp.elevated[1], hue), 'derived'),
    overrides,
  );
  const backgroundInverse = applyOverride(
    'background-inverse',
    token(neutralHex(inverseRamp.background[0], inverseRamp.background[1], hue), 'derived'),
    overrides,
  );
  const surfaceInverse = applyOverride(
    'surface-inverse',
    token(neutralHex(inverseRamp.surface[0], inverseRamp.surface[1], hue), 'derived'),
    overrides,
  );
  const surfaceInverseElevated = applyOverride(
    'surface-inverse-elevated',
    token(neutralHex(inverseRamp.elevated[0], inverseRamp.elevated[1], hue), 'derived'),
    overrides,
  );
  const onBackground = applyOverride(
    'on-background',
    token(neutralHex(ramp.text[0], ramp.text[1], hue), 'derived'),
    overrides,
  );
  const onSurface = applyOverride(
    'on-surface',
    token(neutralHex(ramp.text[0], ramp.text[1], hue), 'derived'),
    overrides,
  );
  const onSurfaceMuted = applyOverride(
    'on-surface-muted',
    token(neutralHex(ramp.textMuted[0], ramp.textMuted[1], hue), 'derived'),
    overrides,
  );
  const onBackgroundInverse = applyOverride(
    'on-background-inverse',
    token(neutralHex(inverseRamp.text[0], inverseRamp.text[1], hue), 'derived'),
    overrides,
  );
  const onSurfaceInverse = applyOverride(
    'on-surface-inverse',
    token(neutralHex(inverseRamp.text[0], inverseRamp.text[1], hue), 'derived'),
    overrides,
  );
  const border = applyOverride(
    'border',
    token(neutralHex(ramp.border[0], ramp.border[1], hue), 'derived'),
    overrides,
  );
  const divider = applyOverride(
    'divider',
    token(neutralHex(ramp.divider[0], ramp.divider[1], hue), 'derived'),
    overrides,
  );

  const pool = expressiveCandidates(candidates);
  const used = new Set<string>();
  const primary = expressiveTokenWithVibrancy(
    applyOverride(
      'primary',
      pickExpressive(pool, used, surface.hex, synthesizeExpressive(hue, 0, theme)),
      overrides,
    ),
    vibrancy,
  );
  const secondary = expressiveTokenWithVibrancy(
    applyOverride(
      'secondary',
      pickExpressive(pool, used, surface.hex, synthesizeExpressive(hue, offsets.secondary, theme), 24),
      overrides,
    ),
    vibrancy,
  );
  const accent = expressiveTokenWithVibrancy(
    applyOverride(
      'accent',
      pickExpressive(pool, used, surface.hex, synthesizeExpressive(hue, offsets.accent, theme), 36),
      overrides,
    ),
    vibrancy,
  );
  const success = applyOverride(
    'success',
    pickState(pool, STANDARD_STATE_HUES.success, hue, surface.hex, theme),
    overrides,
  );
  const warning = applyOverride(
    'warning',
    pickState(pool, STANDARD_STATE_HUES.warning, hue, surface.hex, theme),
    overrides,
  );
  const error = applyOverride(
    'error',
    pickState(pool, STANDARD_STATE_HUES.error, hue, surface.hex, theme),
    overrides,
  );
  const seriesIdentities = buildDataSeriesIdentities(
    [primary, secondary, accent, success, warning, error],
    hue,
    pool.length,
    vibrancy,
  );
  const onPrimary = applyOverride(
    'on-primary',
    token(readableOn(theme === 'dark' ? background.hex : surfaceElevated.hex, primary.hex), 'derived'),
    overrides,
  );
  const onSecondary = applyOverride(
    'on-secondary',
    token(readableOn(theme === 'dark' ? background.hex : surfaceElevated.hex, secondary.hex), 'derived'),
    overrides,
  );
  const onAccent = applyOverride(
    'on-accent',
    token(readableOn(theme === 'dark' ? background.hex : surfaceElevated.hex, accent.hex), 'derived'),
    overrides,
  );
  const heroSurface = applyOverride(
    'hero-surface',
    token(primary.hex, primary.source === 'override' ? 'override' : 'derived'),
    overrides,
  );
  const onHero = applyOverride(
    'on-hero',
    token(readableOn(theme === 'dark' ? background.hex : surfaceElevated.hex, heroSurface.hex), 'derived'),
    overrides,
  );
  const dataSeries = materializeSeries(seriesIdentities, surface.hex, theme, vibrancy);
  const dataToken = (index: number, fallback: SemanticToken): SemanticToken =>
    dataSeries[index] ?? dataSeries[dataSeries.length - 1] ?? fallback;
  const tonalTokens = Object.fromEntries([
    ...tonalTokenEntries('primary', primary, overrides),
    ...tonalTokenEntries('secondary', secondary, overrides),
    ...tonalTokenEntries('accent', accent, overrides),
  ]) as Pick<SemanticTokens, TonalTokenName | OnTonalTokenName>;

  return {
    background,
    surface,
    'surface-elevated': surfaceElevated,
    'background-inverse': backgroundInverse,
    'surface-inverse': surfaceInverse,
    'surface-inverse-elevated': surfaceInverseElevated,
    'on-background': onBackground,
    'on-surface': onSurface,
    'on-surface-muted': onSurfaceMuted,
    'on-background-inverse': onBackgroundInverse,
    'on-surface-inverse': onSurfaceInverse,
    border,
    divider,
    primary,
    secondary,
    accent,
    'on-primary': onPrimary,
    'on-secondary': onSecondary,
    'on-accent': onAccent,
    'hero-surface': heroSurface,
    'on-hero': onHero,
    success,
    warning,
    error,
    'data-1': applyOverride('data-1', dataToken(0, primary), overrides),
    'data-2': applyOverride('data-2', dataToken(1, secondary), overrides),
    'data-3': applyOverride('data-3', dataToken(2, accent), overrides),
    'data-4': applyOverride('data-4', dataToken(3, success), overrides),
    'data-5': applyOverride('data-5', dataToken(4, warning), overrides),
    'data-6': applyOverride('data-6', dataToken(5, error), overrides),
    ...tonalTokens,
  };
}

function routedExpressiveCandidates(candidates: FitnessColor[]): FitnessColor[] {
  const maximumProminence = Math.max(...candidates.map((candidate) => candidate.prominence), 0);
  const areaFloor = maximumProminence * 0.12;

  return candidates
    .filter((candidate) => candidate.chroma >= 0.03 && candidate.prominence >= areaFloor)
    .sort((left, right) => right.chroma - left.chroma || right.prominence - left.prominence);
}

function derivedPair(background: SemanticToken): SemanticToken {
  return token(deriveOnTokenHexForFill(background.hex), 'derived');
}

function sourceDataSeries(
  expressive: FitnessColor[],
  backgroundHex: string,
  theme: 'light' | 'dark',
  fallback: SemanticToken,
): SemanticToken[] {
  const lightnessTargets = theme === 'dark'
    ? [0.58, 0.73, 0.88, 0.43]
    : [0.62, 0.47, 0.32, 0.77];
  const picked: SemanticToken[] = [];

  for (const source of expressive) {
    for (const lightness of [source.lightness, ...lightnessTargets]) {
      const candidateHex = oklchChannelsToHex(lightness, source.chroma, source.hue);
      const candidate = toOklch(candidateHex);

      if (contrastRatio(candidateHex, backgroundHex) < DATA_SERIES_MIN_CONTRAST) {
        continue;
      }

      const separated = picked.every((entry) => {
        const previous = toOklch(entry.hex);
        const hueSeparated = hueDistance(candidate?.h ?? source.hue, previous?.h ?? source.hue) >= 25;
        const lightnessSeparated = Math.abs((candidate?.l ?? lightness) - (previous?.l ?? 0)) >= 0.15;

        return (hueSeparated || lightnessSeparated) &&
          remainsDistinctWithColorVisionDeficiency(candidateHex, entry.hex);
      });

      if (!separated || picked.some((entry) => entry.hex === candidateHex)) {
        continue;
      }

      picked.push(token(candidateHex, 'derived', { originalHex: source.hex }));

      if (picked.length === 6) {
        return picked;
      }
    }
  }

  const gapMessage = 'La imagen no ofrece variedad suficiente para otra categoría de datos. Deriva una variante de luminosidad o elige un color fuente.';

  while (picked.length < 6) {
    picked.push(token(picked.at(-1)?.hex ?? fallback.hex, 'derived', { gap: gapMessage }));
  }

  return picked;
}

function applyAreaAwareStrategy(
  base: SemanticTokens,
  candidates: FitnessColor[],
  theme: 'light' | 'dark',
  overrides: SemanticTokenOverrides,
): SemanticTokens {
  const expressive = routedExpressiveCandidates(candidates);
  const primary = applyOverride(
    'primary',
    token(expressive[0]?.hex ?? base.primary.hex, expressive[0] ? 'extracted' : 'derived'),
    overrides,
  );
  const secondary = applyOverride(
    'secondary',
    token(expressive[1]?.hex ?? base.secondary.hex, expressive[1] ? 'extracted' : 'derived'),
    overrides,
  );
  const accentCandidate = expressive
    .filter((candidate) =>
      candidate.hex !== primary.hex &&
      candidate.hex !== secondary.hex &&
      candidate.lightness >= (theme === 'dark' ? 0.28 : 0.35) &&
      candidate.lightness <= 0.88,
    )
    .sort((left, right) => left.prominence - right.prominence || right.chroma - left.chroma)[0];
  const accent = applyOverride(
    'accent',
    accentCandidate
      ? token(accentCandidate.hex, 'extracted')
      : token(secondary.hex, 'derived', {
          gap: 'Esta imagen no tiene un color fuente adecuado para acento.',
        }),
    overrides,
  );
  const onPrimary = applyOverride('on-primary', derivedPair(primary), overrides);
  const onSecondary = applyOverride('on-secondary', derivedPair(secondary), overrides);
  const onAccent = applyOverride('on-accent', derivedPair(accent), overrides);
  const dataSeries = sourceDataSeries(expressive, base.background.hex, theme, primary);
  const dataToken = (index: number): SemanticToken => dataSeries[index] ?? primary;
  const tonalTokens = Object.fromEntries([
    ...tonalTokenEntries('primary', primary, overrides),
    ...tonalTokenEntries('secondary', secondary, overrides),
    ...tonalTokenEntries('accent', accent, overrides),
  ]) as Pick<SemanticTokens, TonalTokenName | OnTonalTokenName>;

  return {
    ...base,
    primary,
    secondary,
    accent,
    'on-primary': onPrimary,
    'on-secondary': onSecondary,
    'on-accent': onAccent,
    'hero-surface': base['surface-elevated'],
    'on-hero': base['on-surface'],
    'data-1': applyOverride('data-1', dataToken(0), overrides),
    'data-2': applyOverride('data-2', dataToken(1), overrides),
    'data-3': applyOverride('data-3', dataToken(2), overrides),
    'data-4': applyOverride('data-4', dataToken(3), overrides),
    'data-5': applyOverride('data-5', dataToken(4), overrides),
    'data-6': applyOverride('data-6', dataToken(5), overrides),
    ...tonalTokens,
  };
}

/** Derives an area-aware UI palette; source colors stay on small expressive roles. */
export function deriveSemanticTokens(input: SemanticTokenDerivationInput): SemanticTokens {
  const paletteType = input.paletteType ?? classifyPalette(input.extracted).type;
  const base = deriveBaseSemanticTokens(input);

  if (paletteType === 'neutral' && !input.overrides?.accent && !input.synthesisStrategy) {
    const dataGap = token(base.primary.hex, 'derived', {
      gap: 'La imagen no tiene variedad cromática suficiente para esta categoría de datos. Deriva variantes por luminosidad o elige una fuente.',
    });
    const resolvedDataToken = (name: SemanticTokenName): SemanticToken => {
      const override = input.overrides?.[name];
      return override ? token(override, 'override') : dataGap;
    };

    return {
      ...base,
      accent: token(base.surface.hex, 'derived', {
        gap: 'Esta imagen no tiene un color con suficiente carácter para acento.',
      }),
      'data-1': resolvedDataToken('data-1'),
      'data-2': resolvedDataToken('data-2'),
      'data-3': resolvedDataToken('data-3'),
      'data-4': resolvedDataToken('data-4'),
      'data-5': resolvedDataToken('data-5'),
      'data-6': resolvedDataToken('data-6'),
    };
  }

  if (!input.synthesisStrategy) {
    return applyAreaAwareStrategy(
      base,
      uniqueCandidates(input.extracted),
      input.theme ?? 'light',
      input.overrides ?? {},
    );
  }

  return base;
}
