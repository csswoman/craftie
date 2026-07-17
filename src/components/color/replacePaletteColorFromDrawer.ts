import { accentFamilyPrimaryToken } from '@lib/color/accentFamily';
import { normalizeHex } from '@lib/color/normalizeHex';
import { isPaletteRoleId, type PaletteRoleId } from '@lib/color/rolePalette';
import type { SemanticTokenName } from '@lib/color/semanticTokens';

export function replacePaletteColorFromDrawer({
  newHex,
  selectedColorHex,
  selectedAccentSlot,
  columns,
  lockedSet,
  replaceRole,
  replaceSemanticToken,
  setSelectedColorHex,
}: {
  newHex: string;
  selectedColorHex: string | null;
  selectedAccentSlot: number | null;
  columns: Array<{ id: string; hex: string }>;
  lockedSet: Set<PaletteRoleId>;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  replaceSemanticToken: (token: SemanticTokenName, hex: string) => void;
  setSelectedColorHex: (hex: string) => void;
}): string | null {
  if (!selectedColorHex) {
    return 'No se puede sustituir este color.';
  }

  let normalized: string;

  try {
    normalized = normalizeHex(newHex);
  } catch {
    return 'Introduce un código HEX válido.';
  }

  if (normalizeHex(selectedColorHex) === normalized) {
    return null;
  }

  if (selectedAccentSlot !== null) {
    replaceSemanticToken(accentFamilyPrimaryToken(selectedAccentSlot), normalized);
    setSelectedColorHex(normalized);
    return null;
  }

  const role = columns.find((column) => {
    try {
      return normalizeHex(column.hex) === normalizeHex(selectedColorHex);
    } catch {
      return false;
    }
  })?.id;

  if (!role || !isPaletteRoleId(role)) {
    return 'No se puede sustituir este color.';
  }

  if (lockedSet.has(role)) {
    return 'Desbloquea el color para sustituirlo.';
  }

  replaceRole(role, normalized);
  setSelectedColorHex(normalized);
  return null;
}
