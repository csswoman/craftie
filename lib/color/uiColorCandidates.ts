import { converter } from 'culori';

import { evaluateColorFitness, fitnessForUse, type ColorFitness, type ColorUse } from './colorFitness';
import { normalizeHex } from './normalizeHex';
import type { SelectableColor } from './selectableColors';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';
import { DATA_TOKEN_NAMES } from './uiColorPanel';
import { contrastRatio, oklchChannelsToHex } from '../utils/colorMath';

const toOklch = converter('oklch');
const toOklab = converter('oklab');
export type CandidateOrigin = 'source' | 'derived' | 'synthetic';
export type UiColorCandidate = {
  id: string;
  hex: string;
  name: string;
  detail: string;
  origin: CandidateOrigin;
  fitness: ColorFitness;
  dataSeparation?: { minHue: number | null; minLightness: number | null };
  score: number;
};

export type CandidateFamily = {
  id: string;
  representative: UiColorCandidate;
  variants: UiColorCandidate[];
};

type OccupiedSeries = { index: number; hex: string };

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function dataSeparation(hex: string, occupied: OccupiedSeries[]): UiColorCandidate['dataSeparation'] {
  const candidate = toOklch(hex);
  if (!candidate || occupied.length === 0) return { minHue: null, minLightness: null };
  const separations = occupied.map((series) => {
    const previous = toOklch(series.hex);
    return {
      hue: typeof candidate.h === 'number' && typeof previous?.h === 'number'
        ? hueDistance(candidate.h, previous.h)
        : 0,
      lightness: Math.abs((candidate.l ?? 0) - (previous?.l ?? 0)),
    };
  });
  return {
    minHue: Math.min(...separations.map((entry) => entry.hue)),
    minLightness: Math.min(...separations.map((entry) => entry.lightness)),
  };
}

function occupiedSeries(tokens: SemanticTokens, selected?: SemanticTokenName): OccupiedSeries[] {
  return DATA_TOKEN_NAMES.flatMap((name, index) =>
    name !== selected && !tokens[name].gap ? [{ index: index + 1, hex: tokens[name].hex }] : [],
  );
}

export function buildDataCandidates(
  tokens: SemanticTokens,
  colors: SelectableColor[],
  selected: SemanticTokenName,
): UiColorCandidate[] {
  const occupied = occupiedSeries(tokens, selected);
  const occupiedHexes = new Set(occupied.map((series) => normalizeHex(series.hex)));
  const candidates: UiColorCandidate[] = [];
  const seen = new Set<string>();

  function addCandidate(hex: string, name: string, detail: string, id: string, origin: CandidateOrigin) {
    const normalized = normalizeHex(hex);
    if (seen.has(normalized) || occupiedHexes.has(normalized)) return;
    seen.add(normalized);
    const fitness = candidateFitness(normalized, tokens, occupied.map((series) => series.hex));
    const chroma = toOklch(normalized)?.c ?? 0;
    candidates.push({
      id,
      hex: normalized,
      name,
      detail,
      origin,
      fitness,
      dataSeparation: dataSeparation(normalized, occupied),
      score: contrastRatio(normalized, tokens.background.hex) + chroma,
    });
  }

  for (const color of colors) {
    const channels = toOklch(color.hex);
    const minDeltaL = occupied.length === 0 ? 0 : Math.min(...occupied.map((series) =>
      Math.abs((channels?.l ?? 0) - (toOklch(series.hex)?.l ?? 0)),
    ));
    addCandidate(
      color.hex,
      color.name || 'Color fuente',
      `fuente · ΔL ${minDeltaL.toFixed(2)} · hue ${Math.round(channels?.h ?? 0)}°`,
      `source-${color.id}`,
      'source',
    );
    if (!channels || typeof channels.h !== 'number' || (channels.c ?? 0) < 0.03) continue;
    for (const delta of [-0.22, 0.22]) {
      const lightness = Math.min(0.9, Math.max(0.12, (channels.l ?? 0.5) + delta));
      const actualDelta = lightness - (channels.l ?? 0.5);
      if (Math.abs(actualDelta) < 0.15) continue;
      addCandidate(
        oklchChannelsToHex(lightness, channels.c ?? 0, channels.h),
        'Derivado',
        `de ${color.name || 'fuente'} · L ${actualDelta >= 0 ? '+' : ''}${actualDelta.toFixed(2)}`,
        `source-derived-${color.id}-${delta}`,
        'derived',
      );
    }
  }

  const roleBases = [
    { token: 'primary', label: 'Primario' },
    { token: 'secondary', label: 'Secundario' },
    { token: 'accent', label: 'Acento' },
  ] as const;
  for (const base of roleBases) {
    if (tokens[base.token].gap) continue;
    const channels = toOklch(tokens[base.token].hex);
    if (!channels || typeof channels.h !== 'number') continue;
    for (const delta of [-0.32, -0.18, 0.18, 0.32]) {
      const lightness = Math.min(0.92, Math.max(0.12, (channels.l ?? 0.5) + delta));
      const actualDelta = lightness - (channels.l ?? 0.5);
      if (Math.abs(actualDelta) < 0.15) continue;
      addCandidate(
        oklchChannelsToHex(lightness, channels.c ?? 0, channels.h),
        'Derivado',
        `de ${base.label} · L ${actualDelta >= 0 ? '+' : ''}${actualDelta.toFixed(2)}`,
        `derived-${base.token}-${delta}`,
        tokens[base.token].source === 'derived' ? 'synthetic' : 'derived',
      );
    }
  }

  return candidates.sort((left, right) => Number(right.fitness.asData.ok) - Number(left.fitness.asData.ok) || right.score - left.score);
}

