import { toCluster } from './colorClustering';
import type { ColorCluster, LabSample } from './imageTypes';

/** Minimum OKLab chroma for a detail to count as a color, not a tinted shade. */
const DETAIL_CHROMA_MIN = 0.07;
/** Clusters this chromatic already represent their hue. */
const CHROMATIC_CLUSTER_MIN = 0.04;
/** A detail hue must differ this much from every chromatic cluster. */
const DETAIL_HUE_NOVELTY_MIN = 30;
/** Pixels whose hue is within this distance of the detail belong to it. */
const DETAIL_HUE_WINDOW = 20;
/** Share of image pixels a detail needs; below it, it is noise. */
const DETAIL_SHARE_MIN = 0.001;
const MAX_DETAILS = 2;

export function labChroma(lab: [number, number, number]): number {
  return Math.hypot(lab[1], lab[2]);
}

export function labHue(lab: [number, number, number]): number {
  return ((Math.atan2(lab[2], lab[1]) * 180) / Math.PI + 360) % 360;
}

export function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function weightOf(sample: LabSample): number {
  return sample.weight ?? 1;
}

function chromaticHues(clusters: ColorCluster[]): number[] {
  return clusters
    .filter((cluster) => labChroma(cluster.centroid) >= CHROMATIC_CLUSTER_MIN)
    .map((cluster) => labHue(cluster.centroid));
}

function isNovel(hue: number, hues: number[]): boolean {
  return hues.every((covered) => hueDistance(covered, hue) >= DETAIL_HUE_NOVELTY_MIN);
}

/**
 * Finds small vivid areas whose hue no cluster represents (a flower's yellow
 * center, a logo on a product). k-means folds them into nearby large clusters
 * because they hold too few pixels to own a centroid.
 *
 * Returns new detail clusters; members are removed from the clusters they
 * were absorbed into so pixel shares still add up to 1.
 */
export function recoverVividDetails(clusters: ColorCluster[]): ColorCluster[] {
  const total = clusters.reduce((sum, cluster) => sum + cluster.weight, 0);

  if (total === 0) {
    return clusters;
  }

  let working = clusters;

  for (let detail = 0; detail < MAX_DETAILS; detail += 1) {
    const hues = chromaticHues(working);
    const candidates = working
      .flatMap((cluster) => cluster.members)
      .filter((sample) => labChroma(sample.lab) >= DETAIL_CHROMA_MIN && isNovel(labHue(sample.lab), hues));

    if (candidates.length === 0) {
      break;
    }

    // Seed at the hue with the most vivid pixel weight around it.
    const seed = candidates.reduce((best, sample) => {
      const score = (candidate: LabSample) =>
        candidates
          .filter((other) => hueDistance(labHue(other.lab), labHue(candidate.lab)) <= DETAIL_HUE_WINDOW)
          .reduce((sum, other) => sum + weightOf(other), 0);

      return score(sample) > score(best) ? sample : best;
    });
    const seedHue = labHue(seed.lab);
    const members = candidates.filter(
      (sample) => hueDistance(labHue(sample.lab), seedHue) <= DETAIL_HUE_WINDOW,
    );
    const weight = members.reduce((sum, sample) => sum + weightOf(sample), 0);

    if (weight / total < DETAIL_SHARE_MIN) {
      break;
    }

    const taken = new Set(members);
    const remaining = working
      .map((cluster) => cluster.members.filter((member) => !taken.has(member)))
      .filter((rest) => rest.length > 0)
      .map(toCluster);

    working = [...remaining, toCluster(members)];
  }

  return working;
}
