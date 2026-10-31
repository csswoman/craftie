import { hueDistance, labChroma as chroma, labHue as hueOf } from './vividDetails';
import type { ColorCluster } from './imageTypes';

const CHROMATIC_MIN = 0.04;
/** Same family: hues closer than this (degrees) count as one color. */
const SAME_HUE_MAX = 30;
/** OKLab lightness gap that makes two shades of one hue clearly distinct. */
const TONE_GAP_MIN = 0.18;
const RESERVED_TONE_SLOTS = 2;

function sameFamily(left: ColorCluster, right: ColorCluster): boolean {
  return chroma(left.centroid) >= CHROMATIC_MIN &&
    chroma(right.centroid) >= CHROMATIC_MIN &&
    hueDistance(hueOf(left.centroid), hueOf(right.centroid)) < SAME_HUE_MAX;
}

function lightnessGap(left: ColorCluster, right: ColorCluster): number {
  return Math.abs(left.centroid[0] - right.centroid[0]);
}

function addsTone(candidate: ColorCluster, selected: ColorCluster[]): boolean {
  const family = selected.filter((cluster) => sameFamily(cluster, candidate));

  return family.length > 0 && family.every((cluster) => lightnessGap(cluster, candidate) >= TONE_GAP_MIN);
}

/** A selected cluster is redundant when another selected one is a near twin in hue and lightness. */
function isRedundant(cluster: ColorCluster, selected: ColorCluster[]): boolean {
  return selected.some(
    (other) => other !== cluster && sameFamily(other, cluster) && lightnessGap(other, cluster) < TONE_GAP_MIN,
  );
}

/**
 * Light/dark variants of a main hue (shadow, highlight) are real tones of the
 * image. When the prominent clusters only cover one lightness of a hue, swap
 * the smallest redundant cluster for a distinct-lightness variant of it.
 */
export function reserveToneVariants(selected: ColorCluster[], rest: ColorCluster[]): void {
  const added = new Set<ColorCluster>();

  for (const candidate of rest) {
    if (added.size === RESERVED_TONE_SLOTS) {
      break;
    }

    if (chroma(candidate.centroid) < CHROMATIC_MIN || !addsTone(candidate, selected)) {
      continue;
    }

    const replaceIndex = selected.findLastIndex(
      (cluster, index) => index > 0 && !added.has(cluster) && isRedundant(cluster, selected),
    );

    if (replaceIndex === -1) {
      break;
    }

    selected.splice(replaceIndex, 1);
    selected.push(candidate);
    added.add(candidate);
  }
}
