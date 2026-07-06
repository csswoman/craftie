import { normalizeHex } from '../color/normalizeHex';
import type { PaletteSeeds } from '../color/rolePalette';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type PaletteRoleId,
  type RolePalette,
} from '../color/rolePalette';
import {
  EMPTY_THEMES,
  resolveThemePalette,
  type ThemesConfig,
} from '../color/themePalette';

export function roleTokenName(role: PaletteRoleId): string {
  return `--color-${role}`;
}

function cssLinesForPalette(rolePalette: RolePalette): string[] {
  return PALETTE_ROLE_ORDER.map((role) => {
    const hex = normalizeHex(rolePalette[role].hex).toUpperCase();

    return `  ${roleTokenName(role)}: ${hex};`;
  });
}

export function rolePaletteToCssCustomProperties(
  rolePalette: RolePalette,
  selector = ':root',
): string {
  return `${selector} {\n${cssLinesForPalette(rolePalette).join('\n')}\n}`;
}

export function themePalettesToCssCustomProperties(
  seeds: PaletteSeeds,
  themes: ThemesConfig = EMPTY_THEMES,
): string {
  const light = resolveThemePalette(seeds, 'light', themes, []);
  const dark = resolveThemePalette(seeds, 'dark', themes, []);

  if (!light || !dark) {
    return '';
  }

  return [
    rolePaletteToCssCustomProperties(light, ':root'),
    rolePaletteToCssCustomProperties(dark, '[data-theme="dark"]'),
  ].join('\n\n');
}

export function rolePaletteToTokenRecord(
  rolePalette: RolePalette,
): Record<PaletteRoleId, string> {
  return Object.fromEntries(
    PALETTE_ROLE_ORDER.map((role) => [role, normalizeHex(rolePalette[role].hex).toUpperCase()]),
  ) as Record<PaletteRoleId, string>;
}

export function themePalettesToTokenRecords(
  seeds: PaletteSeeds,
  themes: ThemesConfig = EMPTY_THEMES,
): { light: Record<PaletteRoleId, string>; dark: Record<PaletteRoleId, string> } {
  const light = resolveThemePalette(seeds, 'light', themes, [])!;
  const dark = resolveThemePalette(seeds, 'dark', themes, [])!;

  return {
    light: rolePaletteToTokenRecord(light),
    dark: rolePaletteToTokenRecord(dark),
  };
}

export const ROLE_TOKEN_USAGE: Record<PaletteRoleId, string> = {
  fondo: 'Fondo principal de la aplicación.',
  superficie: 'Tarjetas, paneles y capas elevadas.',
  texto: 'Texto principal sobre fondo y superficie.',
  primario: 'Acciones principales y énfasis de marca.',
  secundario: 'Badges, secciones de apoyo y acentos secundarios de marca.',
  acento: 'Destacados, enlaces y llamadas de atención.',
  borde: 'Bordes, divisores y contornos sutiles.',
};

export function formatRoleLabel(role: PaletteRoleId): string {
  return ROLE_LABELS[role];
}

function yamlThemeColors(tokens: Record<PaletteRoleId, string>): string {
  return PALETTE_ROLE_ORDER.map((role) => `    ${role}: "${tokens[role]}"`).join('\n');
}

export function themeTokensToYaml(seeds: PaletteSeeds, themes: ThemesConfig = EMPTY_THEMES): string {
  const { light, dark } = themePalettesToTokenRecords(seeds, themes);

  return `  light:\n${yamlThemeColors(light)}\n  dark:\n${yamlThemeColors(dark)}`;
}
