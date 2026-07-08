import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import { normalizeHex } from './normalizeHex';
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
};

const toOklch = converter('oklch');

const AA_RATIO = 4.5;
const EXPRESSIVE_CHROMA_MIN = 0.055;
const ACHROMATIC_CHROMA_MAX = 0.01;
const NEUTRAL_CHROMA = 0.012;
const LIGHT_NEUTRAL = {
  background: 0.98,
  surface: 0.955,
  elevated: 0.992,
  border: 0.88,
  divider: 0.92,
};
const INVERSE_NEUTRAL = {
  background: 0.18,
  surface: 0.23,
  elevated: 0.29,
};
const INVERSE_CHROMA = 0.035;
export const DEFAULT_NEUTRAL_STYLE: NeutralStyle = 'pure';
const DARK_NEUTRAL = {
  background: 0.15,
  surface: 0.2,
  elevated: 0.26,
  border: 0.34,
  divider: 0.28,
};
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
  const chromatic = [...candidates]
    .filter((candidate) => candidate.chroma > ACHROMATIC_CHROMA_MAX)
    .sort((left, right) => right.prominence - left.prominence);

  if (chromatic.length === 0) {
    return { hue: 0, achromatic: true };
  }

  return { hue: chromatic[0]!.hue, achromatic: false };
}

function neutralHex(
  lightness: number,
  hue: number,
  achromatic: boolean,
  neutralStyle: NeutralStyle,
): string {
  return oklchChannelsToHex(lightness, achromatic || neutralStyle === 'pure' ? 0 : NEUTRAL_CHROMA, hue);
}

function inverseNeutralHex(
  lightness: number,
  hue: number,
  achromatic: boolean,
  neutralStyle: NeutralStyle,
): string {
  return oklchChannelsToHex(lightness, achromatic || neutralStyle === 'pure' ? 0 : INVERSE_CHROMA, hue);
}

