import { converter } from 'culori';

import type { ExtractedColor } from './imageExtractor';
import { normalizeHex } from './normalizeHex';
import { deriveMutedTextHex } from './mutedText';
import { classifyPalette, type PaletteType } from './paletteClassification';
import { deriveOnTokenHexForFill } from './pairedOnToken';
import {
  buildDataSeriesIdentities,
  dataSeriesSources,
  materializeSeries,
  sourceDataSeries,
} from './dataSeriesTokens';
import {
  EXPRESSIVE_SOURCE_CHROMA_MIN,
  hueDistance,
  selectExpressiveRoles,
  toExpressiveSource,
  type ExpressiveSelection,
  type ExpressiveSourceColor,
} from './expressiveSelection';
import {
  deriveNeutralScale,
  NEUTRAL_SCALE_CHROMA,
  NEUTRAL_SCALE_LIGHTNESS,
  type NeutralScale,
  type NeutralScaleStep,
} from './neutralScale';
import { resolveNeutralTint, type NeutralTint } from './neutralTint';
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
  | 'on-background-muted'
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
  /**
   * Color previews may show while the role is still a gap (for example the
   * derived success green before status colors are confirmed). It is never
   * exported or counted as assigned.
   */
  suggestedHex?: string;
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
export const MIN_BG_SURFACE_LIGHTNESS_DELTA = 0.035;
const EXPRESSIVE_CHROMA_MIN = 0.055;
type NeutralRamp = {
  background: readonly [number, number];
  surface: readonly [number, number];
  elevated: readonly [number, number];
  border: readonly [number, number];
  divider: readonly [number, number];
  textMuted: readonly [number, number];
  text: readonly [number, number];
};

function scaleStep(step: NeutralScaleStep): readonly [number, number] {
  return [NEUTRAL_SCALE_LIGHTNESS[step], NEUTRAL_SCALE_CHROMA[step]];
}

/**
 * Structural neutrals follow the UI neutral scale: a white page, light gray
 * cards and dividers, gray borders and near-black text (and the mirror in
 * dark mode). The brand hue is only a trace, so foundations read as white,
 * gray and black like real product UIs.
 */
const LIGHT_NEUTRAL: NeutralRamp = {
  background: scaleStep(0),
  surface: scaleStep(100),
  elevated: [0.945, NEUTRAL_SCALE_CHROMA[200]],
  border: scaleStep(300),
  divider: scaleStep(200),
  // Between steps 500 and 600: the lightest gray that still passes AA as
  // body text on the step-100 surface after sRGB/HEX round-trip.
  textMuted: [0.52, NEUTRAL_SCALE_CHROMA[500]],
  text: scaleStep(900),
};
const DARK_NEUTRAL: NeutralRamp = {
  background: scaleStep(950),
  surface: scaleStep(900),
  elevated: scaleStep(800),
  border: scaleStep(700),
  divider: [0.3, NEUTRAL_SCALE_CHROMA[800]],
  textMuted: scaleStep(400),
  text: scaleStep(100),
};
export const DEFAULT_NEUTRAL_STYLE: NeutralStyle = 'tinted';
const STANDARD_STATE_HUES = {
  success: 145,
  warning: 82,
  error: 28,
};
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

function uniqueCandidates(extracted: ExtractedColor[]): ExpressiveSourceColor[] {
  const byHex = new Map<string, ExpressiveSourceColor>();

  for (const color of extracted) {
    const candidate = toExpressiveSource(color);
    const existing = byHex.get(candidate.hex);

    if (!existing) {
      byHex.set(candidate.hex, candidate);
      continue;
    }

    const rank = Math.min(
      existing.rank ?? Number.POSITIVE_INFINITY,
      candidate.rank ?? Number.POSITIVE_INFINITY,
    );
    const kept = candidate.prominence > existing.prominence ? candidate : existing;

    byHex.set(candidate.hex, Number.isFinite(rank) ? { ...kept, rank } : kept);
  }

  return [...byHex.values()];
}

function mixHue(baseHue: number, targetHue: number, targetWeight: number): number {
  const delta = ((((targetHue - baseHue) % 360) + 540) % 360) - 180;
  return (baseHue + delta * targetWeight + 360) % 360;
}