export function autoFillDataGaps(tokens: SemanticTokens, colors: SelectableColor[]) {
  const working = { ...tokens };
  const result: Array<{ token: SemanticTokenName; hex: string; candidate: UiColorCandidate }> = [];

  for (const tokenName of DATA_TOKEN_NAMES) {
    if (!working[tokenName].gap) continue;
    const candidate = buildDataCandidates(working, colors, tokenName)
      .find((entry) => entry.fitness.asData.ok);
    if (!candidate) continue;
    result.push({ token: tokenName, hex: candidate.hex, candidate });
    working[tokenName] = { hex: candidate.hex, source: 'override' };
  }

  return result;
}

export function buildExpressiveCandidates(colors: SelectableColor[], tokens: SemanticTokens): UiColorCandidate[] {
  const seen = new Set<string>();
  const candidates: UiColorCandidate[] = [];

  function add(hex: string, name: string, detail: string, id: string, origin: CandidateOrigin) {
    const normalized = normalizeHex(hex);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    const chroma = toOklch(normalized)?.c ?? 0;
    const fitness = candidateFitness(normalized, tokens, occupiedSeries(tokens).map((series) => series.hex));
    candidates.push({ id, hex: normalized, name, detail, origin, fitness, score: chroma });
  }

  for (const color of colors) {
    const channels = toOklch(color.hex);
    add(color.hex, color.name || 'Color fuente', `fuente · C ${(channels?.c ?? 0).toFixed(3)} · hue ${Math.round(channels?.h ?? 0)}°`, `source-${color.id}`, 'source');
    if (!channels || typeof channels.h !== 'number' || (channels.c ?? 0) < 0.03) continue;
    for (const delta of [-0.22, 0.22]) {
      const lightness = Math.min(0.9, Math.max(0.15, (channels.l ?? 0.5) + delta));
      const actualDelta = lightness - (channels.l ?? 0.5);
      if (Math.abs(actualDelta) < 0.15) continue;
      add(
        oklchChannelsToHex(lightness, channels.c ?? 0, channels.h),
        'Derivado',
        `de ${color.name || 'fuente'} · L ${actualDelta >= 0 ? '+' : ''}${actualDelta.toFixed(2)}`,
        `derived-${color.id}-${delta}`,
        'derived',
      );
    }
  }

  return candidates.sort((left, right) => right.score - left.score);
}

