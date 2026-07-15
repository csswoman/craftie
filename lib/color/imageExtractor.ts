import { converter, formatHex } from 'culori';

import { clusterSamples } from './colorClustering';
import {
  PALETTE_EXTRACTION_COUNT,
  resolveImageExtractionOptions,
  type ExtractedColor,
  type ImageExtractionOptions,
  type LabSample,
  type RasterData,
  type RgbSample,
} from './imageTypes';
import { validateImageFile } from './imageValidation';
import { filterNeutralSamples, samplePixels } from './rasterSampling';
import { normalizeHex } from './normalizeHex';

export {
  PALETTE_EXTRACTION_COUNT,
  type ExtractedColor,
  type ImageExtractionOptions,
  type RasterData,
} from './imageTypes';
export { validateImageFile } from './imageValidation';
export { filterNeutralSamples } from './rasterSampling';
export { clusterSamples } from './colorClustering';

const toLab = converter('lab');
const toRgb = converter('rgb');

function toLabSample(rgb: RgbSample): LabSample {
  const labColor = toLab({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 });

  if (!labColor || labColor.mode !== 'lab') {
    throw new Error('Unable to convert sampled color to LAB');
  }

  return {
    rgb,
    lab: [labColor.l, labColor.a, labColor.b],
  };
}

function labCentroidToHex(centroid: [number, number, number]): string {
  const rgb = toRgb({ mode: 'lab', l: centroid[0], a: centroid[1], b: centroid[2] });
  const hex = formatHex(rgb);

  if (hex === undefined) {
    throw new Error('Unable to convert cluster centroid to HEX');
  }

  return normalizeHex(hex);
}

function labDistanceSquared(left: [number, number, number], right: [number, number, number]): number {
  return left.reduce((sum, channel, index) => {
    const delta = channel - right[index]!;
    return sum + delta * delta;
  }, 0);
}

function clusterMedoidHex(cluster: { centroid: [number, number, number]; members: LabSample[] }): string {
  const medoid = cluster.members.reduce((closest, sample) =>
    labDistanceSquared(sample.lab, cluster.centroid) < labDistanceSquared(closest.lab, cluster.centroid)
      ? sample
      : closest,
  );

  return normalizeHex(
    `#${[medoid.rgb.r, medoid.rgb.g, medoid.rgb.b]
      .map((channel) => channel.toString(16).padStart(2, '0'))
      .join('')}`,
  );
}

export function extractColorsFromRaster(
  raster: RasterData,
  options?: ImageExtractionOptions,
): ExtractedColor[] {
  const resolved = resolveImageExtractionOptions(options);
  const sampleOffset = options?.sampleOffset ?? 0;
  const centroidSeed = options?.centroidSeed ?? 0;
  const rgbSamples = samplePixels(raster, resolved.sampleStep, sampleOffset);

  if (rgbSamples.length === 0) {
    throw new Error('No encontramos píxeles suficientes en la imagen. Prueba con otra foto o un recorte distinto.');
  }

  const filteredSamples = filterNeutralSamples(rgbSamples);
  const workingSamples = filteredSamples.length >= 2 ? filteredSamples : rgbSamples;
  const labSamples = workingSamples.map(toLabSample);
  const clusters = clusterSamples(labSamples, resolved.count, centroidSeed);
  const totalSamples = workingSamples.length;

  const merged = new Map<string, number>();

  for (const cluster of clusters) {
    const hex = options?.publication === 'medoid'
      ? clusterMedoidHex(cluster)
      : labCentroidToHex(cluster.centroid);
    const prominence = cluster.members.length / totalSamples;
    merged.set(hex, (merged.get(hex) ?? 0) + prominence);
  }

  const results = [...merged.entries()]
    .map(([hex, prominence]) => ({ hex, prominence }))
    .sort((left, right) => {
      if (right.prominence !== left.prominence) {
        return right.prominence - left.prominence;
      }

      return left.hex.localeCompare(right.hex);
    });

  if (results.length >= resolved.count) {
    return results.slice(0, resolved.count);
  }

  return results;
}