function neutralHex(
  lightness: number,
  chroma: number,
  hue: number,
): string {
  let best = oklchChannelsToHex(lightness, chroma, hue);

  if (chroma === 0) {
    return best;
  }

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

/** A light card this much lighter than the page reads as raised, not as the same plane. */
const RAISED_CARD_LIGHTNESS_DELTA = 0.015;

/**
 * Why: tinted neutral ramps can collapse background and surface into one
 * visual plane; keep a minimum OKLCH lightness gap so layers read as distinct,
 * without invading the border band.
 *
 * A light-theme card lighter than the page (white cards on a cream page) is
 * a valid raised surface and is kept. A corrected surface never loses the
 * page's tint: a white card nudged darker would otherwise turn cool gray on a
 * warm page.
 */
export function ensureSurfaceLightnessSeparation(
  backgroundHex: string,
  surfaceHex: string,
  borderHex: string,
  theme: 'light' | 'dark',
): string {
  const bg = toOklch(backgroundHex);
  const surface = toOklch(surfaceHex);
  const border = toOklch(borderHex);
  if (!bg || !surface || !border) return surfaceHex;

  const bgL = bg.l ?? 0;
  let surfaceL = surface.l ?? 0;
  const borderL = border.l ?? 0;
  const surfaceTinted = (surface.c ?? 0) >= (bg.c ?? 0) * 0.5;
  const chroma = surfaceTinted ? (surface.c ?? 0) : (bg.c ?? 0);
  const hue = surfaceTinted ? (surface.h ?? bg.h ?? 0) : (bg.h ?? 0);
  const low = Math.min(bgL, borderL);
  const high = Math.max(bgL, borderL);

  if (theme === 'light' && surfaceL - bgL >= RAISED_CARD_LIGHTNESS_DELTA) {
    return surfaceHex;
  }

  if (Math.abs(bgL - surfaceL) >= MIN_BG_SURFACE_LIGHTNESS_DELTA) {
    const clampedSurfaceL = Math.min(high, Math.max(low, surfaceL));
    return clampedSurfaceL === surfaceL
      ? surfaceHex
      : oklchChannelsToHex(clampedSurfaceL, chroma, hue);
  }

  const desired =
    theme === 'light'
      ? bgL - MIN_BG_SURFACE_LIGHTNESS_DELTA
      : bgL + MIN_BG_SURFACE_LIGHTNESS_DELTA;
  surfaceL = Math.min(high, Math.max(low, desired));

  return oklchChannelsToHex(surfaceL, chroma, hue);
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

function synthesizeExpressive(
  tint: NeutralTint,
  offset: number,
  theme: 'light' | 'dark',
): string {
  if (tint.achromatic) {
    // Achromatic sources get graphite fills instead of an invented hue; the
    // offset still separates primary from secondary/accent by lightness.
    const step = offset === 0 ? 0 : 0.14;
    const lightness = theme === 'dark' ? 0.82 - step : 0.32 + step;
    return oklchChannelsToHex(lightness, 0, 0);
  }

  const lightness = theme === 'dark' ? 0.72 : 0.42;
  return oklchChannelsToHex(lightness, 0.13, (tint.hue + offset + 360) % 360);
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

/** Selected source color adjusted for AA on surface, or the synthesized fallback. */
function expressiveFromSelection(
  selected: FitnessColor | null,
  surfaceHex: string,
  fallbackHex: string,
): SemanticToken {
  if (!selected) {
    return token(adjustLightnessForContrast(fallbackHex, surfaceHex, AA_RATIO), 'derived');
  }

  return adjustExpressiveForSurface(selected.hex, surfaceHex);
}

function pickState(
  pool: FitnessColor[],
  stateHue: number,
  tint: NeutralTint,
  surfaceHex: string,
  theme: 'light' | 'dark',
): SemanticToken {
  const picked = pool
    .filter((candidate) => hueDistance(candidate.hue, stateHue) <= 35)
    .sort((left, right) => hueDistance(left.hue, stateHue) - hueDistance(right.hue, stateHue))[0];

  if (picked) {
    return adjustExpressiveForSurface(picked.hex, surfaceHex);
  }

  const tintedStateHue = tint.achromatic ? stateHue : mixHue(stateHue, tint.hue, 0.18);
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

/**
 * Why: secondary labels need a quieter text token (~3:1 AA large:
 * typically ≥18px or ≥14px bold) — not full AA body text.
 */
function deriveOnBackgroundMuted(
  onBackgroundHex: string,
  surfaceHex: string,
): SemanticToken {
  return token(deriveMutedTextHex(onBackgroundHex, surfaceHex, 3), 'derived');
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
function deriveBaseSemanticTokens(
  input: SemanticTokenDerivationInput,
  candidates: ExpressiveSourceColor[],
  tint: NeutralTint,
  selection: ExpressiveSelection,
): SemanticTokens {
  const theme = input.theme ?? 'light';
  const overrides = input.overrides ?? {};
  const strategy = input.synthesisStrategy ?? EXPRESSIVE_SYNTHESIS.synthesisStrategy;
  const vibrancy = normalizeVibrancy(input.vibrancy);
  const { hue } = tint;
  const neutralChromaScale = input.neutralStyle === 'pure' ? 0 : tint.chromaScale;
  const rampNeutral = ([lightness, chroma]: readonly [number, number]): string =>
    neutralHex(lightness, chroma * neutralChromaScale, hue);
  const ramp = theme === 'dark' ? DARK_NEUTRAL : LIGHT_NEUTRAL;
  const inverseRamp = theme === 'dark' ? LIGHT_NEUTRAL : DARK_NEUTRAL;
  const offsets = synthesisOffsets(strategy);

  const background = applyOverride(
    'background',
    token(rampNeutral(ramp.background), 'derived'),
    overrides,
  );
  const surface = applyOverride(
    'surface',
    token(rampNeutral(ramp.surface), 'derived'),
    overrides,
  );
  const surfaceElevatedRamp = applyOverride(
    'surface-elevated',
    token(rampNeutral(ramp.elevated), 'derived'),
    overrides,
  );
  const backgroundInverse = applyOverride(
    'background-inverse',
    token(rampNeutral(inverseRamp.background), 'derived'),
    overrides,
  );
  const surfaceInverse = applyOverride(
    'surface-inverse',
    token(rampNeutral(inverseRamp.surface), 'derived'),
    overrides,
  );
  const surfaceInverseElevated = applyOverride(
    'surface-inverse-elevated',
    token(rampNeutral(inverseRamp.elevated), 'derived'),
    overrides,
  );
  const onBackground = applyOverride(
    'on-background',
    token(rampNeutral(ramp.text), 'derived'),
    overrides,
  );
  const onSurface = applyOverride(
    'on-surface',
    token(rampNeutral(ramp.text), 'derived'),
    overrides,
  );
  const onSurfaceMuted = applyOverride(
    'on-surface-muted',
    token(rampNeutral(ramp.textMuted), 'derived'),
    overrides,
  );
  const onBackgroundInverse = applyOverride(
    'on-background-inverse',
    token(rampNeutral(inverseRamp.text), 'derived'),
    overrides,
  );
  const onSurfaceInverse = applyOverride(
    'on-surface-inverse',
    token(rampNeutral(inverseRamp.text), 'derived'),
    overrides,
  );
  const border = applyOverride(
    'border',
    token(rampNeutral(ramp.border), 'derived'),
    overrides,
  );
  const divider = applyOverride(
    'divider',
    token(rampNeutral(ramp.divider), 'derived'),
    overrides,
  );
  const separatedSurfaceHex = ensureSurfaceLightnessSeparation(
    background.hex,
    surface.hex,
    border.hex,
    theme,
  );
  const separatedSurface =
    separatedSurfaceHex === surface.hex
      ? surface
      : token(separatedSurfaceHex, surface.source === 'override' ? 'override' : 'derived');
  // White cards on a tinted page: nested panels reuse the card color. A derived
  // gray step here would turn some cards gray among white ones.
  const raisedCards =
    theme === 'light' &&
    (toOklch(separatedSurface.hex)?.l ?? 0) - (toOklch(background.hex)?.l ?? 0) >= 0.015;
  const surfaceElevated = raisedCards
    ? applyOverride('surface-elevated', token(separatedSurface.hex, 'derived'), overrides)
    : surfaceElevatedRamp;
  const onBackgroundMuted = applyOverride(
    'on-background-muted',
    deriveOnBackgroundMuted(onBackground.hex, separatedSurface.hex),
    overrides,
  );
  const separatedOnSurfaceMuted =
    onSurfaceMuted.source === 'override' ||
      contrastRatio(onSurfaceMuted.hex, separatedSurface.hex) >= AA_RATIO
      ? onSurfaceMuted
      : token(
        adjustLightnessForContrast(
          onSurfaceMuted.hex,
          separatedSurface.hex,
          AA_RATIO,
        ),
        'corrected',
        { originalHex: onSurfaceMuted.hex },
      );

  const pool = expressiveCandidates(candidates);
  const primary = expressiveTokenWithVibrancy(
    applyOverride(
      'primary',
      expressiveFromSelection(selection.primary, separatedSurface.hex, synthesizeExpressive(tint, 0, theme)),
      overrides,
    ),
    vibrancy,
  );
  const secondary = expressiveTokenWithVibrancy(
    applyOverride(
      'secondary',
      expressiveFromSelection(
        selection.secondary,
        separatedSurface.hex,
        synthesizeExpressive(tint, offsets.secondary, theme),
      ),
      overrides,
    ),
    vibrancy,
  );
  const accent = expressiveTokenWithVibrancy(
    applyOverride(
      'accent',
      expressiveFromSelection(
        selection.accent,
        separatedSurface.hex,
        synthesizeExpressive(tint, offsets.accent, theme),
      ),
      overrides,
    ),
    vibrancy,
  );
  const success = applyOverride(
    'success',
    pickState(pool, STANDARD_STATE_HUES.success, tint, separatedSurface.hex, theme),
    overrides,
  );
  const warning = applyOverride(
    'warning',
    pickState(pool, STANDARD_STATE_HUES.warning, tint, separatedSurface.hex, theme),
    overrides,
  );
  const error = applyOverride(
    'error',
    pickState(pool, STANDARD_STATE_HUES.error, tint, separatedSurface.hex, theme),
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
  const dataSeries = materializeSeries(seriesIdentities, separatedSurface.hex, theme, vibrancy);
  const dataToken = (index: number, fallback: SemanticToken): SemanticToken =>
    dataSeries[index] ?? dataSeries[dataSeries.length - 1] ?? fallback;
  const tonalTokens = Object.fromEntries([
    ...tonalTokenEntries('primary', primary, overrides),
    ...tonalTokenEntries('secondary', secondary, overrides),
    ...tonalTokenEntries('accent', accent, overrides),
  ]) as Pick<SemanticTokens, TonalTokenName | OnTonalTokenName>;

  return {
    background,
    surface: separatedSurface,
    'surface-elevated': surfaceElevated,
    'background-inverse': backgroundInverse,
    'surface-inverse': surfaceInverse,
    'surface-inverse-elevated': surfaceInverseElevated,
    'on-background': onBackground,
    'on-background-muted': onBackgroundMuted,
    'on-surface': onSurface,
    'on-surface-muted': separatedOnSurfaceMuted,
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

const ACCENT_GAP_MESSAGE = 'Esta imagen no tiene un color fuente adecuado para acento.';
const SECONDARY_GAP_MESSAGE = 'Las fuentes no ofrecen un segundo color distinto del primario.';

/**
 * Placeholder for an empty expressive role: a harmonic variant of primary so
 * previews stay varied while the role is still reported as a gap.
 */
function harmonicSuggestion(
  primaryHex: string,
  hueOffset: number,
  theme: 'light' | 'dark',
): string {
  const primary = toOklch(primaryHex);
  const primaryLightness = primary?.l ?? 0.5;
  const primaryChroma = primary?.c ?? 0;
  const primaryHue = primary?.h ?? 0;

  if (primaryChroma < EXPRESSIVE_CHROMA_MIN) {
    // Gray primaries get a tonal step instead of an invented hue.
    const lightness = theme === 'dark' ? primaryLightness - 0.14 : primaryLightness + 0.14;
    return oklchChannelsToHex(Math.min(0.9, Math.max(0.2, lightness)), primaryChroma, primaryHue);
  }

  const chroma = Math.min(0.16, Math.max(0.08, primaryChroma));
  const lightness = theme === 'dark' ? 0.72 : 0.56;

  return oklchChannelsToHex(lightness, chroma, (primaryHue + hueOffset + 360) % 360);
}

/**
 * Chart sources in brand order: the assigned primary, secondary and accent
 * lead, so the first series matches the brand; other source hues follow.
 */
function brandFirstSources(brand: SemanticToken[], others: FitnessColor[]): FitnessColor[] {
  const leading = brand
    .filter((entry) => !entry.gap)
    .map((entry) => toExpressiveSource({ hex: entry.hex, prominence: 1 }))
    .filter((entry) => entry.chroma >= EXPRESSIVE_SOURCE_CHROMA_MIN);
  const seen = new Set(leading.map((entry) => entry.hex));

  return [...leading, ...others.filter((entry) => !seen.has(entry.hex))];
}

function derivedPair(background: SemanticToken): SemanticToken {
  return token(deriveOnTokenHexForFill(background.hex), 'derived');
}

function applyAreaAwareStrategy(
  base: SemanticTokens,
  selection: ExpressiveSelection,
  expressive: FitnessColor[],
  theme: 'light' | 'dark',
  overrides: SemanticTokenOverrides,
): SemanticTokens {
  const primary = applyOverride(
    'primary',
    selection.primary ? token(selection.primary.hex, 'extracted') : base.primary,
    overrides,
  );
  const secondary = applyOverride(
    'secondary',
    selection.secondary
      ? token(selection.secondary.hex, 'extracted')
      : token(harmonicSuggestion(primary.hex, 34, theme), 'derived', { gap: SECONDARY_GAP_MESSAGE }),
    overrides,
  );
  const accent = applyOverride(
    'accent',
    selection.accent
      ? token(selection.accent.hex, 'extracted')
      : token(harmonicSuggestion(primary.hex, 180, theme), 'derived', { gap: ACCENT_GAP_MESSAGE }),
    overrides,
  );
  const onPrimary = applyOverride('on-primary', derivedPair(primary), overrides);
  const onSecondary = applyOverride('on-secondary', derivedPair(secondary), overrides);
  const onAccent = applyOverride('on-accent', derivedPair(accent), overrides);
  const dataSeries = sourceDataSeries(
    brandFirstSources([primary, secondary, accent], expressive),
    base.background.hex,
    theme,
    primary,
  );
  const dataToken = (index: number): SemanticToken => dataSeries[index] ?? primary;
  const tonalTokens = Object.fromEntries([
    ...tonalTokenEntries('primary', primary, overrides),
    ...tonalTokenEntries('secondary', secondary, overrides),
    ...tonalTokenEntries('accent', accent, overrides),
  ]) as Pick<SemanticTokens, TonalTokenName | OnTonalTokenName>;
  // A brand-led hero: the primary's pale tint (deep shade on dark) instead of a
  // flat gray block. Without an assigned primary it stays a neutral surface.
  const primaryAssigned = primary.source === 'extracted' || primary.source === 'override';
  const heroSurface = applyOverride(
    'hero-surface',
    token(
      primaryAssigned
        ? tonalTokens[theme === 'dark' ? 'primary-900' : 'primary-100'].hex
        : base['surface-elevated'].hex,
      'derived',
    ),
    overrides,
  );
  // Neutral ink reads strongest on a pale brand tint; the hue-matched pair is
  // the fallback when the neutral text does not reach 7:1.
  const onHero = applyOverride(
    'on-hero',
    contrastRatio(base['on-surface'].hex, heroSurface.hex) >= 7
      ? token(base['on-surface'].hex, 'derived')
      : derivedPair(heroSurface),
    overrides,
  );

  return {
    ...base,
    primary,
    secondary,
    accent,
    'on-primary': onPrimary,
    'on-secondary': onSecondary,
    'on-accent': onAccent,
    'hero-surface': heroSurface,
    'on-hero': onHero,
    'data-1': applyOverride('data-1', dataToken(0), overrides),
    'data-2': applyOverride('data-2', dataToken(1), overrides),
    'data-3': applyOverride('data-3', dataToken(2), overrides),
    'data-4': applyOverride('data-4', dataToken(3), overrides),
    'data-5': applyOverride('data-5', dataToken(4), overrides),
    'data-6': applyOverride('data-6', dataToken(5), overrides),
    ...tonalTokens,
  };
}

/**
 * The white-to-black UI neutral scale for these sources, with the same tint
 * as the structural tokens (or pure gray for neutralStyle 'pure').
 */
export function deriveNeutralScaleForSources(
  extracted: ExtractedColor[],
  neutralStyle: NeutralStyle = DEFAULT_NEUTRAL_STYLE,
): NeutralScale {
  const candidates = uniqueCandidates(extracted);
  const selection = selectExpressiveRoles(candidates);
  const tint = resolveNeutralTint(candidates, selection.primary?.hue);

  return deriveNeutralScale({
    hue: tint.hue,
    chromaScale: neutralStyle === 'pure' ? 0 : tint.chromaScale,
  });
}

/** Derives an area-aware UI palette; source colors stay on small expressive roles. */
export function deriveSemanticTokens(input: SemanticTokenDerivationInput): SemanticTokens {
  const paletteType = input.paletteType ?? classifyPalette(input.extracted).type;
  const theme = input.theme ?? 'light';
  const candidates = uniqueCandidates(input.extracted);
  const selection = selectExpressiveRoles(candidates, theme);
  // Opposing source hues fall back to the selected primary hue so neutrals and
  // brand color belong to the same family.
  const tint = resolveNeutralTint(candidates, selection.primary?.hue);
  const base = deriveBaseSemanticTokens(input, candidates, tint, selection);

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
      selection,
      dataSeriesSources(candidates),
      theme,
      input.overrides ?? {},
    );
  }

  return base;
}
