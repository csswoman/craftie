import { contrastRatio, hexToOklchChannels } from '../utils/colorMath';

import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

export type ActionFillTokens = {
  fill: SemanticTokenName;
  on: SemanticTokenName;
};

const ACTION_CANDIDATES: ActionFillTokens[] = [
  { fill: 'primary', on: 'on-primary' },
  { fill: 'primary-500', on: 'on-primary-500' },
  { fill: 'primary-600', on: 'on-primary-600' },
];

const FILL_VS_BACKGROUND_MIN = 3;
const FILL_VS_ON_MIN = 4.5;

function scoreActionFill(fillHex: string, onHex: string, backgroundHex: string): number {
  const vsOn = contrastRatio(onHex, fillHex);
  const vsBackground = contrastRatio(fillHex, backgroundHex);

  if (vsOn < FILL_VS_ON_MIN || vsBackground < FILL_VS_BACKGROUND_MIN) {
    return -1;
  }

  const fill = hexToOklchChannels(fillHex);
  const background = hexToOklchChannels(backgroundHex);
  const targetLightness = background.l < 0.5 ? 0.52 : 0.45;
  const lightnessFit = 1 - Math.min(Math.abs(fill.l - targetLightness) / 0.4, 1);

  return fill.c * 8 + lightnessFit * 3 + Math.min(vsBackground, 8) * 0.15;
}

/**
 * CTAs should use a fill-ready primary step, not a pastel extracted swatch.
 * `primary-500` / `primary-600` already exist for this; source `primary` wins
 * only when it scores as well as those action steps.
 */
export function pickActionFillTokens(tokens: SemanticTokens): ActionFillTokens {
  const backgroundHex = tokens.background.hex;
  let best = ACTION_CANDIDATES[0]!;
  let bestScore = -1;

  for (const candidate of ACTION_CANDIDATES) {
    const score = scoreActionFill(tokens[candidate.fill].hex, tokens[candidate.on].hex, backgroundHex);

    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}
