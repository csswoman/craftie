import { converter, formatHex } from 'culori';

const toRgb = converter('rgb');

export type ColorFormats = {
  hex: string;
  rgb: string;
  cmyk: string;
};

export function formatColorValues(hex: string): ColorFormats {
  const normalized = formatHex(hex) ?? hex;
  const rgbColor = toRgb(normalized);

  if (!rgbColor || rgbColor.mode !== 'rgb') {
    return { hex: normalized, rgb: '—', cmyk: '—' };
  }

  const r = Math.round((rgbColor.r ?? 0) * 255);
  const g = Math.round((rgbColor.g ?? 0) * 255);
  const b = Math.round((rgbColor.b ?? 0) * 255);

  const cmyk = rgbToCmyk(r, g, b);

  return {
    hex: normalized.toUpperCase(),
    rgb: `${r}, ${g}, ${b}`,
    cmyk: `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`,
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);

  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = Math.round(((1 - rn - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gn - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bn - k) / (1 - k)) * 100);

  return { c, m, y, k: Math.round(k * 100) };
}
