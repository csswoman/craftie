import { describe, expect, it } from 'vitest';

import { PALETTE_ROLE_ORDER, type RolePalette, type RoleSlot } from '../color/roleTypes';
import {
  computeShareCardLayout,
  readableTextColor,
  swatchLabelAnchor,
} from './shareCardLayout';

function slot(role: RoleSlot['role'], hex: string, name: string): RoleSlot {
  return { role, hex, name, source: 'extracted' };
}

function palette(): RolePalette {
  const hexes: Record<RoleSlot['role'], string> = {
    fondo: '#FFFFFF',
    superficie: '#F5F5F5',
    texto: '#111111',
    'texto-secundario': '#666666',
    primario: '#1B5E20',
    secundario: '#2E7D32',
    acento: '#F9A825',
    borde: '#DDDDDD',
  };
  return Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [role, slot(role, hexes[role], `Role ${role}`)]),
  ) as RolePalette;
}

describe('computeShareCardLayout', () => {
  it('uses a fixed landscape card and paper/ink from the palette', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });

    expect(layout.width).toBe(1200);
    expect(layout.height).toBe(630);
    expect(layout.background).toBe('#FFFFFF');
    expect(layout.ink).toBe('#111111');
  });

  it('produces one swatch per role in palette order', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });

    expect(layout.swatches).toHaveLength(PALETTE_ROLE_ORDER.length);
    expect(layout.swatches.map((s) => s.role)).toEqual(PALETTE_ROLE_ORDER);
    expect(layout.swatches.map((s) => s.hex)).toEqual([
      '#FFFFFF',
      '#F5F5F5',
      '#111111',
      '#666666',
      '#1B5E20',
      '#2E7D32',
      '#F9A825',
      '#DDDDDD',
    ]);
  });

  it('lays swatches left-to-right as a non-overlapping strip inside the padding', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });
    const [first, second] = layout.swatches;

    expect(first.rect.x).toBe(64);
    expect(second.rect.x).toBeGreaterThan(first.rect.x + first.rect.width);
    const last = layout.swatches[layout.swatches.length - 1];
    expect(last.rect.x + last.rect.width).toBeLessThanOrEqual(1200 - 64 + 0.001);
    for (const swatch of layout.swatches) {
      expect(swatch.rect.width).toBeGreaterThan(0);
      expect(swatch.rect.height).toBeGreaterThan(0);
    }
  });

  it('anchors the title inside the top padding block', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });

    expect(layout.title.text).toBe('Mi paleta');
    expect(layout.title.x).toBe(64);
    expect(layout.title.y).toBeGreaterThan(64);
    expect(layout.title.y).toBeLessThan(layout.swatches[0].rect.y);
  });

  it('omits the pairing anchor when no pairing is given', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });
    expect(layout.pairing).toBeNull();
  });

  it('adds a pairing anchor below the title when a pairing is given', () => {
    const layout = computeShareCardLayout({
      palette: palette(),
      title: 'Mi paleta',
      pairing: { heading: 'Lora', body: 'Nunito' },
    });

    expect(layout.pairing).not.toBeNull();
    expect(layout.pairing?.text).toBe('Lora / Nunito');
    expect(layout.pairing?.y).toBeGreaterThan(layout.title.y);
    expect(layout.pairing?.y).toBeLessThan(layout.swatches[0].rect.y);
  });
});

describe('swatchLabelAnchor', () => {
  it('anchors the label near the bottom-left of the swatch', () => {
    const layout = computeShareCardLayout({ palette: palette(), title: 'Mi paleta' });
    const first = layout.swatches[0];
    const anchor = swatchLabelAnchor(first);

    expect(anchor.text).toBe(first.label);
    expect(anchor.x).toBeGreaterThanOrEqual(first.rect.x);
    expect(anchor.y).toBeLessThanOrEqual(first.rect.y + first.rect.height);
    expect(anchor.y).toBeGreaterThan(first.rect.y);
  });
});

describe('readableTextColor', () => {
  it('returns dark ink on light fills', () => {
    expect(readableTextColor('#FFFFFF')).toBe('#111111');
    expect(readableTextColor('#F9A825')).toBe('#111111');
  });

  it('returns white on dark fills', () => {
    expect(readableTextColor('#111111')).toBe('#FFFFFF');
    expect(readableTextColor('#1B5E20')).toBe('#FFFFFF');
  });

  it('falls back to dark ink on invalid hex', () => {
    expect(readableTextColor('not-a-color')).toBe('#111111');
  });
});
