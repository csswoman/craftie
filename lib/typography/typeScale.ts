export type TypeScaleBase = 14 | 16 | 18;
export type TypeScaleRatio = 1.125 | 1.25 | 1.333;

export const TYPE_SCALE_BASES: readonly TypeScaleBase[] = [14, 16, 18];
export const TYPE_SCALE_RATIOS: readonly TypeScaleRatio[] = [1.125, 1.25, 1.333];

/** Human-readable modular-scale names (product copy). */
export const TYPE_SCALE_RATIO_OPTIONS: readonly {
  value: TypeScaleRatio;
  label: string;
}[] = [
  { value: 1.125, label: 'Menor' },
  { value: 1.25, label: 'Mayor' },
  { value: 1.333, label: 'Cuarta' },
];

export const DEFAULT_TYPE_SCALE_BASE: TypeScaleBase = 16;
export const DEFAULT_TYPE_SCALE_RATIO: TypeScaleRatio = 1.25;

export type TypeScaleReadout = {
  h1: number;
  h2: number;
  h3: number;
  body: number;
  small: number;
};

/** size(n) = round(base * ratio^n) */
export function typeScaleSize(base: number, ratio: number, step: number): number {
  return Math.round(base * ratio ** step);
}

export function buildTypeScaleReadout(base: number, ratio: number): TypeScaleReadout {
  return {
    h1: typeScaleSize(base, ratio, 3),
    h2: typeScaleSize(base, ratio, 2),
    h3: typeScaleSize(base, ratio, 1),
    body: typeScaleSize(base, ratio, 0),
    small: typeScaleSize(base, ratio, -1),
  };
}
