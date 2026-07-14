import {
  getRolePaletteContrastWarnings,
} from './rolePaletteContrast';
import {
  validateRolePalette,
  type RolePalette,
} from './rolePalette';
import type { ColorGroupId } from './selectableColors';

export function formatGroupSelectionLabel(group: ColorGroupId, count: number): string {
  const word = count === 1 ? 'seleccionado' : 'seleccionados';
  return `${count} ${word}`;
}

export type SelectionPanelStatus = {
  ready: boolean;
  message: string;
  suggestions: string[];
};

export function getRolePalettePanelStatus(palette: RolePalette | null): SelectionPanelStatus {
  if (!palette) {
    return {
      ready: false,
      message: 'Sube una imagen o elige un estilo para armar tu paleta.',
      suggestions: [],
    };
  }

  const validation = validateRolePalette(palette);

  if (!validation.ok) {
    return { ready: false, message: validation.error, suggestions: [] };
  }

  const derivedCount = Object.values(palette).filter((slot) => slot.source === 'derived').length;
  const contrastWarnings = getRolePaletteContrastWarnings(palette);
  const suggestions = [
    ...(derivedCount > 0
      ? ['Algunos roles usan colores derivados. Puedes cambiarlos desde Colores fuente.']
      : []),
    ...contrastWarnings,
  ];

  return {
    ready: true,
    message:
      contrastWarnings.length > 0
        ? 'Revisa el contraste de texto sobre fondo y superficie.'
        : derivedCount > 0
          ? 'Colores fuente listos. Revisa los roles en el lienzo.'
          : 'Lista para crear la guía de marca.',
    suggestions,
  };
}

export function formatExtractedColorCount(count: number): string {
  return `${count} color${count === 1 ? '' : 'es'} extraído${count === 1 ? '' : 's'}`;
}
