import { describe, expect, it } from 'vitest';

import {
  getMobileGreeting,
  getMobileReviewNote,
  MOBILE_CONTAINER_CLASS,
  MOBILE_PALETTES,
  MOBILE_SUMMARY,
  MOBILE_TABS,
} from './mobilePreviewData';

describe('Craftie mobile preview content', () => {
  it('scopes responsive sizing to its own container', () => {
    expect(MOBILE_CONTAINER_CLASS).toContain('@container/mobile');
  });

  it('models a Craftie palette companion, not a generic app', () => {
    expect(MOBILE_TABS.map((tab) => tab.label)).toEqual(['Hoy', 'Paletas', 'Ajustes']);
    expect(MOBILE_PALETTES.map((palette) => palette.name)).toEqual([
      'Terracota en seco',
      'Salvia tranquila',
      'Ocre de taller',
    ]);
    expect(MOBILE_SUMMARY.map((item) => item.label)).toEqual(['Guardadas', 'Contraste AA']);
  });

  it('exercises several data slots across palette swatches', () => {
    const usedSlots = new Set(MOBILE_PALETTES.flatMap((palette) => palette.swatches));

    expect(usedSlots.size).toBeGreaterThanOrEqual(5);
  });

  it('phrases the review note by how many items remain', () => {
    expect(getMobileReviewNote(0)).toBe('Todo revisado');
    expect(getMobileReviewNote(1)).toBe('1 ajuste pendiente');
    expect(getMobileReviewNote(3)).toBe('3 ajustes pendientes');
  });

  it('greets by time of day', () => {
    expect(getMobileGreeting(3)).toBe('Buenas noches');
    expect(getMobileGreeting(9)).toBe('Buenos días');
    expect(getMobileGreeting(15)).toBe('Buenas tardes');
    expect(getMobileGreeting(22)).toBe('Buenas noches');
  });
});
