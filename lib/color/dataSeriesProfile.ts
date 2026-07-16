import type { ColorFitness, FitnessResult } from './colorFitness';

export type AxisScore = 'ok' | 'mid' | 'bad';

export type DataSeriesProfile = {
  origin: 'fuente' | 'derivado' | 'sintético';
  hue: number;
  deltaL: number;
  axes: {
    text: AxisScore;
    fill: AxisScore;
    accent: AxisScore;
    surface: AxisScore;
    data: AxisScore;
  };
  ratios: {
    text: string;
    fill: string;
    accent: string;
    surface: string;
    data: string;
  };
  verdict: 'fill' | 'data' | 'weak';
  verdictLabel: string;
  separation: {
    deltaHue: number;
    deltaL: number;
    note: string;
  };
};

export type DataSeries = DataSeriesProfile & {
  id: string;
  name: string;
  hex: string;
  assigned: boolean;
};

type ProfileInput = {
  fitness: ColorFitness;
  origin: 'source' | 'derived' | 'synthetic';
  hue: number;
  separation: { minHue: number | null; minLightness: number | null };
};

const ORIGIN_LABELS: Record<ProfileInput['origin'], DataSeriesProfile['origin']> = {
  source: 'fuente',
  derived: 'derivado',
  synthetic: 'sintético',
};

function score(result: FitnessResult, threshold: number): AxisScore {
  if (result.ok) return 'ok';
  if (result.ratio !== undefined && result.ratio >= threshold) return 'mid';
  return 'bad';
}

function ratio(result: FitnessResult): string {
  return result.ratio === undefined ? (result.ok ? '✓' : '✕') : `${result.ratio.toFixed(1)}:1`;
}

export function buildDataSeriesProfile({
  fitness,
  origin,
  hue,
  separation,
}: ProfileInput): DataSeriesProfile {
  const verdict = fitness.asData.ok
    ? 'data'
    : fitness.bestUse === 'fill'
      ? 'fill'
      : 'weak';
  const firstSeries = separation.minHue === null || separation.minLightness === null;
  const deltaHue = separation.minHue ?? 0;
  const deltaL = separation.minLightness ?? 0;

  return {
    origin: ORIGIN_LABELS[origin],
    hue: Math.round(hue),
    deltaL,
    axes: {
      text: score(fitness.asText, 3),
      fill: score(fitness.asFill, 3),
      accent: score(fitness.asAccent, 0),
      surface: score(fitness.asSurface, 3),
      data: score(fitness.asData, 3),
    },
    ratios: {
      text: ratio(fitness.asText),
      fill: ratio(fitness.asFill),
      accent: ratio(fitness.asAccent),
      surface: ratio(fitness.asSurface),
      data: ratio(fitness.asData),
    },
    verdict,
    verdictLabel: verdict === 'data'
      ? 'Datos ✓'
      : verdict === 'fill'
        ? 'Mejor: fill'
        : 'Elegir',
    separation: {
      deltaHue,
      deltaL,
      note: firstSeries
        ? 'Primera serie; no necesita separación previa.'
        : fitness.asData.ok
          ? 'Mantiene separación perceptual.'
          : 'Puede confundirse con una serie existente.',
    },
  };
}
