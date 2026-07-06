export type NeutralStep =
  | 'veryLight'
  | 'light'
  | 'medium'
  | 'dark'
  | 'veryDark';

export interface NeutralScale {
  veryLight: string;
  light: string;
  medium: string;
  dark: string;
  veryDark: string;
}

export interface GeneratedPalette {
  primary: string;
  accent: string;
  surface: string;
  onSurface: string;
  neutralLight: string;
  neutralDark: string;
}

export type PaletteRole = keyof GeneratedPalette;
