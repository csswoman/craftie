import { converter, formatHex } from 'culori';

export const toOklch = converter('oklch');

export function oklchToHex(lightness: number, chroma: number, hue: number): string {
  const converted = toOklch({ mode: 'oklch', l: lightness, c: chroma, h: hue });

  if (!converted || converted.mode !== 'oklch') {
    return '#000000';
  }

  return formatHex(converted) ?? '#000000';
}

export function deriveChromatic(seedHex: string, hueOffset: number): string {
  const seed = toOklch(seedHex);

  if (!seed || seed.mode !== 'oklch') {
    return seedHex;
  }

  const hue = ((seed.h ?? 0) + hueOffset) % 360;
  const chroma = Math.max(seed.c ?? 0.1, 0.08);
  const lightness = Math.min(Math.max(seed.l ?? 0.55, 0.45), 0.72);

  return oklchToHex(lightness, chroma, hue);
}

/** Shortest angular distance between two hues on a 360° circle. */
export function hueDistance(left: number, right: number): number {
  const diff = Math.abs(left - right) % 360;
  return diff > 180 ? 360 - diff : diff;
}
