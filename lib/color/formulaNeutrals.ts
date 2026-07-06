import {
  neutralChroma,
  oklchToHex,
  parseSeedOklch,
} from './formulaColorMath';
import type { NeutralScale, NeutralStep } from './paletteTypes';

const NEUTRAL_LIGHTNESS: Record<NeutralStep, number> = {
  veryLight: 0.97,
  light: 0.92,
  medium: 0.62,
  dark: 0.38,
  veryDark: 0.2,
};

const NEUTRAL_STEPS: NeutralStep[] = [
  'veryLight',
  'light',
  'medium',
  'dark',
  'veryDark',
];

export function generateNeutrals(seed: string): NeutralScale {
  const seedOklch = parseSeedOklch(seed);
  const chroma = neutralChroma(seedOklch.c);
  const hue = seedOklch.h;
  const scale = {} as NeutralScale;

  for (const step of NEUTRAL_STEPS) {
    scale[step] = oklchToHex(NEUTRAL_LIGHTNESS[step], chroma, hue);
  }

  return scale;
}
