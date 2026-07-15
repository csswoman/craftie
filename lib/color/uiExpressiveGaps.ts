import { converter } from 'culori';

import { evaluateColorFitness } from './colorFitness';
import { normalizeHex } from './normalizeHex';
import { deriveForegroundForBackground } from './pairedForeground';
import type { SemanticToken, SemanticTokenName, SemanticTokens } from './semanticTokens';

export const EXPRESSIVE_TOKEN_NAMES = ['primary', 'secondary', 'accent'] as const satisfies readonly SemanticTokenName[];
const toOklch = converter('oklch');
const AUTO_EXPRESSIVE_CHROMA_MIN = 0.055;

function isAssigned(token: SemanticToken): boolean {
  if (token.source === 'override') return true;
  return token.source === 'extracted' && (toOklch(token.hex)?.c ?? 0) >= AUTO_EXPRESSIVE_CHROMA_MIN;
}

function isAccentAssigned(tokens: SemanticTokens): boolean {
  const accent = tokens.accent;
  if (accent.source === 'override') return true;
  if (accent.source === 'derived') return false;
  const fitness = evaluateColorFitness(accent.hex, {
    backgroundHex: tokens.background.hex,
    lightOnColorBaseHex: tokens['surface-elevated'].hex,
    darkTextBaseHex: tokens['on-surface'].hex,
  });
  return fitness.asAccent.ok || fitness.asFill.ok;
}

function bestAccentCandidate(tokens: SemanticTokens, candidates: Array<{ hex: string; prominence?: number }>): SemanticToken | null {
  const ranked = candidates.flatMap((candidate) => {
    const hex = normalizeHex(candidate.hex);
    const fitness = evaluateColorFitness(hex, {
      backgroundHex: tokens.background.hex,
      lightOnColorBaseHex: tokens['surface-elevated'].hex,
      darkTextBaseHex: tokens['on-surface'].hex,
    });
    if (!fitness.asAccent.ok && !fitness.asFill.ok) return [];
    const chroma = toOklch(hex)?.c ?? 0;
    return [{ hex, score: Number(fitness.asAccent.ok) * 2 + Number(fitness.asFill.ok) + chroma + (candidate.prominence ?? 0) * 0.01 }];
  }).sort((left, right) => right.score - left.score);

  return ranked[0] ? { hex: ranked[0].hex, source: 'extracted' } : null;
}

function gapToken(hex: string, message: string): SemanticToken {
  return { hex, source: 'derived', gap: message };
}

/**
 * UI consumption guard: auto-derived expressive colors are exposed as honest
 * gaps. Their fallback hex keeps previews stable but is never presented as an
 * assigned candidate.
 */
export function resolveUiExpressiveGaps(
  tokens: SemanticTokens,
  accentCandidates: Array<{ hex: string; prominence?: number }> = [],
): SemanticTokens {
  const validFallback = EXPRESSIVE_TOKEN_NAMES
    .map((name) => tokens[name])
    .find(isAssigned);
  const primaryAssigned = isAssigned(tokens.primary);
  const primary = primaryAssigned
    ? tokens.primary
    : gapToken(
        validFallback?.hex ?? tokens['on-background'].hex,
        'La imagen no ofrece un candidato fuente con suficiente carácter para primario.',
      );
  const secondaryAssigned = isAssigned(tokens.secondary);
  const secondary = secondaryAssigned
    ? tokens.secondary
    : gapToken(primary.hex, 'La imagen no ofrece un candidato fuente válido para secundario.');
  const automaticAccent = isAccentAssigned(tokens)
    ? tokens.accent
    : bestAccentCandidate(tokens, accentCandidates);
  const accent = automaticAccent
    ? automaticAccent
    : gapToken(primary.hex, 'La imagen no ofrece un candidato fuente con suficiente carácter para acento.');

  return {
    ...tokens,
    primary,
    secondary,
    accent,
    'on-primary': primaryAssigned ? tokens['on-primary'] : tokens.background,
    'on-secondary': secondaryAssigned ? tokens['on-secondary'] : tokens['on-primary'],
    'on-accent': automaticAccent
      ? automaticAccent === tokens.accent
        ? tokens['on-accent']
        : { hex: deriveForegroundForBackground(accent.hex).hex, source: 'derived' }
      : tokens['on-primary'],
  };
}
