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

export function extractColorsFromRaster(
  raster: RasterData,
  options?: ImageExtractionOptions,
): ExtractedColor[] {
  const resolved = resolveImageExtractionOptions(options);
  const sampleOffset = options?.sampleOffset ?? 0;
  const centroidSeed = options?.centroidSeed ?? 0;
  const rgbSamples = samplePixels(raster, resolved.sampleStep, sampleOffset);

  if (rgbSamples.length === 0) {
    throw new Error('No opaque pixels were available for color extraction.');
  }

  const filteredSamples = filterNeutralSamples(rgbSamples);
  const workingSamples = filteredSamples.length >= 2 ? filteredSamples : rgbSamples;
  const labSamples = workingSamples.map(toLabSample);
  const clusters = clusterSamples(labSamples, resolved.count, centroidSeed);
  const totalSamples = workingSamples.length;

  const merged = new Map<string, number>();

  for (const cluster of clusters) {
    const hex = labCentroidToHex(cluster.centroid);
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
