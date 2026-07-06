import type { ColorCluster, LabSample } from './imageTypes';

const K_MEANS_ITERATIONS = 12;

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

function initializeCentroids(
  samples: LabSample[],
  clusterCount: number,
  centroidSeed = 0,
): [number, number, number][] {
  if (samples.length === 0) {
    return [];
  }

  const startIndex = centroidSeed % samples.length;
  const centroids: [number, number, number][] = [[...samples[startIndex]!.lab]];

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
