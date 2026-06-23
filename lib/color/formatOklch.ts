import { converter } from 'culori';

const toOklch = converter('oklch');

/**
 * Formats a hex color as a compact OKLCH summary for display.
 */
export function summarizeOklch(hex: string): string {
  const color = toOklch(hex);

  if (!color || color.mode !== 'oklch') {
    return '—';
  }

  const l = color.l.toFixed(2);
  const c = color.c.toFixed(3);
  const h = color.h === undefined ? '—' : `${color.h.toFixed(0)}°`;

  return `L ${l} · C ${c} · H ${h}`;
}
