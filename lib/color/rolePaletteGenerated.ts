import { finalizePalette, type GeneratedPalette } from './formulas';
import type { RolePalette } from './roleTypes';
import { tokenNameForPaletteRole } from './semanticRoleProjection';

export function validateRolePalette(palette: RolePalette | null): { ok: true } | { ok: false; error: string } {
  if (!palette) {
    return { ok: false, error: 'Sube una imagen o elige un estilo para armar tu paleta.' };
  }

  return { ok: true };
}

export function rolePaletteToGeneratedPalette(palette: RolePalette): GeneratedPalette {
  const backgroundRole = tokenNameForPaletteRole('fondo') === 'background' ? palette.fondo : palette.fondo;
  const textRole =
    tokenNameForPaletteRole('texto') === 'on-background' ? palette.texto : palette.texto;

  return {
    primary: palette.primario.hex,
    accent: palette.acento.hex,
    surface: backgroundRole.hex,
    onSurface: textRole.hex,
    neutralLight: palette.superficie.hex,
    neutralDark: palette.borde.hex,
  };
}

export function generatePaletteFromRolePalette(palette: RolePalette): GeneratedPalette {
  const base = rolePaletteToGeneratedPalette(palette);

  return finalizePalette(base, palette.primario.hex, {
    skipGeneratedAccent: palette.acento.source !== 'derived',
  });
}
