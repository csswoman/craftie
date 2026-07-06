export type ExtractedColor = {
  hex: string;
  prominence: number;
};

export type ImageExtractionOptions = {
  count?: number;
  maxFileSizeMB?: number;
  sampleStep?: number;
  maxCount?: number;
  sampleOffset?: number;
  centroidSeed?: number;
};

export type ResolvedImageExtractionOptions = {
  count: number;
  maxFileSizeMB: number;
  sampleStep: number;
};

export type RasterData = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

export type RgbSample = {
  r: number;
  g: number;
  b: number;
};

export type LabSample = {
  rgb: RgbSample;
  lab: [number, number, number];
};

export type ColorCluster = {
  centroid: [number, number, number];
  members: LabSample[];
};

export const PALETTE_EXTRACTION_COUNT = 10;
export const DEFAULT_MAX_COUNT = 5;

const DEFAULT_OPTIONS: ResolvedImageExtractionOptions = {
  count: 3,
  maxFileSizeMB: 5,
  sampleStep: 10,
};

export function resolveImageExtractionOptions(
  options?: ImageExtractionOptions,
): ResolvedImageExtractionOptions {
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
