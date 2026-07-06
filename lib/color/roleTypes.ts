export type PaletteRoleId =
  | 'fondo'
  | 'superficie'
  | 'texto'
  | 'primario'
  | 'secundario'
  | 'acento'
  | 'borde';

export type ColorSource = 'extracted' | 'derived';

export type RoleSlot = {
  role: PaletteRoleId;
  hex: string;
  name: string;
  source: ColorSource;
};

export type RolePalette = Record<PaletteRoleId, RoleSlot>;

export const PALETTE_ROLE_ORDER: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'primario',
  'secundario',
  'acento',
  'borde',
];

export const ROLE_LABELS: Record<PaletteRoleId, string> = {
  fondo: 'Fondo',
  superficie: 'Superficie',
  texto: 'Texto',
  primario: 'Primario',
  secundario: 'Secundario',
  acento: 'Acento',
  borde: 'Borde',
};

export const SEED_ROLES: PaletteRoleId[] = ['primario', 'acento'];

export const DERIVED_ROLES: PaletteRoleId[] = [
  'fondo',
  'superficie',
  'texto',
  'secundario',
  'borde',
];
