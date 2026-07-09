import type { FontPair } from './pairings';

export const DEFAULT_FONT_PAIR: FontPair = {
  id: 'craftie-default-lora-nunito',
  displayName: 'Craftie base',
  heading: {
    family: 'Lora',
    googleFontsRef: 'https://fonts.google.com/specimen/Lora',
    classification: 'serif',
    contrast: 'medium',
    xHeight: 'medium',
    personality: ['editorial', 'clara'],
    bestFor: 'heading',
  },
  body: {
    family: 'Nunito',
    googleFontsRef: 'https://fonts.google.com/specimen/Nunito',
    classification: 'sans-serif',
    contrast: 'low',
    xHeight: 'high',
    personality: ['legible', 'amable'],
    bestFor: 'body',
  },
  rationale: 'Par base de Craftie: contraste suficiente entre titular editorial y lectura continua.',
  mood: ['clara', 'precisa'],
  character: ['editorial'],
};

export function resolveActiveFontPair(
  selectedPairing: FontPair | null,
  recommendedPairings: FontPair[],
): FontPair {
  return selectedPairing ?? recommendedPairings[0] ?? DEFAULT_FONT_PAIR;
}
