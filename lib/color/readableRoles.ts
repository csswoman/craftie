import { readableOn } from '../utils/colorMath';
import type { RolePalette } from './rolePalette';

export type BrandHueRole = 'primario' | 'secundario' | 'acento';

export type ReadableRoleVariants = {
  primarioReadable: string;
  secundarioReadable: string;
  acentoReadableOnFondo: string;
  acentoReadableOnSuperficie: string;
};

const AA_TARGET = 4.5;

/** Readable foreground per brand hue against the surfaces they paint on in the UI. */
export function deriveReadableRoleVariants(palette: RolePalette): ReadableRoleVariants {
  const superficie = palette.superficie.hex;
  const fondo = palette.fondo.hex;

  return {
    primarioReadable: readableOn(palette.primario.hex, superficie, AA_TARGET),
    secundarioReadable: readableOn(palette.secundario.hex, superficie, AA_TARGET),
    acentoReadableOnFondo: readableOn(palette.acento.hex, fondo, AA_TARGET),
    acentoReadableOnSuperficie: readableOn(palette.acento.hex, superficie, AA_TARGET),
  };
}

export function readableForegroundForRole(
  palette: RolePalette,
  role: BrandHueRole,
  background: 'fondo' | 'superficie',
): string {
  const variants = deriveReadableRoleVariants(palette);

  if (role === 'acento') {
    return background === 'fondo' ? variants.acentoReadableOnFondo : variants.acentoReadableOnSuperficie;
  }

  return role === 'primario' ? variants.primarioReadable : variants.secundarioReadable;
}
