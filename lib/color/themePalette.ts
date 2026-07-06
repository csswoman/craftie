import { converter } from 'culori';

import { adjustLightnessForContrast, contrastRatio } from '../utils/colorMath';
import { deriveFondo } from '../utils/deriveRoles';
import { normalizeHex } from './normalizeHex';
import {
  buildBasePalette,
  buildPaletteFromSeeds,
  finalizeRolePalette,
  PALETTE_ROLE_ORDER,
  recomputeDerivedRoles,
  type PaletteRoleId,
  type PaletteSeeds,
  type RolePalette,
} from './rolePalette';

export type ThemeId = 'light' | 'dark';

export type ThemeOverrides = Partial<Record<PaletteRoleId, string>>;

export type ThemeConfig = {
  overrides: ThemeOverrides;
  names?: Partial<Record<PaletteRoleId, string>>;
};

export type ThemesConfig = Record<ThemeId, ThemeConfig>;

export const EMPTY_THEMES: ThemesConfig = {
  light: { overrides: {} },
  dark: { overrides: {} },
};

const AA_TARGET = 4.5;

const toOklch = converter('oklch');

/** @deprecated Use deriveFondo with neutral hue from seeds */
export function deriveDarkBackground(primarioHex: string): string {
  const seed = toOklch(normalizeHex(primarioHex));

  return deriveFondo(seed?.h ?? 0, 'dark');
}

export function deriveTheme(
  seeds: PaletteSeeds,
  theme: ThemeId,
  lockedRoles: PaletteRoleId[] = [],
): RolePalette {
  if (theme === 'light') {
    return buildPaletteFromSeeds(seeds, 'light', lockedRoles);
  }

  const fondo = deriveFondo(seeds.neutralHue, 'dark');
  const primario = adjustLightnessForContrast(seeds.primario, fondo, AA_TARGET);
  const acento = adjustLightnessForContrast(seeds.acento, fondo, AA_TARGET);
  const base = buildBasePalette(
    { fondo, primario, acento },
    { fondo: 'derived', primario: 'derived', acento: 'derived' },
  );

  return recomputeDerivedRoles(base, lockedRoles, seeds, 'dark');
}

function applyThemeOverrides(
  palette: RolePalette,
  config: ThemeConfig,
  lockedRoles: PaletteRoleId[],
  seeds: PaletteSeeds,
  theme: ThemeId,
): RolePalette {
  const locked = new Set(lockedRoles);
  let next: RolePalette = { ...palette };

  for (const role of PALETTE_ROLE_ORDER) {
    if (locked.has(role)) {
      continue;
    }

    const overrideHex = config.overrides[role];

    if (overrideHex) {
      next = {
        ...next,
        [role]: {
          ...next[role],
          hex: normalizeHex(overrideHex),
          source: 'extracted',
        },
      };
    }

    const overrideName = config.names?.[role];

    if (overrideName) {
      next = {
        ...next,
        [role]: {
          ...next[role],
          name: overrideName,
        },
      };
    }
  }

  const fondoOverridden = config.overrides.fondo && !locked.has('fondo');
  const primarioOverridden = config.overrides.primario && !locked.has('primario');

  if (fondoOverridden || primarioOverridden) {
    next = recomputeDerivedRoles(next, lockedRoles, seeds, theme);
  }

  return finalizeRolePalette(next);
}

export function resolveThemePalette(
  seeds: PaletteSeeds | null,
  theme: ThemeId,
  themes: ThemesConfig,
  lockedRoles: PaletteRoleId[] = [],
): RolePalette | null {
  if (!seeds) {
    return null;
  }

  const derived = deriveTheme(seeds, theme, lockedRoles);
  const config = themes[theme] ?? { overrides: {} };

  return applyThemeOverrides(derived, config, lockedRoles, seeds, theme);
}

export function diffThemeOverrides(
  base: RolePalette,
  target: RolePalette,
  lockedRoles: PaletteRoleId[] = [],
): ThemeOverrides {
  const locked = new Set(lockedRoles);
  const overrides: ThemeOverrides = {};

  for (const role of PALETTE_ROLE_ORDER) {
    if (locked.has(role)) {
      continue;
    }

    if (normalizeHex(base[role].hex) !== normalizeHex(target[role].hex)) {
      overrides[role] = target[role].hex;
    }
  }

  return overrides;
}

export function diffThemeNames(
  base: RolePalette,
  target: RolePalette,
): Partial<Record<PaletteRoleId, string>> {
  const names: Partial<Record<PaletteRoleId, string>> = {};

  for (const role of PALETTE_ROLE_ORDER) {
    if (base[role].name !== target[role].name) {
      names[role] = target[role].name;
    }
  }

  return names;
}

export function hasReadableChromaticOnBackground(
  palette: RolePalette,
  targetRatio = AA_TARGET,
): boolean {
  return (
    contrastRatio(palette.primario.hex, palette.fondo.hex) >= targetRatio &&
    contrastRatio(palette.acento.hex, palette.fondo.hex) >= targetRatio
  );
}
