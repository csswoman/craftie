import { converter, formatHex } from 'culori';

import { normalizeHex } from './normalizeHex';

export type ExtractedColor = {
  hex: string;
  prominence: number;
};

export type ImageExtractionOptions = {
  count?: number;
  maxFileSizeMB?: number;
  sampleStep?: number;
  maxCount?: number;
};

type ResolvedOptions = {
  count: number;
  maxFileSizeMB: number;
  sampleStep: number;
};

export type RasterData = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

type RgbSample = {
  r: number;
  g: number;
  b: number;
};

type LabSample = {
  rgb: RgbSample;
  lab: [number, number, number];
};

type Cluster = {
  centroid: [number, number, number];
  members: LabSample[];
};

const DEFAULT_OPTIONS: ResolvedOptions = {
  count: 3,
  maxFileSizeMB: 5,
  sampleStep: 10,
};

export const PALETTE_EXTRACTION_COUNT = 10;
const DEFAULT_MAX_COUNT = 5;
const PALETTE_MAX_COUNT = 12;

const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_CANVAS_DIMENSION = 256;
const NEAR_WHITE_L = 0.95;
const NEAR_BLACK_L = 0.05;
const NEUTRAL_DOMINANCE_THRESHOLD = 0.4;
const K_MEANS_ITERATIONS = 12;

const toLab = converter('lab');
const toOklch = converter('oklch');
const toRgb = converter('rgb');

function resolveOptions(options?: ImageExtractionOptions): ResolvedOptions {
  const count = options?.count ?? DEFAULT_OPTIONS.count;
  const maxFileSizeMB = options?.maxFileSizeMB ?? DEFAULT_OPTIONS.maxFileSizeMB;
  const sampleStep = options?.sampleStep ?? DEFAULT_OPTIONS.sampleStep;
  const maxCount = options?.maxCount ?? DEFAULT_MAX_COUNT;

  if (count < 2 || count > maxCount) {
    throw new Error(`count must be between 2 and ${maxCount}`);
  }

  if (maxFileSizeMB <= 0) {
    throw new Error('maxFileSizeMB must be greater than 0');
  }

  if (sampleStep < 1) {
    throw new Error('sampleStep must be at least 1');
  }

  return { count, maxFileSizeMB, sampleStep };
}

function isAcceptedImage(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.has(file.type)) {
    return true;
  }

  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function validateImageFile(file: File, maxFileSizeMB: number): void {
  if (!isAcceptedImage(file)) {
    throw new Error('Unsupported image format. Accepted formats: JPG, PNG, and WebP.');
  }

  const maxBytes = maxFileSizeMB * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`Image exceeds maximum size of ${maxFileSizeMB}MB.`);
  }
}

function getDrawDimensions(width: number, height: number): { width: number; height: number } {
  const largestSide = Math.max(width, height);

  if (largestSide <= MAX_CANVAS_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_CANVAS_DIMENSION / largestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function rgbSample(r: number, g: number, b: number): RgbSample {
  return { r, g, b };
}

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

function samplePixels(raster: RasterData, sampleStep: number): RgbSample[] {
  const samples: RgbSample[] = [];
  const { data, width, height } = raster;

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3] ?? 0;

      if (alpha === 0) {
        continue;
      }

      samples.push(
        rgbSample(data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0),
      );
    }
  }

  return samples;
}

function getOklchLightness(rgb: RgbSample): number {
  const oklch = toOklch({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255,
  });

  if (!oklch || oklch.mode !== 'oklch') {
    return 0;
  }

  return oklch.l;
}

function isNearWhite(rgb: RgbSample): boolean {
  return getOklchLightness(rgb) > NEAR_WHITE_L;
}

function isNearBlack(rgb: RgbSample): boolean {
  return getOklchLightness(rgb) < NEAR_BLACK_L;
}

export function filterNeutralSamples(samples: RgbSample[]): RgbSample[] {
  if (samples.length === 0) {
    return samples;
  }

  const whiteCount = samples.filter(isNearWhite).length;
  const blackCount = samples.filter(isNearBlack).length;
  const whiteRatio = whiteCount / samples.length;
  const blackRatio = blackCount / samples.length;
  const keepWhite = whiteRatio > NEUTRAL_DOMINANCE_THRESHOLD;
  const keepBlack = blackRatio > NEUTRAL_DOMINANCE_THRESHOLD;

  return samples.filter((sample) => {
    if (!keepWhite && isNearWhite(sample)) {
      return false;
    }

    if (!keepBlack && isNearBlack(sample)) {
      return false;
    }

    return true;
  });
}

function labDistanceSquared(left: [number, number, number], right: [number, number, number]): number {
  const dl = left[0] - right[0];
  const da = left[1] - right[1];
  const db = left[2] - right[2];

  return dl * dl + da * da + db * db;
}

