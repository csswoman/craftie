import {
  evaluateContrast,
  getContrastStatus,
  type ContrastStatus,
  type WCAGLevel,
} from './contrast';
import { deriveReadableRoleVariants } from './readableRoles';
import type { PaletteRoleId, RolePalette } from './rolePalette';

export type ActiveRoleContrastInfo = {
  pairLabel: string;
  foregroundHex: string;
  backgroundHex: string;
  ratio: number;
  level: WCAGLevel;
  status: ContrastStatus;
  passesAaa: boolean;
};

function buildContrastInfo(
  foregroundHex: string,
  backgroundHex: string,
  pairLabel: string,
): ActiveRoleContrastInfo {
  const evaluation = evaluateContrast(foregroundHex, backgroundHex);

  return {
    pairLabel,
    foregroundHex,
    backgroundHex,
    ratio: evaluation.ratio,
    level: evaluation.normalText,
    status: getContrastStatus(evaluation, 'AA'),
    passesAaa: evaluation.normalText === 'AAA',
  };
}

/**
 * Returns the most relevant WCAG pair for the active palette role in the inspector.
 */
export function getActiveRoleContrastInfo(
  palette: RolePalette,
  role: PaletteRoleId,
): ActiveRoleContrastInfo {
  const readable = deriveReadableRoleVariants(palette);

  switch (role) {
    case 'texto':
      return buildContrastInfo(palette.texto.hex, palette.fondo.hex, 'Texto sobre fondo');
    case 'fondo':
      return buildContrastInfo(palette.texto.hex, palette.fondo.hex, 'Texto sobre fondo');
    case 'superficie':
      return buildContrastInfo(palette.texto.hex, palette.superficie.hex, 'Texto sobre superficie');
    case 'primario':
      return buildContrastInfo(
        readable.primarioReadable,
        palette.superficie.hex,
        'Texto legible sobre superficie',
      );
    case 'secundario':
      return buildContrastInfo(
        readable.secundarioReadable,
        palette.superficie.hex,
        'Texto legible sobre superficie',
      );
    case 'acento':
      return buildContrastInfo(
        readable.acentoReadableOnFondo,
        palette.fondo.hex,
        'Texto legible sobre fondo',
      );
    case 'borde':
      return buildContrastInfo(palette.borde.hex, palette.superficie.hex, 'Borde sobre superficie');
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}
