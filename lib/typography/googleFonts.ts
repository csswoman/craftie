import type { FontClassification, FontMeta, FontPair } from './pairings';

const GOOGLE_FONTS_BASE = 'https://fonts.googleapis.com/css2';

const HEADING_WEIGHTS = [600, 700] as const;
const BODY_WEIGHTS = [400, 500] as const;

const FALLBACK_FONTS: Record<FontClassification, string> = {
  serif: 'Georgia, serif',
  'sans-serif': 'system-ui, sans-serif',
  display: 'Georgia, serif',
  monospace: 'ui-monospace, monospace',
};

function encodeFamilyName(family: string): string {
  return encodeURIComponent(family.trim()).replace(/%20/g, '+');
}

function addWeights(
  families: Map<string, Set<number>>,
  family: string,
  weights: readonly number[],
): void {
  const name = family.trim();

  if (name === '') {
    return;
  }

  const weightSet = families.get(name) ?? new Set<number>();

  for (const weight of weights) {
    weightSet.add(weight);
  }

  families.set(name, weightSet);
}

function collectFamilies(pairs: FontPair[]): Map<string, Set<number>> {
  const families = new Map<string, Set<number>>();

  for (const pair of pairs) {
    addWeights(families, pair.heading.family, HEADING_WEIGHTS);
    addWeights(families, pair.body.family, BODY_WEIGHTS);
  }

  return families;
}

function buildFamilyParam(family: string, weights: Set<number>): string {
  const sortedWeights = [...weights].sort((left, right) => left - right);

  return `family=${encodeFamilyName(family)}:wght@${sortedWeights.join(';')}`;
}

export function buildFontFamilyStack(meta: FontMeta): string {
  const family = meta.family.trim();

  return `"${family}", ${FALLBACK_FONTS[meta.classification]}`;
}

export function getGoogleFontsLinkId(url: string): string {
  let hash = 0;

  for (let index = 0; index < url.length; index += 1) {
    hash = (Math.imul(31, hash) + url.charCodeAt(index)) | 0;
  }

  return `google-fonts-${(hash >>> 0).toString(36)}`;
}

/**
 * Builds a single Google Fonts CSS API v2 URL for the families used in pairings.
 */
export function buildGoogleFontsUrl(pairs: FontPair[]): string {
  if (pairs.length === 0) {
    return '';
  }

  const families = collectFamilies(pairs);
  const familyParams = [...families.entries()]
    .sort(([left], [right]) => left.localeCompare(right, 'es'))
    .map(([family, weights]) => buildFamilyParam(family, weights));

  return `${GOOGLE_FONTS_BASE}?${familyParams.join('&')}&display=swap`;
}

