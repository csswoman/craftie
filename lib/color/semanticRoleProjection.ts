import { namePalette } from './naming';
import { normalizeHex } from './normalizeHex';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
  type RoleSlot,
} from './roleTypes';
import type {
  SemanticTokenName,
  SemanticTokenSource,
  SemanticTokens,
} from './semanticTokens';

const ROLE_TO_TOKEN: Record<PaletteRoleId, SemanticTokenName> = {
  fondo: 'background',
  superficie: 'surface',
  texto: 'on-background',
  primario: 'primary',
  secundario: 'secondary',
  acento: 'accent',
  borde: 'border',
};

function projectSource(source: SemanticTokenSource): ColorSource {
  return source === 'override' ? 'extracted' : source;
}

export function tokenNameForPaletteRole(role: PaletteRoleId): SemanticTokenName {
  return ROLE_TO_TOKEN[role];
}

export function projectSemanticTokensToRolePalette(
  tokens: SemanticTokens,
  names?: Partial<Record<PaletteRoleId, string>>,
): RolePalette {
  const paletteInput = PALETTE_ROLE_ORDER.map((role) => ({
    hex: tokens[ROLE_TO_TOKEN[role]].hex,
  }));
  const generatedNames = namePalette(paletteInput, { style: 'creative' });
  const palette = {} as RolePalette;

  for (const role of PALETTE_ROLE_ORDER) {
    const semantic = tokens[ROLE_TO_TOKEN[role]];
    const normalized = normalizeHex(semantic.hex);
    const slot: RoleSlot = {
      role,
      hex: normalized,
      name: names?.[role] ?? generatedNames.get(normalized) ?? ROLE_LABELS[role],
      source: projectSource(semantic.source),
    };

    palette[role] = slot;
  }

  return palette;
}

export function rolePaletteToSemanticOverrides(
  palette: RolePalette,
): Partial<Record<SemanticTokenName, string>> {
  return Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [ROLE_TO_TOKEN[role], palette[role].hex]),
  ) as Partial<Record<SemanticTokenName, string>>;
}
