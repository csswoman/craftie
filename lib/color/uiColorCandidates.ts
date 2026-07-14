import { converter } from 'culori';

import { remainsDistinctWithColorVisionDeficiency, simulateColorVision } from './colorVision';
import { normalizeHex } from './normalizeHex';
import type { SelectableColor } from './selectableColors';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';
import { DATA_TOKEN_NAMES } from './uiColorPanel';
import { contrastRatio, oklchChannelsToHex } from '../utils/colorMath';

const toOklch = converter('oklch');
const toOklab = converter('oklab');

export type CandidateVerdictKind = 'serve' | 'weak' | 'collision';

export type UiColorCandidate = {
  id: string;
  hex: string;
  name: string;
  detail: string;
  verdict: {
    kind: CandidateVerdictKind;
    label: string;
    metric: string;
    disabled: boolean;
  };
  score: number;
};

type OccupiedSeries = { index: number; hex: string };

function hueDistance(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function visionDistance(leftHex: string, rightHex: string, deficiency: 'protanopia' | 'deuteranopia'): number {
  const left = toOklab(simulateColorVision(leftHex, deficiency));
  const right = toOklab(simulateColorVision(rightHex, deficiency));
  if (!left || !right) return 0;
  return Math.hypot(
    (left.l ?? 0) - (right.l ?? 0),
    (left.a ?? 0) - (right.a ?? 0),
    (left.b ?? 0) - (right.b ?? 0),
  );
}

function dataVerdict(hex: string, occupied: OccupiedSeries[], backgroundHex: string) {
  const channels = toOklch(hex);
  const contrast = contrastRatio(hex, backgroundHex);

  for (const series of occupied) {
    const previous = toOklch(series.hex);
    const deltaL = Math.abs((channels?.l ?? 0) - (previous?.l ?? 0));
    const deltaHue = typeof channels?.h === 'number' && typeof previous?.h === 'number'
      ? hueDistance(channels.h, previous.h)
      : 0;
    const structuralPass = deltaHue >= 25 || deltaL >= 0.15;
    const visionPass = remainsDistinctWithColorVisionDeficiency(hex, series.hex);

    if (!structuralPass || !visionPass) {
      const deuteranopiaCollision = visionDistance(hex, series.hex, 'deuteranopia') < 0.045;
      const protanopiaCollision = visionDistance(hex, series.hex, 'protanopia') < 0.045;
      return {
        kind: 'collision' as const,
        label: 'Colisiona',
        metric: deuteranopiaCollision
          ? `deuteranopía vs serie ${series.index}`
          : protanopiaCollision
            ? `protanopía vs serie ${series.index}`
          : `ΔL ${deltaL.toFixed(2)} vs serie ${series.index}`,
        disabled: true,
      };
    }
  }

  return contrast >= 3
    ? { kind: 'serve' as const, label: 'Sirve', metric: `${contrast.toFixed(1)}:1 vs fondo`, disabled: false }
    : { kind: 'weak' as const, label: `Débil ${contrast.toFixed(1)}:1`, metric: 'por debajo de 3:1', disabled: false };
}

function occupiedSeries(tokens: SemanticTokens, selected: SemanticTokenName): OccupiedSeries[] {
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

  function addCandidate(hex: string, name: string, detail: string, id: string) {
    const normalized = normalizeHex(hex);
    if (seen.has(normalized) || occupiedHexes.has(normalized)) return;
    seen.add(normalized);
    const verdict = dataVerdict(normalized, occupied, tokens.background.hex);
    const chroma = toOklch(normalized)?.c ?? 0;
    candidates.push({ id, hex: normalized, name, detail, verdict, score: contrastRatio(normalized, tokens.background.hex) + chroma });
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
      );
    }
  }

  return candidates.sort((left, right) => {
    const rank = { serve: 0, weak: 1, collision: 2 };
    return rank[left.verdict.kind] - rank[right.verdict.kind] || right.score - left.score;
  });
}

export function autoFillDataGaps(tokens: SemanticTokens, colors: SelectableColor[]) {
  const working = { ...tokens };
  const result: Array<{ token: SemanticTokenName; hex: string; candidate: UiColorCandidate }> = [];

  for (const tokenName of DATA_TOKEN_NAMES) {
    if (!working[tokenName].gap) continue;
    const candidate = buildDataCandidates(working, colors, tokenName)
      .find((entry) => !entry.verdict.disabled);
    if (!candidate) continue;
    result.push({ token: tokenName, hex: candidate.hex, candidate });
    working[tokenName] = { hex: candidate.hex, source: 'override' };
  }

  return result;
}

export function buildExpressiveCandidates(colors: SelectableColor[]): UiColorCandidate[] {
  const seen = new Set<string>();
  const candidates: UiColorCandidate[] = [];

  function add(hex: string, name: string, detail: string, id: string) {
    const normalized = normalizeHex(hex);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    const chroma = toOklch(normalized)?.c ?? 0;
    const verdict = chroma >= 0.055
      ? { kind: 'serve' as const, label: 'Sirve', metric: `C ${chroma.toFixed(3)}`, disabled: false }
      : chroma >= 0.03
        ? { kind: 'weak' as const, label: 'Débil', metric: `C ${chroma.toFixed(3)} < .055`, disabled: false }
        : { kind: 'collision' as const, label: 'Sin carácter', metric: `C ${chroma.toFixed(3)} < .030`, disabled: true };
    candidates.push({ id, hex: normalized, name, detail, verdict, score: chroma });
  }

  for (const color of colors) {
    const channels = toOklch(color.hex);
    add(color.hex, color.name || 'Color fuente', `fuente · C ${(channels?.c ?? 0).toFixed(3)} · hue ${Math.round(channels?.h ?? 0)}°`, `source-${color.id}`);
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
      );
    }
  }

  return candidates.sort((left, right) => right.score - left.score);
}