function token(hex: string, source: SemanticTokenSource): SemanticToken {
  return { hex: normalizeHex(hex), source };
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

  return token(adjustLightnessForContrast(hex, surfaceHex, AA_RATIO), 'corrected');
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

function readablePairToken(
  backgroundHex: string,
  hue: number,
  achromatic: boolean,
  neutralStyle: NeutralStyle,
): SemanticToken {
  return token(
    readableOn(neutralHex(0.96, hue, achromatic, neutralStyle), backgroundHex),
    'derived',
  );
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

function dataSeriesVibrancyScore(hex: string): number {
  const channels = toOklch(hex);
  const chroma = channels?.c ?? 0;
  const lightness = channels?.l ?? DATA_SERIES_LIGHT_TARGET;

  return chroma * 4 - Math.abs(lightness - DATA_SERIES_LIGHT_TARGET);
}

function dataSeriesDisplayCandidates(
  baseHex: string,
  surfaceHex: string,
  lightnesses: readonly number[],
  vibrancy: number,
  allowHueNudge = true,
): string[] {
  const channels = toOklch(baseHex);

  if (!channels) {
    return [];
  }

  const targetChroma = Math.min(
    DATA_SERIES_CHROMA_CAP,
    Math.max(channels.c ?? 0, DATA_SERIES_MIN_CHROMA),
  );

  const hueOffsets = allowHueNudge ? DATA_SERIES_HUE_NUDGE : [0];

  return lightnesses
    .flatMap((lightness) =>
      hueOffsets.map((offset) =>
        oklchChannelsToHex(lightness, targetChroma, ((channels.h ?? 0) + offset + 360) % 360),
      ),
    )
    .map((hex) =>
      calibrateDataSeriesHex(
        hex,
        vibrancy,
        DATA_SERIES_MIN_CHROMA,
        DATA_SERIES_CHROMA_CAP,
      ),
    )
    .filter((hex, index, entries) => entries.indexOf(hex) === index)
    .filter((hex) => contrastRatio(hex, surfaceHex) >= DATA_SERIES_MIN_CONTRAST)
    .filter((hex) => (toOklch(hex)?.c ?? 0) >= Math.min(DATA_SERIES_MIN_CHROMA, targetChroma * 0.85));
}

function pickDataSeriesCandidate(
  baseHex: string,
  surfaceHex: string,
  lightnesses: readonly number[],
  picked: SemanticToken[],
  surfaceIsLight: boolean,
  vibrancy: number,
): SemanticToken | null {
  let best: { hex: string; score: number } | null = null;

  for (const hex of dataSeriesDisplayCandidates(baseHex, surfaceHex, lightnesses, vibrancy)) {
    if (!picked.every((entry) => colorsAreDistinguishable(hex, entry.hex))) {
      continue;
    }

    if (!surfaceIsLight) {
      return token(hex, 'derived');
    }

    const score = dataSeriesVibrancyScore(hex);

    if (!best || score > best.score) {
      best = { hex, score };
    }
  }

  return best ? token(best.hex, 'derived') : null;
}

function tonalSeriesFromSingleHue(
  base: SemanticToken,
  surfaceHex: string,
  vibrancy: number,
): SemanticToken[] {
  const picked: SemanticToken[] = [];
  const surfaceIsLight = relativeLuminance(surfaceHex) >= 0.5;
  const fillLightness = surfaceIsLight
    ? DATA_SERIES_MONO_LIGHT_L
    : DATA_SERIES_MONO_DARK_L;

  for (const lightness of fillLightness) {
    if (picked.length === 6) {
      break;
    }

    const hex = dataSeriesDisplayCandidates(base.hex, surfaceHex, [lightness], vibrancy, false)[0];

    if (!hex) {
      continue;
    }

    if (picked.every((entry) => colorsAreDistinguishable(hex, entry.hex))) {
      picked.push(token(hex, 'derived'));
    }
  }

  for (const lightness of fillLightness) {
    if (picked.length >= 5) {
      break;
    }

    const hex = dataSeriesDisplayCandidates(base.hex, surfaceHex, [lightness], vibrancy, true)[0];

    if (!hex) {
      continue;
    }

    if (picked.every((entry) => colorsAreDistinguishable(hex, entry.hex))) {
      picked.push(token(hex, 'derived'));
    }
  }

  return picked;
}

function distinguishableSeries(
  tokens: SemanticToken[],
  surfaceHex: string,
  dominantHueValue: number,
  theme: 'light' | 'dark',
  expressivePoolSize: number,
  vibrancy: number,
): SemanticToken[] {
  if (expressivePoolSize <= 1) {
    return tonalSeriesFromSingleHue(tokens[0]!, surfaceHex, vibrancy);
  }

  const surfaceIsLight = relativeLuminance(surfaceHex) >= 0.5;
  const preferredLightnesses = surfaceIsLight ? DATA_SERIES_LIGHT_L : DATA_SERIES_DARK_L;
  const candidates = tokens
    .filter((entry, index, entries) => {
      const hex = normalizeHex(entry.hex);
      return entries.findIndex((candidate) => normalizeHex(candidate.hex) === hex) === index;
    });
  const picked: SemanticToken[] = [];

  for (const candidate of candidates) {
    const pickedCandidate = pickDataSeriesCandidate(
      candidate.hex,
      surfaceHex,
      preferredLightnesses,
      picked,
      surfaceIsLight,
      vibrancy,
    );

    if (pickedCandidate) {
      picked.push(pickedCandidate);
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
    const fallbackScale = deriveTonalScale(
      oklchChannelsToHex(theme === 'dark' ? 0.54 : 0.5, 0.12, hue),
    );
    const fallback = pickDataSeriesCandidate(
      fallbackScale[500],
      surfaceHex,
      preferredLightnesses,
      picked,
      surfaceIsLight,
      vibrancy,
    );

    if (fallback) {
      picked.push(fallback);
    }
  }

  return picked.slice(0, 6);
}

/**
 * Semantic token flow:
 * extracted colors + user overrides -> token derivation -> tokens ->
 * projection -> legacy RolePalette -> editor/export.
 *
 * Tuning constants are intentionally local: `EXPRESSIVE_CHROMA_MIN` controls
 * extracted expressive eligibility, `NEUTRAL_CHROMA` controls tinted-neutral
 * strength when `neutralStyle` is `tinted`, the lightness ramps above define
 * structural surfaces, `DEFAULT_NEUTRAL_STYLE` keeps UI chrome pure by
 * default, `EXPRESSIVE_SYNTHESIS` defines fallback hue strategy/ranges, and
 * the vibrancy endpoints/midpoint live in `vibrancy.ts`.
 */
export function deriveSemanticTokens(input: SemanticTokenDerivationInput): SemanticTokens {
  const theme = input.theme ?? 'light';
  const overrides = input.overrides ?? {};
  const strategy = input.synthesisStrategy ?? EXPRESSIVE_SYNTHESIS.synthesisStrategy;
  const neutralStyle = input.neutralStyle ?? DEFAULT_NEUTRAL_STYLE;
  const vibrancy = normalizeVibrancy(input.vibrancy);
  const candidates = uniqueCandidates(input.extracted);
  const { hue, achromatic } = dominantHue(candidates);
  const ramp = theme === 'dark' ? DARK_NEUTRAL : LIGHT_NEUTRAL;
  const offsets = synthesisOffsets(strategy);

  const background = applyOverride(
    'background',
    token(neutralHex(ramp.background, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const surface = applyOverride(
    'surface',
    token(neutralHex(ramp.surface, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const surfaceElevated = applyOverride(
    'surface-elevated',
    token(neutralHex(ramp.elevated, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const backgroundInverse = applyOverride(
    'background-inverse',
    token(inverseNeutralHex(INVERSE_NEUTRAL.background, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const surfaceInverse = applyOverride(
    'surface-inverse',
    token(inverseNeutralHex(INVERSE_NEUTRAL.surface, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const surfaceInverseElevated = applyOverride(
    'surface-inverse-elevated',
    token(inverseNeutralHex(INVERSE_NEUTRAL.elevated, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const onBackground = applyOverride(
    'on-background',
    token(readableOn(neutralHex(theme === 'dark' ? 0.96 : 0.14, hue, achromatic, neutralStyle), background.hex), 'derived'),
    overrides,
  );
  const onSurface = applyOverride(
    'on-surface',
    token(readableOn(onBackground.hex, surface.hex), 'derived'),
    overrides,
  );
  const onSurfaceMuted = applyOverride(
    'on-surface-muted',
    mutedOnSurface(surface.hex, onSurface.hex),
    overrides,
  );
  const onBackgroundInverse = applyOverride(
    'on-background-inverse',
    readablePairToken(backgroundInverse.hex, hue, achromatic, neutralStyle),
    overrides,
  );
  const onSurfaceInverse = applyOverride(
    'on-surface-inverse',
    readablePairToken(surfaceInverse.hex, hue, achromatic, neutralStyle),
    overrides,
  );
  const border = applyOverride(
    'border',
    token(neutralHex(ramp.border, hue, achromatic, neutralStyle), 'derived'),
    overrides,
  );
  const divider = applyOverride(
    'divider',
    token(neutralHex(ramp.divider, hue, achromatic, neutralStyle), 'derived'),
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
  const dataSeries = distinguishableSeries(
    [primary, secondary, accent, success, warning, error],
    surface.hex,
    hue,
    theme,
    pool.length,
    vibrancy,
  );
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
