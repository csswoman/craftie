import type { FontPair } from './fontPairTypes';

export type PairSpecimen = {
  heading: string;
  body: string;
};

const DEFAULT_SPECIMEN: PairSpecimen = {
  heading: 'Voz de marca',
  body: 'El cuerpo se mantiene neutro y la paleta lleva la personalidad.',
};

const SPECIMEN_BY_CHARACTER: Record<string, PairSpecimen> = {
  editorial: {
    heading: 'Historia de marca',
    body: 'Un titular con carácter y un cuerpo que deja respirar la página.',
  },
  technical: {
    heading: 'Sistema, no adorno',
    body: 'Interfaz precisa: datos claros, ritmo constante, cero ruido visual.',
  },
  warm: {
    heading: 'Hecho para quedarse',
    body: 'Una voz cercana que acompaña el producto sin quitarle protagonismo al color.',
  },
  minimal: {
    heading: 'Menos, y mejor',
    body: 'Tipografía limpia, espacio suficiente y un solo acento cuando hace falta.',
  },
};

/** Filter-aligned order so mixed pairs pick a stable tone. */
const CHARACTER_PRIORITY = ['editorial', 'technical', 'warm', 'minimal'] as const;

/**
 * Specimen copy varies by pair character so scrolling the catalog
 * communicates tone, while pairs in the same category stay comparable.
 */
export function specimenForPair(pair: Pick<FontPair, 'character'>): PairSpecimen {
  for (const key of CHARACTER_PRIORITY) {
    if (pair.character.includes(key)) {
      return SPECIMEN_BY_CHARACTER[key] ?? DEFAULT_SPECIMEN;
    }
  }

  return DEFAULT_SPECIMEN;
}
