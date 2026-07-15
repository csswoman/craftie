import type { FontClassification, FontMeta, FontPair } from './fontPairTypes';
import { DEFAULT_FONT_PAIR } from './activePairing';
import {
  DEFAULT_TYPE_SCALE_BASE,
  DEFAULT_TYPE_SCALE_RATIO,
  type TypeScaleBase,
  type TypeScaleRatio,
} from './typeScale';
import type { CustomFont } from './customFonts';

export type AppliedTypography = {
  catalogPairId: string | null;
  headingFamily: string;
  bodyFamily: string;
  headingWeight: number;
  bodyWeight: number;
  headingClassification: FontClassification;
  bodyClassification: FontClassification;
};

export type ApplyPairPins = {
  pinHeading: boolean;
  pinBody: boolean;
};

export type TypeUiState = {
  applied: AppliedTypography;
  hovered: AppliedTypography | null;
  pinHeading: boolean;
  pinBody: boolean;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  customFonts: CustomFont[];
};

function roleWeight(meta: FontMeta, role: 'heading' | 'body'): number {
  if (typeof meta.defaultWeight === 'number') {
    return meta.defaultWeight;
  }
  return role === 'heading' ? 700 : 400;
}

export function typographyFromPair(pair: FontPair): AppliedTypography {
  return {
    catalogPairId: pair.id,
    headingFamily: pair.heading.family,
    bodyFamily: pair.body.family,
    headingWeight: roleWeight(pair.heading, 'heading'),
    bodyWeight: roleWeight(pair.body, 'body'),
    headingClassification: pair.heading.classification,
    bodyClassification: pair.body.classification,
  };
}

export function createInitialTypeUiState(pair: FontPair = DEFAULT_FONT_PAIR): TypeUiState {
  return {
    applied: typographyFromPair(pair),
    hovered: null,
    pinHeading: false,
    pinBody: false,
    base: DEFAULT_TYPE_SCALE_BASE,
    ratio: DEFAULT_TYPE_SCALE_RATIO,
    customFonts: [],
  };
}

export function resolveEffectiveTypography(state: Pick<TypeUiState, 'applied' | 'hovered'>): AppliedTypography {
  return state.hovered ?? state.applied;
}

/**
 * Apply a catalog pair onto applied typography, respecting role pins.
 * Both pins: return applied unchanged.
 * After apply, catalogPairId is set only when the result still matches the clicked pair's both roles.
 */
export function applyPairToTypography(
  applied: AppliedTypography,
  pair: FontPair,
  pins: ApplyPairPins,
): AppliedTypography {
  if (pins.pinHeading && pins.pinBody) {
    return applied;
  }

  const fromPair = typographyFromPair(pair);
  const next: AppliedTypography = {
    ...applied,
    headingFamily: pins.pinHeading ? applied.headingFamily : fromPair.headingFamily,
    headingWeight: pins.pinHeading ? applied.headingWeight : fromPair.headingWeight,
    headingClassification: pins.pinHeading
      ? applied.headingClassification
      : fromPair.headingClassification,
    bodyFamily: pins.pinBody ? applied.bodyFamily : fromPair.bodyFamily,
    bodyWeight: pins.pinBody ? applied.bodyWeight : fromPair.bodyWeight,
    bodyClassification: pins.pinBody ? applied.bodyClassification : fromPair.bodyClassification,
    catalogPairId: null,
  };

  const matchesPair =
    next.headingFamily === pair.heading.family && next.bodyFamily === pair.body.family;

  return {
    ...next,
    catalogPairId: matchesPair ? pair.id : null,
  };
}

/** Hover preview source: same pin rules as apply, without committing. */
export function previewPairTypography(
  applied: AppliedTypography,
  pair: FontPair,
  pins: ApplyPairPins,
): AppliedTypography | null {
  if (pins.pinHeading && pins.pinBody) {
    return null;
  }
  return applyPairToTypography(applied, pair, pins);
}

export function appliedToLoadablePair(typography: AppliedTypography): FontPair {
  return {
    id: typography.catalogPairId ?? `hybrid-${typography.headingFamily}-${typography.bodyFamily}`,
    displayName: typography.catalogPairId ? typography.catalogPairId : 'Híbrido',
    heading: {
      family: typography.headingFamily,
      googleFontsRef: `https://fonts.google.com/specimen/${encodeURIComponent(typography.headingFamily).replace(/%20/g, '+')}`,
      classification: typography.headingClassification,
      contrast: 'medium',
      xHeight: 'medium',
      personality: [],
      bestFor: 'heading',
      defaultWeight: typography.headingWeight,
    },
    body: {
      family: typography.bodyFamily,
      googleFontsRef: `https://fonts.google.com/specimen/${encodeURIComponent(typography.bodyFamily).replace(/%20/g, '+')}`,
      classification: typography.bodyClassification,
      contrast: 'medium',
      xHeight: 'medium',
      personality: [],
      bestFor: 'body',
      defaultWeight: typography.bodyWeight,
    },
    rationale: '',
    mood: [],
    character: [],
  };
}

const FALLBACK_FONTS: Record<FontClassification, string> = {
  serif: 'Georgia, serif',
  'sans-serif': 'system-ui, sans-serif',
  display: 'Georgia, serif',
  monospace: 'ui-monospace, monospace',
};

export function familyStackFromApplied(
  family: string,
  classification: FontClassification,
): string {
  return `"${family}", ${FALLBACK_FONTS[classification]}`;
}
