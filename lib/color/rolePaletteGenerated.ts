import { finalizePalette, type GeneratedPalette } from './formulas';
import type { RolePalette } from './roleTypes';

export function validateRolePalette(palette: RolePalette | null): { ok: true } | { ok: false; error: string } {
  if (!palette) {
    return { ok: false, error: 'Sube una imagen o elige inspiración para armar tu paleta.' };
  }

  return { ok: true };
}

export function rolePaletteToGeneratedPalette(palette: RolePalette): GeneratedPalette {
  return {
    primary: palette.primario.hex,
    accent: palette.acento.hex,
    surface: palette.fondo.hex,
    onSurface: palette.texto.hex,
    neutralLight: palette.superficie.hex,
    neutralDark: palette.borde.hex,
  };
}

export function generatePaletteFromRolePalette(palette: RolePalette): GeneratedPalette {
  const base = rolePaletteToGeneratedPalette(palette);

  return finalizePalette(base, palette.primario.hex, {
    skipGeneratedAccent: palette.acento.source === 'extracted',
  });
}
