/** Minimum chroma (OKLCH) to treat a color as having a meaningful hue. */
export const CHROMA_MIN = 0.04;

/** Hue deviation from group mean that marks an outlier (degrees). */
export const HUE_OUTLIER_THRESHOLD = 60;

/** Lightness deviation from group mean that marks an outlier (OKLCH L, 0-1). */
export const LIGHTNESS_OUTLIER_THRESHOLD = 0.18;

/** Chroma deviation from group mean that marks an outlier (OKLCH C). */
export const CHROMA_OUTLIER_THRESHOLD = 0.08;

/** Max hue spread for a monochromatic palette (degrees). */
export const MONOCHROMATIC_SPREAD = 15;

/** Max hue spread for an analogous palette (degrees). */
export const ANALOGOUS_SPREAD = 30;

/** Cluster membership tolerance when fitting harmony patterns (degrees). */
export const HARMONY_CLUSTER_TOLERANCE = 30;
