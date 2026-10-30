import type { ColorCluster, LabSample } from './imageTypes';

type Vector = [number, number, number];

const K_MEANS_ITERATIONS = 16;
/**
 * OKLab distance under which two clusters read as the same color
 * (the OKLab just-noticeable difference is about 0.02).
 */
export const CLUSTER_MERGE_DISTANCE = 0.04;
/**
 * Low-chroma shades (wood, paper, shadow) merge at a wider distance: their
 * lightness steps add little to a palette and crowd out real colors.
 */
const NEUTRAL_MERGE_DISTANCE = 0.08;
const NEUTRAL_MERGE_CHROMA_MAX = 0.06;
function distanceSquared(left: Vector, right: Vector): number {
  const dl = left[0] - right[0];
  const da = left[1] - right[1];
  const db = left[2] - right[2];

  return dl * dl + da * da + db * db;
}

function weightOf(sample: LabSample): number {
  return sample.weight ?? 1;
}

function totalWeight(members: LabSample[]): number {
  return members.reduce((sum, member) => sum + weightOf(member), 0);
}

function weightedCentroid(members: LabSample[]): Vector {
  const totals: Vector = [0, 0, 0];
  let weight = 0;

  for (const member of members) {
    const memberWeight = weightOf(member);
    totals[0] += member.lab[0] * memberWeight;
    totals[1] += member.lab[1] * memberWeight;
    totals[2] += member.lab[2] * memberWeight;
    weight += memberWeight;
  }

  return [totals[0] / weight, totals[1] / weight, totals[2] / weight];
}

/** Small deterministic PRNG so the same image and seed give the same palette. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * k-means++ seeding: each new centroid is drawn with probability proportional
 * to weight × squared distance, so seeds spread across the image without
 * locking onto single outlier pixels the way farthest-point seeding does.
 */
function initializeCentroids(samples: LabSample[], clusterCount: number, centroidSeed: number): Vector[] {
  const random = mulberry32(centroidSeed + 1);
  const heaviest = samples.reduce((best, sample) => (weightOf(sample) > weightOf(best) ? sample : best));
  const centroids: Vector[] = [[...heaviest.lab]];
  const nearest = samples.map((sample) => distanceSquared(sample.lab, centroids[0]!));
  const addCentroid = (centroid: Vector) => {
    centroids.push(centroid);

    for (let index = 0; index < samples.length; index += 1) {
      nearest[index] = Math.min(nearest[index]!, distanceSquared(samples[index]!.lab, centroid));
    }
  };

  while (centroids.length < clusterCount) {
    const scores = samples.map((sample, index) => weightOf(sample) * nearest[index]!);
    const total = scores.reduce((sum, score) => sum + score, 0);

    if (total === 0) {
      break;
    }

    let target = random() * total;
    let chosen = samples.length - 1;

    for (let index = 0; index < scores.length; index += 1) {
      target -= scores[index]!;

      if (target <= 0) {
        chosen = index;
        break;
      }
    }

    addCentroid([...samples[chosen]!.lab]);
  }

  return centroids;
}

function nearestCentroid(sample: LabSample, centroids: Vector[]): number {
  let nearest = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < centroids.length; index += 1) {
    const distance = distanceSquared(sample.lab, centroids[index]!);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = index;
    }
  }

  return nearest;
}

export function toCluster(members: LabSample[]): ColorCluster {
  return { centroid: weightedCentroid(members), members, weight: totalWeight(members) };
}

/**
 * Merges clusters closer than `distance` in OKLab, heaviest first, so the
 * palette does not list two swatches that read as the same color.
 */
export function mergeSimilarClusters(
  clusters: ColorCluster[],
  distance = CLUSTER_MERGE_DISTANCE,
): ColorCluster[] {
  const isMuted = (centroid: Vector) => Math.hypot(centroid[1], centroid[2]) < NEUTRAL_MERGE_CHROMA_MAX;
  const thresholdFor = (left: Vector, right: Vector) => {
    const limit = isMuted(left) && isMuted(right) ? Math.max(distance, NEUTRAL_MERGE_DISTANCE) : distance;
    return limit * limit;
  };
  const merged: ColorCluster[] = [];

  for (const cluster of [...clusters].sort((left, right) => right.weight - left.weight)) {
    const targetIndex = merged.findIndex(
      (existing) =>
        distanceSquared(existing.centroid, cluster.centroid) < thresholdFor(existing.centroid, cluster.centroid),
    );

    if (targetIndex === -1) {
      merged.push(cluster);
    } else {
      merged[targetIndex] = toCluster([...merged[targetIndex]!.members, ...cluster.members]);
    }
  }

  return merged;
}

/** Weighted k-means++ over OKLab samples. Deterministic for a given seed. */
export function clusterSamples(
  samples: LabSample[],
  clusterCount: number,
  centroidSeed = 0,
): ColorCluster[] {
  if (samples.length === 0) {
    return [];
  }

  const k = Math.min(clusterCount, samples.length);
  let centroids = initializeCentroids(samples, k, centroidSeed);
  const assignments = samples.map((sample) => nearestCentroid(sample, centroids));

  for (let iteration = 0; iteration < K_MEANS_ITERATIONS; iteration += 1) {
    const grouped = centroids.map(() => [] as LabSample[]);

    samples.forEach((sample, index) => grouped[assignments[index]!]!.push(sample));
    centroids = grouped.map((members, index) =>
      members.length === 0 ? centroids[index]! : weightedCentroid(members),
    );

    let changed = false;

    for (let index = 0; index < samples.length; index += 1) {
      const nearest = nearestCentroid(samples[index]!, centroids);

      if (assignments[index] !== nearest) {
        assignments[index] = nearest;
        changed = true;
      }
    }

    if (!changed) {
      break;
    }
  }

  const grouped = centroids.map(() => [] as LabSample[]);
  samples.forEach((sample, index) => grouped[assignments[index]!]!.push(sample));

  return grouped.filter((members) => members.length > 0).map(toCluster);
}
