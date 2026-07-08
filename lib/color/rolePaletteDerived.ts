import {
  deriveFondo,
  deriveNeutralRoles,
  deriveSecondary,
} from '../utils/deriveRoles';
import { adjustLightnessForContrast } from '../utils/colorMath';
import {
  fitsBorderOn,
  fitsSurfaceOn,
  passesTextOn,
} from './roleSourceAssignment';
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

const TEXT_AA_RATIO = 4.5;

type RoleResolution = { hex: string; source: ColorSource };

function isSourceBacked(source: ColorSource): boolean {
  return source === 'extracted' || source === 'corrected';
}

function resolveSuperficie(
  palette: RolePalette,
  locked: boolean,
  fondoHex: string,
  derivedHex: string,
): RoleResolution {
  const slot = palette.superficie;

  if (locked) {
    return { hex: slot.hex, source: slot.source };
  }

  if (isSourceBacked(slot.source) && fitsSurfaceOn(slot.hex, fondoHex)) {
    return { hex: slot.hex, source: slot.source };
  }

  return { hex: derivedHex, source: 'derived' };
}

function resolveTexto(
  palette: RolePalette,
  locked: boolean,
  fondoHex: string,
  superficieHex: string,
  derivedHex: string,
): RoleResolution {
  const slot = palette.texto;

  if (locked) {
    return { hex: slot.hex, source: slot.source };
  }

  if (isSourceBacked(slot.source)) {
    if (passesTextOn(slot.hex, fondoHex, superficieHex)) {
      return { hex: slot.hex, source: slot.source };
    }

    const onFondo = adjustLightnessForContrast(slot.hex, fondoHex, TEXT_AA_RATIO);
    const corrected = adjustLightnessForContrast(onFondo, superficieHex, TEXT_AA_RATIO);

    if (passesTextOn(corrected, fondoHex, superficieHex)) {
      return { hex: corrected, source: 'corrected' };
    }
  }

  return { hex: derivedHex, source: 'derived' };
}

function resolveBorde(
  palette: RolePalette,
  locked: boolean,
  superficieHex: string,
  derivedHex: string,
): RoleResolution {
  const slot = palette.borde;

  if (locked) {
    return { hex: slot.hex, source: slot.source };
  }

  if (isSourceBacked(slot.source) && fitsBorderOn(slot.hex, superficieHex)) {
    return { hex: slot.hex, source: slot.source };
  }

  return { hex: derivedHex, source: 'derived' };
}

/**
 * Recomputes derived roles from fondo + primario. Roles backed by source colors
 * (extracted or corrected) are preserved while they still satisfy their
 * constraints; locked roles are never touched.
 */
export function recomputeDerivedRoles(
  palette: RolePalette,
  lockedRoles: PaletteRoleId[] = [],
  seeds?: PaletteNeutralSeed,
  theme: 'light' | 'dark' = 'light',
): RolePalette {
  const locked = new Set<PaletteRoleId>(lockedRoles);
  const keepFondo =
    locked.has('fondo') || (isSourceBacked(palette.fondo.source) && !seeds);
  const fondoHex =
    seeds && !locked.has('fondo')
      ? deriveFondo(seeds.neutralHue, theme)
      : palette.fondo.hex;
  const neutrals = deriveNeutralRoles(fondoHex, palette.primario.hex, theme);

  const superficie = resolveSuperficie(
    palette,
    locked.has('superficie'),
    fondoHex,
    neutrals.superficie,
  );
  const texto = resolveTexto(
    palette,
    locked.has('texto'),
    fondoHex,
    superficie.hex,
    neutrals.texto,
  );
  const borde = resolveBorde(palette, locked.has('borde'), superficie.hex, neutrals.borde);

  const keepSecundario =
    locked.has('secundario') || isSourceBacked(palette.secundario.source);
  const resolutions: Record<PaletteRoleId, RoleResolution> = {
    fondo: {
      hex: fondoHex,
      source: keepFondo ? palette.fondo.source : 'derived',
    },
    primario: { hex: palette.primario.hex, source: palette.primario.source },
    acento: { hex: palette.acento.hex, source: palette.acento.source },
    secundario: keepSecundario
      ? { hex: palette.secundario.hex, source: palette.secundario.source }
      : { hex: deriveSecondary(palette.primario.hex), source: 'derived' },
    texto,
    superficie,
    borde,
  };

  const paletteInput = buildPaletteInput(
    Object.fromEntries(
      Object.entries(resolutions).map(([role, entry]) => [role, entry.hex]),
    ) as Partial<Record<PaletteRoleId, string>>,
  );
  const next = { ...palette };

  if (!locked.has('fondo')) {
    next.fondo = createRoleSlot(
      'fondo',
      resolutions.fondo.hex,
      resolutions.fondo.source,
      paletteInput,
    );
  }

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    const resolution = resolutions[role];
    const source: ColorSource = locked.has(role) ? palette[role].source : resolution.source;
    next[role] = createRoleSlot(role, resolution.hex, source, paletteInput);
  }

  return applyUniqueRoleNames(next);
}
