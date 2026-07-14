import { converter } from 'culori';

import type { SemanticToken, SemanticTokenName, SemanticTokens } from './semanticTokens';

export const EXPRESSIVE_TOKEN_NAMES = ['primary', 'secondary', 'accent'] as const satisfies readonly SemanticTokenName[];
const toOklch = converter('oklch');
const AUTO_EXPRESSIVE_CHROMA_MIN = 0.055;

function isAssigned(token: SemanticToken): boolean {
  if (token.source === 'override') return true;
  return token.source === 'extracted' && (toOklch(token.hex)?.c ?? 0) >= AUTO_EXPRESSIVE_CHROMA_MIN;
}

function gapToken(hex: string, message: string): SemanticToken {
  return { hex, source: 'derived', gap: message };
}

/**
 * UI consumption guard: auto-derived expressive colors are exposed as honest
 * gaps. Their fallback hex keeps previews stable but is never presented as an
 * assigned candidate.
 */
export function resolveUiExpressiveGaps(tokens: SemanticTokens): SemanticTokens {
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
  const accentAssigned = isAssigned(tokens.accent);
  const accent = accentAssigned
    ? tokens.accent
    : gapToken(primary.hex, 'La imagen no ofrece un candidato fuente con suficiente carácter para acento.');

  return {
    ...tokens,
    primary,
    secondary,
    accent,
    'on-primary': primaryAssigned ? tokens['on-primary'] : tokens.background,
    'on-secondary': secondaryAssigned ? tokens['on-secondary'] : tokens['on-primary'],
    'on-accent': accentAssigned ? tokens['on-accent'] : tokens['on-primary'],
  };
}
