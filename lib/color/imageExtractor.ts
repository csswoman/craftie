import { clampChroma, converter, formatHex } from 'culori';

import { clusterSamples, mergeSimilarClusters } from './colorClustering';
import { hueDistance, labChroma as chroma, labHue as hueOf, recoverVividDetails } from './vividDetails';
import {
  PALETTE_EXTRACTION_COUNT,
  resolveImageExtractionOptions,
  type ColorCluster,
  type ExtractedColor,
  type ImageExtractionOptions,
  type LabSample,
  type RasterData,
  type RgbSample,
} from './imageTypes';
import { validateImageFile } from './imageValidation';
import { filterNeutralSamples, quantizeSamples, samplePixels } from './rasterSampling';
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

const toOklab = converter('oklab');

/** Extra clusters requested before merging, so k adapts to image variety. */
const OVERCLUSTER_EXTRA = 4;
const MAX_CLUSTERS = 16;
/** Clusters smaller than this share are treated as noise. */
const NOISE_SHARE_MAX = 0.003;
/** Vivid details (a flower's center) survive down to this share. */
const VIVID_NOISE_SHARE_MAX = 0.001;
/**
 * Chroma restoration limits: centroids this gray carry no reliable hue, and
 * the boost is capped so opposing member hues never turn into a saturated
 * color that was not in the image.
 */
const RESTORE_CHROMA_MIN = 0.02;
const RESTORE_SCALE_MAX = 1.35;
/** Small clusters this chromatic, on a hue nothing else covers, are kept. */
const VIVID_CHROMA_MIN = 0.07;
const CHROMATIC_CLUSTER_MIN = 0.04;
const NOVEL_HUE_MIN = 30;
const RESERVED_VIVID_SLOTS = 2;

function toLabSample(rgb: RgbSample): LabSample {
  const lab = toOklab({ mode: 'rgb', r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 });

  if (!lab || lab.mode !== 'oklab') {
    throw new Error('Unable to convert sampled color to OKLab');
  }

  return {
    rgb,
    lab: [lab.l, lab.a, lab.b],
    ...(rgb.weight === undefined ? {} : { weight: rgb.weight }),
  };
}

function rgbHex(rgb: RgbSample): string {
  return normalizeHex(
    `#${[rgb.r, rgb.g, rgb.b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`,
  );
}

/**
 * Publishes the cluster centroid with the members' mean chroma. A plain mean
 * of a/b shrinks toward gray whenever members spread around a hue, which made
 * extracted colors look muddier than the image.
 */
function clusterCentroidHex(cluster: ColorCluster): string {
  const [lightness, a, b] = cluster.centroid;
  const centroidChroma = Math.hypot(a, b);
  const meanChroma =
    cluster.members.reduce((sum, member) => sum + chroma(member.lab) * (member.weight ?? 1), 0) /
    cluster.weight;
  const scale = centroidChroma >= RESTORE_CHROMA_MIN
    ? Math.min(RESTORE_SCALE_MAX, Math.max(1, meanChroma / centroidChroma))
    : 1;
  const color = clampChroma({ mode: 'oklab', l: lightness, a: a * scale, b: b * scale }, 'oklch');
  const hex = formatHex(color);

  if (hex === undefined) {
    throw new Error('Unable to convert cluster centroid to HEX');
  }

  return normalizeHex(hex);
}

function distanceSquared(left: [number, number, number], right: [number, number, number]): number {
  return (left[0] - right[0]) ** 2 + (left[1] - right[1]) ** 2 + (left[2] - right[2]) ** 2;
}

function clusterMedoidHex(cluster: ColorCluster): string {
  const medoid = cluster.members.reduce((closest, sample) =>
    distanceSquared(sample.lab, cluster.centroid) < distanceSquared(closest.lab, cluster.centroid)
      ? sample
      : closest,
  );

  return rgbHex(medoid.rgb);
}

function coversNewHue(cluster: ColorCluster, others: ColorCluster[]): boolean {
  const hue = hueOf(cluster.centroid);

  return others
    .filter((other) => chroma(other.centroid) >= CHROMATIC_CLUSTER_MIN)
    .every((other) => hueDistance(hueOf(other.centroid), hue) >= NOVEL_HUE_MIN);
}

/**
 * Picks the published clusters: the most prominent ones, plus up to two small
 * vivid clusters on a new hue that would otherwise be pushed out by shades of
 * the main colors.
 */
function selectPublished(clusters: ColorCluster[], totalWeight: number, count: number): ColorCluster[] {
  const meaningful = clusters.filter((cluster) => {
    const share = cluster.weight / totalWeight;
    return share >= NOISE_SHARE_MAX ||
      (share >= VIVID_NOISE_SHARE_MAX && chroma(cluster.centroid) >= VIVID_CHROMA_MIN);
  });
  const pool = (meaningful.length > 0 ? meaningful : clusters)
    .sort((left, right) => right.weight - left.weight);
  const selected = pool.slice(0, count);
  let reserved = 0;

  for (const vivid of pool.slice(count)) {
    if (reserved === RESERVED_VIVID_SLOTS) {
      break;
    }

    if (chroma(vivid.centroid) < VIVID_CHROMA_MIN || !coversNewHue(vivid, selected)) {
      continue;
    }

    // Replace the smallest cluster that is not itself the only carrier of a hue.
    const replaceIndex = selected.findLastIndex(
      (cluster, index) =>
        index > 0 &&
        (chroma(cluster.centroid) < CHROMATIC_CLUSTER_MIN ||
          !coversNewHue(cluster, selected.filter((other) => other !== cluster))),
    );

    if (replaceIndex === -1) {
      break;
    }

    selected.splice(replaceIndex, 1);
    selected.push(vivid);
    reserved += 1;
  }

  return selected;
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

  const binned = quantizeSamples(rgbSamples);
  const filtered = filterNeutralSamples(binned);
  const workingSamples = filtered.length >= 2 ? filtered : binned;
  const labSamples = workingSamples.map(toLabSample);
  const clusterCount = Math.min(resolved.count + OVERCLUSTER_EXTRA, MAX_CLUSTERS);
  const clusters = recoverVividDetails(
    mergeSimilarClusters(clusterSamples(labSamples, clusterCount, centroidSeed)),
  );
  const totalWeight = clusters.reduce((sum, cluster) => sum + cluster.weight, 0) || 1;
  const published = selectPublished(clusters, totalWeight, resolved.count);
  const merged = new Map<string, number>();

  for (const cluster of published) {
    const hex = options?.publication === 'medoid'
      ? clusterMedoidHex(cluster)
      : clusterCentroidHex(cluster);
    merged.set(hex, (merged.get(hex) ?? 0) + cluster.weight / totalWeight);
  }

  return [...merged.entries()]
    .map(([hex, prominence]) => ({ hex, prominence }))
    .sort((left, right) => right.prominence - left.prominence || left.hex.localeCompare(right.hex));
}
