import { normalizeHex } from './normalizeHex';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

export function previewSemanticToken(
  tokens: SemanticTokens,
  tokenName: SemanticTokenName,
  hex: string,
): SemanticTokens {
  return {
    ...tokens,
    [tokenName]: {
      ...tokens[tokenName],
      hex: normalizeHex(hex),
    },
  };
}
