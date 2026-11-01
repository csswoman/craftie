import { converter, formatHex } from 'culori';

export type ColorVisionDeficiency = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

/** View modes offered in the UI; `none` leaves colors untouched. */
export type ColorVisionMode = 'none' | ColorVisionDeficiency;

export const COLOR_VISION_MODES: readonly ColorVisionMode[] = [
  'none',
  'protanopia',
  'deuteranopia',
  'tritanopia',
  'achromatopsia',
];

const toRgb = converter('rgb');
const toOklab = converter('oklab');

const MATRICES: Record<ColorVisionDeficiency, readonly [number, number, number][]> = {
  protanopia: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deuteranopia: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  // Machado et al. (2009), severity 1.0.
  tritanopia: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
  // Rec. 709 luma weights on every channel.
  achromatopsia: [
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
    [0.2126, 0.7152, 0.0722],
  ],
};

/** Row-major 5x4 matrix string for an SVG `feColorMatrix` (sRGB, alpha untouched). */
export function colorVisionFilterMatrix(mode: ColorVisionMode): string | null {
  if (mode === 'none') {
    return null;
  }
  const rows = MATRICES[mode].map((row) => `${row.join(' ')} 0 0`);
  return `${rows.join(' ')} 0 0 0 1 0`;
}

export function simulateColorVision(hex: string, deficiency: ColorVisionDeficiency): string {
  const rgb = toRgb(hex);

  if (!rgb) {
    return hex;
  }

  const matrix = MATRICES[deficiency];
  const channels = [rgb.r, rgb.g, rgb.b] as const;
  const transformed = matrix.map((row) =>
    Math.min(1, Math.max(0, row.reduce((sum, coefficient, index) => sum + coefficient * channels[index]!, 0))),
  );

  return formatHex({ mode: 'rgb', r: transformed[0]!, g: transformed[1]!, b: transformed[2]! }) ?? hex;
}

function oklabDistance(leftHex: string, rightHex: string): number {
  const left = toOklab(leftHex);
  const right = toOklab(rightHex);

  if (!left || !right) {
    return 0;
  }

  return Math.hypot(
    (left.l ?? 0) - (right.l ?? 0),
    (left.a ?? 0) - (right.a ?? 0),
    (left.b ?? 0) - (right.b ?? 0),
  );
}

export function remainsDistinctWithColorVisionDeficiency(leftHex: string, rightHex: string): boolean {
  return (['protanopia', 'deuteranopia'] as const).every((deficiency) =>
    oklabDistance(
      simulateColorVision(leftHex, deficiency),
      simulateColorVision(rightHex, deficiency),
    ) >= 0.045,
  );
}
