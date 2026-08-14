import type { RolePalette, RoleSlot } from './roleTypes';
import type { SemanticTokens } from './semanticTokens';

export type UsageIntent =
  | 'action'
  | 'active-state'
  | 'positive-trend'
  | 'data-visualization';

export type UsageColor = {
  fill: RoleSlot;
  text: RoleSlot;
  textSafe: boolean;
};

const INTENT_TO_ROLE = {
  action: 'primario',
  'active-state': 'primario',
  'positive-trend': 'acento',
  'data-visualization': 'secundario',
} as const;

/**
 * Keeps components choosing colors by usage intent and prevents unsafe
 * expressive colors from being used as text.
 *
 * Future: optional `against?: 'surface' | 'background'` for floating badges.
 */
export function getColorForUsage(
  palette: RolePalette,
  tokens: SemanticTokens,
  intent: UsageIntent,
): UsageColor {
  const fill = palette[INTENT_TO_ROLE[intent]];
  const textSafe = fill.textSafe === true;

  if (intent === 'action') {
    if (textSafe) {
      return { fill, text: fill, textSafe };
    }

    const text: RoleSlot = {
      role: 'texto',
      hex: tokens['primary-900'].hex,
      name: fill.name,
      source: 'derived',
    };
    return { fill, text, textSafe };
  }

  return { fill, text: palette.texto, textSafe };
}
