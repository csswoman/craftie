import { normalizeHex } from './normalizeHex';
import { deriveOnTokenHexForFill } from './pairedOnToken';
import { getPairedOnTokenForFill } from './semanticTokenTargets';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

export function previewSemanticToken(
  tokens: SemanticTokens,
  tokenName: SemanticTokenName,
  hex: string,
): SemanticTokens {
  const normalized = normalizeHex(hex);
  const next: SemanticTokens = {
    ...tokens,
    [tokenName]: {
      ...tokens[tokenName],
      hex: normalized,
    },
  };

  const pairedOn = getPairedOnTokenForFill(tokenName);

  if (!pairedOn) {
    return next;
  }

  return {
    ...next,
    [pairedOn]: {
      ...tokens[pairedOn],
      hex: deriveOnTokenHexForFill(normalized),
      source: 'derived',
    },
  };
}
