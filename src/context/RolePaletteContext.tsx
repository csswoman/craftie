'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  assignRolesFromHexes,
  extractSeedsFromPalette,
  mergeRolePalettePreservingLocks,
  renameRoleSlot,
  validateRolePalette,
  type PaletteRoleId,
  type PaletteSeeds,
  type RolePalette,
} from '@lib/color/rolePalette';
import { normalizeHex } from '@lib/color/normalizeHex';
import {
  diffThemeNames,
  diffThemeOverrides,
  EMPTY_THEMES,
  resolveThemePalette,
  type ThemeId,
  type ThemesConfig,
} from '@lib/color/themePalette';

export type { ThemeId, ThemesConfig };

const EMPTY_LOCKED_BY_THEME: Record<ThemeId, PaletteRoleId[]> = {
  light: [],
  dark: [],
};

export type RolePaletteContextValue = {
  rolePalette: RolePalette | null;
  seeds: PaletteSeeds | null;
  activeTheme: ThemeId;
  themes: ThemesConfig;
  lockedRoles: PaletteRoleId[];
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
  activeRole: PaletteRoleId | null;
  selectionReady: boolean;
  setRolePalette: (palette: RolePalette | null) => void;
  setActiveTheme: (theme: ThemeId) => void;
  setActiveRole: (role: PaletteRoleId | null) => void;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  renameRole: (role: PaletteRoleId, name: string) => boolean;
  toggleLock: (role: PaletteRoleId) => void;
  clearRolePalette: () => void;
  assignFromHexes: (hexes: string[]) => void;
};

type RolePaletteProviderProps = {
  children: ReactNode;
};

const RolePaletteContext = createContext<RolePaletteContextValue | null>(null);

function isGlobalSeedRole(role: PaletteRoleId): boolean {
  return role === 'primario' || role === 'acento';
}

export function RolePaletteProvider({ children }: RolePaletteProviderProps) {
  const [seeds, setSeeds] = useState<PaletteSeeds | null>(null);
  const [themes, setThemes] = useState<ThemesConfig>(EMPTY_THEMES);
  const [activeTheme, setActiveTheme] = useState<ThemeId>('light');
  const [lockedRolesByTheme, setLockedRolesByTheme] =
    useState<Record<ThemeId, PaletteRoleId[]>>(EMPTY_LOCKED_BY_THEME);
  const [activeRole, setActiveRole] = useState<PaletteRoleId | null>(null);

  const lockedRoles = lockedRolesByTheme[activeTheme];

  const rolePalette = useMemo(
    () => resolveThemePalette(seeds, activeTheme, themes, lockedRoles),
    [seeds, activeTheme, themes, lockedRoles],
  );

  const syncThemeFromPalette = useCallback(
    (palette: RolePalette, theme: ThemeId, themeLocks: PaletteRoleId[]) => {
      const nextSeeds = extractSeedsFromPalette(palette);
      const derivedBase = resolveThemePalette(nextSeeds, theme, EMPTY_THEMES, themeLocks);

      if (!derivedBase) {
        return;
      }

      setSeeds(nextSeeds);
      setThemes((current) => ({
        ...current,
        [theme]: {
          overrides: diffThemeOverrides(derivedBase, palette, themeLocks),
          names: diffThemeNames(derivedBase, palette),
        },
      }));
    },
    [],
  );

  const setRolePalette = useCallback(
    (palette: RolePalette | null) => {
      if (palette === null) {
        setSeeds(null);
        setThemes(EMPTY_THEMES);
        setLockedRolesByTheme(EMPTY_LOCKED_BY_THEME);
        return;
      }

      syncThemeFromPalette(palette, activeTheme, lockedRolesByTheme[activeTheme]);
    },
    [activeTheme, lockedRolesByTheme, syncThemeFromPalette],
  );

  const replaceRole = useCallback(
    (role: PaletteRoleId, hex: string) => {
      const normalized = normalizeHex(hex);

      if (isGlobalSeedRole(role)) {
        setSeeds((current) => (current ? { ...current, [role]: normalized } : current));
        return;
      }

      setThemes((current) => ({
        ...current,
        [activeTheme]: {
          ...current[activeTheme],
          overrides: {
            ...current[activeTheme].overrides,
            [role]: normalized,
          },
        },
      }));
    },
    [activeTheme],
  );

  const renameRole = useCallback(
    (role: PaletteRoleId, name: string) => {
      const trimmed = name.trim();

      if (trimmed.length === 0 || trimmed.length > 40) {
        return false;
      }

      if (!rolePalette) {
        return false;
      }

      const renamed = renameRoleSlot(rolePalette, role, trimmed);

      if (!renamed) {
        return false;
      }

      setThemes((current) => ({
        ...current,
        [activeTheme]: {
          ...current[activeTheme],
          names: {
            ...current[activeTheme].names,
            [role]: trimmed,
          },
        },
      }));

      return true;
    },
    [activeTheme, rolePalette],
  );

  const toggleLock = useCallback(
    (role: PaletteRoleId) => {
      setLockedRolesByTheme((current) => {
        const themeLocks = current[activeTheme];
        const nextLocks = themeLocks.includes(role)
          ? themeLocks.filter((id) => id !== role)
          : [...themeLocks, role];

        return {
          ...current,
          [activeTheme]: nextLocks,
        };
      });
    },
    [activeTheme],
  );

  const clearRolePalette = useCallback(() => {
    setSeeds(null);
    setThemes(EMPTY_THEMES);
    setLockedRolesByTheme(EMPTY_LOCKED_BY_THEME);
    setActiveTheme('light');
    setActiveRole(null);
  }, []);

  const assignFromHexes = useCallback(
    (hexes: string[]) => {
      const assigned = assignRolesFromHexes(hexes);
      const themeLocks = lockedRolesByTheme[activeTheme];
      const currentResolved = resolveThemePalette(seeds, activeTheme, themes, themeLocks);
      const merged =
        currentResolved && themeLocks.length > 0
          ? mergeRolePalettePreservingLocks(currentResolved, assigned, themeLocks)
          : assigned;

      syncThemeFromPalette(merged, activeTheme, themeLocks);
    },
    [activeTheme, lockedRolesByTheme, seeds, syncThemeFromPalette, themes],
  );

  const selectionReady = useMemo(() => validateRolePalette(rolePalette).ok, [rolePalette]);

  const value = useMemo<RolePaletteContextValue>(
    () => ({
      rolePalette,
      seeds,
      activeTheme,
      themes,
      lockedRoles,
      lockedRolesByTheme,
      activeRole,
      selectionReady,
      setRolePalette,
      setActiveTheme,
      setActiveRole,
      replaceRole,
      renameRole,
      toggleLock,
      clearRolePalette,
      assignFromHexes,
    }),
    [
      rolePalette,
      seeds,
      activeTheme,
      themes,
      lockedRoles,
      lockedRolesByTheme,
      activeRole,
      selectionReady,
      setRolePalette,
      replaceRole,
      renameRole,
      toggleLock,
      clearRolePalette,
      assignFromHexes,
    ],
  );

  return <RolePaletteContext.Provider value={value}>{children}</RolePaletteContext.Provider>;
}

export function useRolePalette(): RolePaletteContextValue {
  const context = useContext(RolePaletteContext);

  if (!context) {
    throw new Error('useRolePalette debe usarse dentro de RolePaletteProvider.');
  }

  return context;
}

export function useRolePaletteOptional(): RolePaletteContextValue | null {
  return useContext(RolePaletteContext);
}