function averageCentroid(members: LabSample[]): [number, number, number] {
  const totals: [number, number, number] = [0, 0, 0];

  for (const member of members) {
    totals[0] += member.lab[0];
    totals[1] += member.lab[1];
    totals[2] += member.lab[2];
  }

  const count = members.length;

  return [totals[0] / count, totals[1] / count, totals[2] / count];
}

function initializeCentroids(samples: LabSample[], clusterCount: number): [number, number, number][] {
  if (samples.length === 0) {
    return [];
  }

  const centroids: [number, number, number][] = [[...samples[0]!.lab]];

  while (centroids.length < clusterCount) {
    let bestIndex = 0;
    let bestDistance = -1;

    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index]!;
      let nearestCentroidDistance = Number.POSITIVE_INFINITY;

      for (const centroid of centroids) {
        nearestCentroidDistance = Math.min(
          nearestCentroidDistance,
          labDistanceSquared(sample.lab, centroid),
        );
      }

      if (nearestCentroidDistance > bestDistance) {
        bestDistance = nearestCentroidDistance;
        bestIndex = index;
      }
    }

    centroids.push([...samples[bestIndex]!.lab]);
  }

  return centroids;
}

export function clusterSamples(samples: LabSample[], clusterCount: number): Cluster[] {
  if (samples.length === 0) {
    return [];
  }

  const k = Math.min(clusterCount, samples.length);
  let centroids = initializeCentroids(samples, k);
  let assignments = new Array<number>(samples.length).fill(0);

  for (let iteration = 0; iteration < K_MEANS_ITERATIONS; iteration += 1) {
    let changed = false;

    for (let index = 0; index < samples.length; index += 1) {
      const sample = samples[index]!;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      for (let centroidIndex = 0; centroidIndex < centroids.length; centroidIndex += 1) {
        const distance = labDistanceSquared(sample.lab, centroids[centroidIndex]!);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = centroidIndex;
        }
      }

      if (assignments[index] !== nearest) {
        assignments[index] = nearest;
        changed = true;
      }
    }

    const grouped = Array.from({ length: k }, () => [] as LabSample[]);

    for (let index = 0; index < samples.length; index += 1) {
      grouped[assignments[index]!]!.push(samples[index]!);
    }

    centroids = grouped.map((members, centroidIndex) => {
      if (members.length === 0) {
        return centroids[centroidIndex]!;
      }

      return averageCentroid(members);
    });

    if (!changed) {
      break;
    }
  }

  const grouped = Array.from({ length: k }, () => [] as LabSample[]);

  for (let index = 0; index < samples.length; index += 1) {
    grouped[assignments[index]!]!.push(samples[index]!);
  }

  return grouped
    .map((members, index) => ({
      centroid: centroids[index]!,
      members,
    }))
    .filter((cluster) => cluster.members.length > 0);
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
  const resolved = resolveOptions(options);
  const rgbSamples = samplePixels(raster, resolved.sampleStep);

  if (rgbSamples.length === 0) {
    throw new Error('No opaque pixels were available for color extraction.');
  }

  const filteredSamples = filterNeutralSamples(rgbSamples);
  const workingSamples = filteredSamples.length >= 2 ? filteredSamples : rgbSamples;
  const labSamples = workingSamples.map(toLabSample);
  const clusters = clusterSamples(labSamples, resolved.count);
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

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to load image file.'));
    };

    image.src = objectUrl;
  });
}

function rasterizeImage(image: HTMLImageElement): RasterData {
  const dimensions = getDrawDimensions(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (context === null) {
    throw new Error('Unable to create canvas rendering context.');
  }

  context.drawImage(image, 0, 0, dimensions.width, dimensions.height);
  const imageData = context.getImageData(0, 0, dimensions.width, dimensions.height);

  return {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
  };
}

/**
 * Extracts dominant colors from a local image file using canvas sampling and k-means.
 */
export async function extractColorsFromImage(
  file: File,
  options?: ImageExtractionOptions,
): Promise<ExtractedColor[]> {
  const resolved = resolveOptions(options);
  validateImageFile(file, resolved.maxFileSizeMB);

  if (typeof document === 'undefined') {
    throw new Error('extractColorsFromImage requires a browser environment.');
  }

  const image = await loadImageElement(file);
  const raster = rasterizeImage(image);

  return extractColorsFromRaster(raster, options);
}

/**
 * Extracts a broader set of dominant colors for the visual palette builder.
 */
export async function extractPaletteColorsFromImage(file: File): Promise<ExtractedColor[]> {
  return extractColorsFromImage(file, {
    count: PALETTE_EXTRACTION_COUNT,
    maxCount: PALETTE_MAX_COUNT,
  });
}
