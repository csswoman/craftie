import type { FontPair } from '../pairings';

export const ACCESSIBLE_PAIRS: FontPair[] = [
  {
    id: 'a11y-atkinson-inter',
    displayName: 'Inclusividad',
    heading: {
      family: 'Atkinson Hyperlegible',
      googleFontsRef: 'https://fonts.google.com/specimen/Atkinson+Hyperlegible',
      classification: 'sans-serif',
      contrast: 'medium',
      xHeight: 'high',
      personality: ['accesible', 'clara'],
      bestFor: 'heading',
    },
    body: {
      family: 'Inter',
      googleFontsRef: 'https://fonts.google.com/specimen/Inter',
      classification: 'sans-serif',
      contrast: 'medium',
      xHeight: 'high',
      personality: ['neutral', 'legible'],
      bestFor: 'body',
    },
    rationale: 'Atkinson Hyperlegible con Inter para máxima inclusividad.',
    mood: ['accesible', 'claro'],
    character: ['accessible', 'minimal'],
  },
  {
    id: 'a11y-inter-noto',
    displayName: 'Productos globales',
    heading: {
      family: 'Inter',
      googleFontsRef: 'https://fonts.google.com/specimen/Inter',
      classification: 'sans-serif',
      contrast: 'medium',
      xHeight: 'high',
      personality: ['neutral', 'legible'],
      bestFor: 'heading',
    },
    body: {
      family: 'Noto Sans',
      googleFontsRef: 'https://fonts.google.com/specimen/Noto+Sans',
      classification: 'sans-serif',
      contrast: 'medium',
      xHeight: 'high',
      personality: ['global', 'neutral'],
      bestFor: 'body',
    },
    rationale: 'Inter y Noto Sans para productos multilenguaje.',
    mood: ['accesible', 'técnico'],
    character: ['accessible', 'technical'],
  },
];