export function sortCandidatesForUse(candidates: UiColorCandidate[], use: ColorUse): UiColorCandidate[] {
  return [...candidates].sort((left, right) => {
    const leftFitness = fitnessForUse(left.fitness, use);
    const rightFitness = fitnessForUse(right.fitness, use);
    return Number(rightFitness.ok) - Number(leftFitness.ok)
      || (rightFitness.ratio ?? 0) - (leftFitness.ratio ?? 0)
      || right.score - left.score;
  });
}

export function groupCandidatesForUse(candidates: UiColorCandidate[], use: ColorUse): CandidateFamily[] {
  const originRank: Record<CandidateOrigin, number> = { source: 0, derived: 1, synthetic: 2 };
  const ordered = sortCandidatesForUse(candidates, use);
  const families: CandidateFamily[] = [];

  for (const candidate of ordered) {
    const family = families.find((entry) => perceptuallyNear(entry.representative.hex, candidate.hex));
    if (family) {
      family.variants.push(candidate);
    } else {
      families.push({ id: candidate.id, representative: candidate, variants: [] });
    }
  }

  for (const family of families) {
    const members = [family.representative, ...family.variants];
    const bestSource = members
      .filter((candidate) => candidate.origin === 'source' && fitnessForUse(candidate.fitness, use).ok)
      .sort((left, right) => compareFitness(left, right, use))[0];
    if (bestSource && bestSource.id !== family.representative.id) {
      family.variants = members.filter((candidate) => candidate.id !== bestSource.id);
      family.representative = bestSource;
      family.id = bestSource.id;
    }
  }

  return families.sort((left, right) =>
    originRank[left.representative.origin] - originRank[right.representative.origin]
    || compareFitness(left.representative, right.representative, use),
  );
}

function compareFitness(left: UiColorCandidate, right: UiColorCandidate, use: ColorUse): number {
  const leftFitness = fitnessForUse(left.fitness, use);
  const rightFitness = fitnessForUse(right.fitness, use);
  return Number(rightFitness.ok) - Number(leftFitness.ok)
    || (rightFitness.ratio ?? 0) - (leftFitness.ratio ?? 0)
    || right.score - left.score;
}

function perceptuallyNear(leftHex: string, rightHex: string): boolean {
  const leftLab = toOklab(leftHex);
  const rightLab = toOklab(rightHex);
  const labDistance = leftLab && rightLab
    ? Math.hypot(
        (leftLab.l ?? 0) - (rightLab.l ?? 0),
        (leftLab.a ?? 0) - (rightLab.a ?? 0),
        (leftLab.b ?? 0) - (rightLab.b ?? 0),
      )
    : Number.POSITIVE_INFINITY;
  if (labDistance < 0.08) return true;
  const left = toOklch(leftHex);
  const right = toOklch(rightHex);
  if (!left || !right) return false;
  return hueDistance(left.h ?? 0, right.h ?? 0) <= 15
    && Math.abs((left.l ?? 0) - (right.l ?? 0)) < 0.12
    && Math.abs((left.c ?? 0) - (right.c ?? 0)) < 0.06;
}

export function deriveFromPrimary(primaryHex: string): string {
  const primary = toOklch(primaryHex);
  const lightness = (primary?.l ?? 0.5) >= 0.5
    ? Math.max(0.12, (primary?.l ?? 0.5) - 0.18)
    : Math.min(0.9, (primary?.l ?? 0.5) + 0.18);
  return oklchChannelsToHex(
    lightness,
    Math.max(0.055, primary?.c ?? 0.08),
    ((primary?.h ?? 0) + 34) % 360,
  );
}

function candidateFitness(hex: string, tokens: SemanticTokens, occupiedDataHexes: string[]): ColorFitness {
  return evaluateColorFitness(hex, {
    backgroundHex: tokens.background.hex,
    lightOnColorBaseHex: tokens['surface-elevated'].hex,
    darkTextBaseHex: tokens['on-surface'].hex,
    occupiedDataHexes,
  });
}
