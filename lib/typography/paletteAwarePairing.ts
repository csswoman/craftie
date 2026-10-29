import { contrastRatio, evaluateContrast } from '../color/contrast';
import { getPairingsForStyle, scorePairForMood } from './pairings';
import type { FontMeta, FontPair } from './fontPairTypes';

/**
 * Palette context fed into the palette-aware scorer. Both hexes describe the
 * real text/background pairing the user is currently composing so the score can
 * reflect legibility, not just mood metadata.
 */
export type PaletteContext = {
  mood: string[];
  /** Hex used for body/heading text in the current palette (e.g. onSurface). */
  paletteTextHex: string;
  /** Hex used for the surface behind the text (e.g. surface). */
  paletteBackgroundHex: string;
};

export type PaletteAwareScore = {
  pair: FontPair;
  /** Total deterministic score; higher is a better fit for palette + mood. */
  score: number;
  /** Measured contrast ratio of the current palette's text on its background. */
  paletteContrastRatio: number;
  /** Human-readable reasons behind the score, newest signal last. */
  rationale: string[];
  /** When the body font reads small, the suggested size-up nudge (else null). */
  bodySizeUpNote: string | null;
};

export type PaletteAwareRecommendation = FontPair & {
  paletteContrastRatio: number;
  paletteRationale: string[];
  bodySizeUpNote: string | null;
};

// Original, hand-tuned weights. No third-party scoring tables were used.
const COMPLEMENTARY_SERIF_SANS_BONUS = 3;
const TWO_SANS_PENALTY = 2;
const GEOMETRIC_TWINS_PENALTY = 2;
const LOW_XHEIGHT_PENALTY = 1;
const STRONG_PALETTE_CONTRAST_BONUS = 1;
const WEAK_PALETTE_CONTRAST_PENALTY = 2;

const STRONG_CONTRAST_RATIO = 4.5;
const WEAK_CONTRAST_RATIO = 3;

const BODY_SIZE_UP_NOTE =
  'La fuente de cuerpo tiene una altura-x baja: sube el tamaño base ~1px para mantener la legibilidad.';

function isSerif(meta: FontMeta): boolean {
  return meta.classification === 'serif';
}

function isSansLike(meta: FontMeta): boolean {
  return meta.classification === 'sans-serif';
}

/**
 * True when heading and body are opposite serif/sans families — the pairing the
 * No Inter Rule rewards because the shapes contrast instead of competing.
 */
function isComplementaryContrast(pair: FontPair): boolean {
  return (
    (isSerif(pair.heading) && isSansLike(pair.body)) ||
    (isSansLike(pair.heading) && isSerif(pair.body))
  );
}

function sharedPersonalityCount(pair: FontPair): number {
  const bodyTags = new Set(pair.body.personality);
  let shared = 0;

  for (const tag of pair.heading.personality) {
    if (bodyTags.has(tag)) {
      shared += 1;
    }
  }

  return shared;
}

/**
 * Two sans families that also read as near-identical (matching contrast and
 * overlapping personality) — the generic geometric-twin look to avoid.
 */
function isGeometricTwin(pair: FontPair): boolean {
  if (!isSansLike(pair.heading) || !isSansLike(pair.body)) {
    return false;
  }

  const sameContrast = pair.heading.contrast === pair.body.contrast;
  return sameContrast && sharedPersonalityCount(pair) > 0;
}

function measurePaletteContrast(textHex: string, backgroundHex: string): number {
  if (!textHex || !backgroundHex) {
    return 0;
  }

  try {
    return contrastRatio(textHex, backgroundHex);
  } catch {
    return 0;
  }
}

/**
 * Scores a single pair against the active palette and mood. Deterministic: the
 * same inputs always return the same score and rationale ordering.
 */
export function scorePairForPalette(
  pair: FontPair,
  context: PaletteContext,
): PaletteAwareScore {
  const rationale: string[] = [];
  let score = scorePairForMood(pair, context.mood);

  if (context.mood.length > 0 && score > 0) {
    rationale.push('Coincide con el ánimo seleccionado.');
  }

  if (isComplementaryContrast(pair)) {
    score += COMPLEMENTARY_SERIF_SANS_BONUS;
    rationale.push('Serif y sans-serif se complementan por contraste de forma.');
  } else if (isSansLike(pair.heading) && isSansLike(pair.body)) {
    score -= TWO_SANS_PENALTY;
    rationale.push('Dos sans-serif compiten entre sí; falta contraste de forma.');

    if (isGeometricTwin(pair)) {
      score -= GEOMETRIC_TWINS_PENALTY;
      rationale.push('Par geométrico casi idéntico; evita el look genérico.');
    }
  }

  let bodySizeUpNote: string | null = null;

  if (pair.body.xHeight === 'low') {
    score -= LOW_XHEIGHT_PENALTY;
    bodySizeUpNote = BODY_SIZE_UP_NOTE;
    rationale.push(BODY_SIZE_UP_NOTE);
  }

  const paletteContrastRatio = measurePaletteContrast(
    context.paletteTextHex,
    context.paletteBackgroundHex,
  );

  if (paletteContrastRatio >= STRONG_CONTRAST_RATIO) {
    score += STRONG_PALETTE_CONTRAST_BONUS;
    rationale.push('La paleta ofrece contraste AA para texto normal.');
  } else if (paletteContrastRatio > 0 && paletteContrastRatio < WEAK_CONTRAST_RATIO) {
    score -= WEAK_PALETTE_CONTRAST_PENALTY;
    rationale.push('La paleta tiene contraste bajo; sube peso o tamaño del texto.');
  }

  return {
    pair,
    score,
    paletteContrastRatio,
    rationale,
    bodySizeUpNote,
  };
}

/**
 * Returns the top palette-aware recommendations for the active mood + palette.
 * Falls back to mood-only candidates and keeps a stable id tie-break so the
 * ordering never depends on array identity.
 */
export function getPaletteAwareRecommendations(
  context: PaletteContext,
  limit = 3,
): PaletteAwareRecommendation[] {
  const candidates = getPairingsForStyle(context.mood);

  return candidates
    .map((pair) => scorePairForPalette(pair, context))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.pair.id.localeCompare(right.pair.id, 'es');
    })
    .slice(0, Math.max(0, limit))
    .map((entry) => ({
      ...entry.pair,
      paletteContrastRatio: entry.paletteContrastRatio,
      paletteRationale: entry.rationale,
      bodySizeUpNote: entry.bodySizeUpNote,
    }));
}

/** Convenience guard: palette context is usable only with two real hexes. */
export function hasPaletteContext(
  textHex: string | null | undefined,
  backgroundHex: string | null | undefined,
): boolean {
  if (!textHex || !backgroundHex) {
    return false;
  }

  try {
    evaluateContrast(textHex, backgroundHex);
    return true;
  } catch {
    return false;
  }
}
