import { describe, expect, it } from 'vitest';

import {
  TYPE_SCALE_RATIO_OPTIONS,
  buildTypeScaleLevels,
  buildTypeScaleReadout,
  typeScaleSize,
} from './typeScale';

describe('typeScaleSize', () => {
  it('computes major third steps for default 16 / 1.25', () => {
    expect(typeScaleSize(16, 1.25, 3)).toBe(31);
    expect(typeScaleSize(16, 1.25, 2)).toBe(25);
    expect(typeScaleSize(16, 1.25, 1)).toBe(20);
    expect(typeScaleSize(16, 1.25, 0)).toBe(16);
    expect(typeScaleSize(16, 1.25, -1)).toBe(13);
  });
});

describe('buildTypeScaleReadout', () => {
  it('returns the five product tokens for defaults', () => {
    expect(buildTypeScaleReadout(16, 1.25)).toEqual({
      h1: 31,
      h2: 25,
      h3: 20,
      body: 16,
      small: 13,
    });
  });
});

describe('TYPE_SCALE_RATIO_OPTIONS', () => {
  it('uses human-readable modular-scale names', () => {
    expect(TYPE_SCALE_RATIO_OPTIONS.map((option) => option.label)).toEqual([
      'Menor',
      'Mayor',
      'Cuarta',
    ]);
  });
});

describe('buildTypeScaleLevels usage copy', () => {
  it('explains when to use each core level', () => {
    const byId = Object.fromEntries(
      buildTypeScaleLevels(16, 1.25).map((level) => [level.id, level.usage]),
    );

    expect(byId).toMatchObject({
      display: 'Heroes y portadas',
      h1: 'Título de página',
      h2: 'Títulos de sección',
      h3: 'Subtítulos de bloque',
      h4: 'Títulos de tarjeta',
      h5: 'Etiquetas de grupo',
      h6: 'Rótulos compactos',
      lead: 'Apertura de artículo',
      body: 'Párrafos y lectura',
      small: 'Notas y metadatos',
    });
  });

  it('covers extra display and micro steps', () => {
    const levels = buildTypeScaleLevels(16, 1.25, 1, 1);

    expect(levels[0]).toMatchObject({
      id: 'display-2',
      usage: 'Titulares de máximo impacto',
    });
    expect(levels.at(-1)).toMatchObject({
      id: 'micro-1',
      usage: 'Captions y legal',
    });
  });
});
