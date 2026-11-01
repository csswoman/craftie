import { isValidOpaqueHex, normalizeHex } from '../color/normalizeHex';
import type { SemanticTokenName, SemanticTokens } from '../color/semanticTokens';
import { TONAL_SCALE_STEPS } from '../color/tonalScale';

/**
 * Semantic tokens exported alongside the seven core roles. They are derived
 * from the palette for each theme, so the dark block and the paired `on-*`
 * colors are complete without the user having to override them by hand.
 * Tokens still marked as a gap (for example unconfirmed status colors) are
 * never exported.
 */
export const EXPORT_DERIVED_TOKEN_NAMES: readonly SemanticTokenName[] = [
  'background',
  'surface',
  'surface-elevated',
  'on-background',
  'on-background-muted',
  'on-surface',
  'on-surface-muted',
  'border',
  'divider',
  'primary',
  'secondary',
  'accent',
  'on-primary',
  'on-secondary',
  'on-accent',
  'success',
  'warning',
  'error',
  'data-1',
  'data-2',
  'data-3',
  'data-4',
  'data-5',
  'data-6',
  // 50–900 ramps for the three expressive colors (primary-500, accent-200…).
  ...(['primary', 'secondary', 'accent'] as const).flatMap((base) =>
    TONAL_SCALE_STEPS.map((step) => `${base}-${step}` as SemanticTokenName),
  ),
];

export type ExportDerivedTokens = Partial<Record<SemanticTokenName, string>>;
export type ExportDerivedTokensByTheme = { light: ExportDerivedTokens; dark: ExportDerivedTokens };

export function pickExportDerivedTokens(tokens: SemanticTokens): ExportDerivedTokens {
  const picked: ExportDerivedTokens = {};
  for (const name of EXPORT_DERIVED_TOKEN_NAMES) {
    const token = tokens[name];
    if (!token || token.gap || !isValidOpaqueHex(token.hex)) continue;
    picked[name] = normalizeHex(token.hex);
  }
  return picked;
}
