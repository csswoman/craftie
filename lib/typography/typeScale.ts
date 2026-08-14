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

export type TypeScaleLevel = {
  id: string;
  label: string;
  computedSize: number;
  role: 'heading' | 'body';
  token: string;
  usage: string;
};

const EXTRA_DISPLAY_USAGE = 'Titulares de máximo impacto';
const MICRO_USAGE = 'Captions y legal';

const FULL_SCALE_ROWS = [
  { id: 'display', label: 'Display', step: 5, role: 'heading', token: '--type-display', usage: 'Heroes y portadas' },
  { id: 'h1', label: 'H1', step: 4, role: 'heading', token: '--type-h1', usage: 'Título de página' },
  { id: 'h2', label: 'H2', step: 3, role: 'heading', token: '--type-h2', usage: 'Títulos de sección' },
  { id: 'h3', label: 'H3', step: 2, role: 'heading', token: '--type-h3', usage: 'Subtítulos de bloque' },
  { id: 'h4', label: 'H4', step: 1, role: 'heading', token: '--type-h4', usage: 'Títulos de tarjeta' },
  { id: 'h5', label: 'H5', step: 0, role: 'body', token: '--type-h5', usage: 'Etiquetas de grupo' },
  { id: 'h6', label: 'H6', step: -1, role: 'body', token: '--type-h6', usage: 'Rótulos compactos' },
  { id: 'lead', label: 'Lead', step: 1, role: 'body', token: '--type-lead', usage: 'Apertura de artículo' },
  { id: 'body', label: 'Body', step: 0, role: 'body', token: '--type-body', usage: 'Párrafos y lectura' },
  { id: 'small', label: 'Small', step: -1, role: 'body', token: '--type-small', usage: 'Notas y metadatos' },
] as const;

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

export function buildTypeScaleLevels(
  base: number,
  ratio: number,
  largerSteps = 0,
  smallerSteps = 0,
): TypeScaleLevel[] {
  const larger = Array.from({ length: largerSteps }, (_, index) => ({
    id: `display-${index + 2}`,
    label: `Display ${index + 2}`,
    computedSize: typeScaleSize(base, ratio, 6 + index),
    role: 'heading' as const,
    token: `--type-display-${index + 2}`,
    usage: EXTRA_DISPLAY_USAGE,
  })).reverse();
  const core = FULL_SCALE_ROWS.map((row) => ({ ...row, computedSize: typeScaleSize(base, ratio, row.step) }));
  const smaller = Array.from({ length: smallerSteps }, (_, index) => ({
    id: `micro-${index + 1}`,
    label: index === 0 ? 'Micro' : `Micro ${index + 1}`,
    computedSize: typeScaleSize(base, ratio, -2 - index),
    role: 'body' as const,
    token: `--type-micro-${index + 1}`,
    usage: MICRO_USAGE,
  }));

  return [...larger, ...core, ...smaller];
}
