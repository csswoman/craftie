import {
  deriveFondo,
  deriveNeutralRoles,
  deriveSecondary,
} from '../utils/deriveRoles';
import {
  DERIVED_ROLES,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
} from './roleTypes';
import {
  applyUniqueRoleNames,
  buildPaletteInput,
  createRoleSlot,
} from './rolePaletteSlots';

export type PaletteNeutralSeed = {
  neutralHue: number;
};

export function recomputeDerivedRoles(
  palette: RolePalette,
  lockedRoles: PaletteRoleId[] = [],
  seeds?: PaletteNeutralSeed,
  theme: 'light' | 'dark' = 'light',
): RolePalette {
  const locked = new Set<PaletteRoleId>(lockedRoles);
  const fondoHex =
    seeds && !locked.has('fondo')
      ? deriveFondo(seeds.neutralHue, theme)
      : palette.fondo.hex;
  const neutrals = deriveNeutralRoles(fondoHex, palette.primario.hex, theme);
  const textoHex = locked.has('texto') ? palette.texto.hex : neutrals.texto;

  const slotHex: Partial<Record<PaletteRoleId, string>> = {
    fondo: fondoHex,
    primario: palette.primario.hex,
    acento: palette.acento.hex,
    secundario: locked.has('secundario')
      ? palette.secundario.hex
      : deriveSecondary(palette.primario.hex),
    texto: textoHex,
    superficie: locked.has('superficie') ? palette.superficie.hex : neutrals.superficie,
    borde: locked.has('borde') ? palette.borde.hex : neutrals.borde,
  };

  const paletteInput = buildPaletteInput(slotHex);
  const next = { ...palette };

  if (!locked.has('fondo')) {
    next.fondo = createRoleSlot('fondo', fondoHex, 'derived', paletteInput);
  }

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    const hex = slotHex[role]!;
    const source: ColorSource = locked.has(role) ? palette[role].source : 'derived';
    next[role] = createRoleSlot(role, hex, source, paletteInput);
  }

  return applyUniqueRoleNames(next);
}
