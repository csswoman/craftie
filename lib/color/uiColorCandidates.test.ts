import { describe, expect, it } from 'vitest';

import type { SelectableColor } from './selectableColors';
import { deriveSemanticTokens } from './semanticTokens';
import {
  autoFillDataGaps,
  buildDataCandidates,
  buildExpressiveCandidates,
  deriveFromPrimary,
  groupCandidatesForUse,
  sortCandidatesForUse,
} from './uiColorCandidates';
import { hexToOklchChannels } from '../utils/colorMath';

const sourceColors: SelectableColor[] = [
  { id: 'orange', name: 'Orange', hex: '#C85A22', group: 'bold' },
  { id: 'cream', name: 'Cream', hex: '#F8F0EA', group: 'light-neutral' },
  { id: 'pale-orange', name: 'Pale Orange', hex: '#F5CFA8', group: 'bold' },
  { id: 'brown', name: 'Brown', hex: '#75402B', group: 'dark-neutral' },
];

function tokensWithGaps() {
  const tokens = deriveSemanticTokens({
    extracted: [
      { hex: '#C85A22', prominence: 0.7 },
      { hex: '#2456A6', prominence: 0.3 },
    ],
    paletteType: 'vivid',
  });

  return {
    ...tokens,
    'data-1': { hex: '#2456A6', source: 'extracted' as const },
    'data-2': { hex: '#2456A6', source: 'derived' as const, gap: 'pending' },
    'data-3': { hex: '#2456A6', source: 'derived' as const, gap: 'pending' },
  };
}

describe('UI color candidates', () => {
  it('profiles every candidate across contextual uses', () => {
    const candidates = buildDataCandidates(tokensWithGaps(), sourceColors, 'data-2');
    expect(candidates.every((candidate) => candidate.fitness.asText.ratio > 0)).toBe(true);
    expect(candidates.some((candidate) => !candidate.fitness.asData.ok)).toBe(true);
    expect(candidates.some((candidate) => candidate.fitness.asAccent.ok)).toBe(true);
    expect(candidates.every((candidate) => candidate.dataSeparation !== undefined)).toBe(true);
  });

  it('gives human-readable names to derived data candidates', () => {
    const candidates = buildDataCandidates(tokensWithGaps(), sourceColors, 'data-2');
    const derived = candidates.find((candidate) => candidate.origin === 'derived');

    expect(derived).toBeDefined();
    expect(derived?.name).not.toBe('Derivado');
  });

  it('auto-fill chooses the best enabled candidate in sorted order', () => {
    const tokens = tokensWithGaps();
    const replacements = autoFillDataGaps(tokens, sourceColors);
    for (const replacement of replacements) {
      expect(replacement.candidate.fitness.asData.ok).toBe(true);
    }
  });

  it('leaves data gaps open when no candidate is fit for data', () => {
    const base = tokensWithGaps();
    const tokens = {
      ...base,
      primary: { ...base.primary, gap: 'pending' as const },
      secondary: { ...base.secondary, gap: 'pending' as const },
      accent: { ...base.accent, gap: 'pending' as const },
      'data-1': { hex: '#111111', source: 'override' as const },
    };
    const replacements = autoFillDataGaps(tokens, [
      { id: 'soft-gray', name: 'Soft gray', hex: '#B8B8B8', group: 'light-neutral' },
    ]);

    expect(replacements).toHaveLength(0);
  });

  it('keeps low-contrast colors available for the uses they do fit', () => {
    const tokens = tokensWithGaps();
    const candidates = buildExpressiveCandidates(sourceColors, tokens);
    expect(candidates.find((candidate) => candidate.id === 'source-cream')?.fitness.asText.ok).toBe(false);
    expect(candidates.find((candidate) => candidate.id === 'source-orange')?.fitness.asAccent.ok).toBe(true);
  });

  it('sorts candidates by the fitness axis relevant to the active role', () => {
    const candidates = buildExpressiveCandidates(sourceColors, tokensWithGaps());
    const forText = sortCandidatesForUse(candidates, 'text');
    const forSurface = sortCandidatesForUse(candidates, 'surface');

    expect(forText[0]?.fitness.asText.ok).toBe(true);
    expect(forSurface[0]?.fitness.asSurface.ok).toBe(true);
  });

  it('derives a role from primary with meaningful hue and lightness separation', () => {
    const primary = hexToOklchChannels('#C85A22');
    const derived = hexToOklchChannels(deriveFromPrimary('#C85A22'));
    const hueDistance = Math.min(Math.abs(primary.h - derived.h), 360 - Math.abs(primary.h - derived.h));

    expect(hueDistance).toBeGreaterThanOrEqual(25);
    expect(Math.abs(primary.l - derived.l)).toBeGreaterThanOrEqual(0.15);
  });

  it('derives distinct data colors from the same primary when slots are occupied', () => {
    const primary = '#C85A22';
    const first = deriveFromPrimary(primary);
    const second = deriveFromPrimary(primary, [first]);
    const third = deriveFromPrimary(primary, [first, second]);

    expect(second.toLowerCase()).not.toBe(first.toLowerCase());
    expect(third.toLowerCase()).not.toBe(first.toLowerCase());
    expect(third.toLowerCase()).not.toBe(second.toLowerCase());

    const hues = [first, second, third].map((hex) => hexToOklchChannels(hex).h);
    const hueGap = (left: number, right: number) => {
      const distance = Math.abs(left - right) % 360;
      return Math.min(distance, 360 - distance);
    };
    expect(hueGap(hues[0]!, hues[1]!)).toBeGreaterThanOrEqual(24);
    expect(hueGap(hues[0]!, hues[2]!)).toBeGreaterThanOrEqual(24);
    expect(hueGap(hues[1]!, hues[2]!)).toBeGreaterThanOrEqual(24);
  });

  it('deduplicates perceptually close candidates into optional variants', () => {
    const oliveColors: SelectableColor[] = [
      { id: 'olive-1', name: 'Olive 1', hex: '#77733A', group: 'bold' },
      { id: 'olive-2', name: 'Olive 2', hex: '#7A763D', group: 'bold' },
      { id: 'olive-3', name: 'Olive 3', hex: '#716D35', group: 'bold' },
      { id: 'brick', name: 'Brick', hex: '#94202E', group: 'bold' },
    ];
    const candidates = buildExpressiveCandidates(oliveColors, tokensWithGaps());
    const families = groupCandidatesForUse(candidates, 'fill');

    expect(families.length).toBeLessThan(candidates.length);
    expect(families.some((family) => family.variants.length >= 2)).toBe(true);
    expect(families[0]?.representative.origin).toBe('source');
  });
});
