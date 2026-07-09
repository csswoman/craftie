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
  rolePaletteAsSemanticOverrides,
  renameRoleSlot,
  validateRolePalette,
  type PaletteRoleId,
  type PaletteSeeds,
  type RolePalette,
} from '@lib/color/rolePalette';
import {
  DEFAULT_ILLUSTRATION_SEED,
  nextIllustrationSeed,
} from '@lib/color/illustrationComposer';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import { normalizeHex } from '@lib/color/normalizeHex';
import { tokenNameForPaletteRole } from '@lib/color/semanticRoleProjection';
import {
  DEFAULT_NEUTRAL_STYLE,
  deriveSemanticTokens,
  type NeutralStyle,
  type SemanticTokenName,
  type SemanticTokenOverrides,
  type SemanticTokens,
} from '@lib/color/semanticTokens';
import { projectSemanticTokensToRolePalette } from '@lib/color/semanticRoleProjection';
import {
  EMPTY_THEMES,
  type ThemeId,
  type ThemesConfig,
} from '@lib/color/themePalette';
import { VIBRANCY_MID, normalizeVibrancy } from '@lib/color/vibrancy';

export type { ThemeId, ThemesConfig };

const EMPTY_LOCKED_BY_THEME: Record<ThemeId, PaletteRoleId[]> = {
  light: [],
  dark: [],
};

export type RolePaletteContextValue = {
  rolePalette: RolePalette | null;
  semanticTokens: SemanticTokens | null;
  previewRolePalette: RolePalette | null;
  previewSemanticTokens: SemanticTokens | null;
  seeds: PaletteSeeds | null;
  illustrationSeed: number;
  savedVibrancy: number;
  previewVibrancy: number;
  hasUnsavedVibrancy: boolean;
  neutralStyle: NeutralStyle;
  activeTheme: ThemeId;
  themes: ThemesConfig;
  lockedRoles: PaletteRoleId[];
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
  activeRole: PaletteRoleId | null;
  selectionReady: boolean;
  setRolePalette: (palette: RolePalette | null) => void;
  assignFromExtracted: (extracted: ExtractedColor[]) => void;
  setPreviewVibrancy: (value: number) => void;
  saveVibrancy: () => void;
  regenerateIllustrationSeed: () => void;
  setNeutralStyle: (style: NeutralStyle) => void;
  setActiveTheme: (theme: ThemeId) => void;
  setActiveRole: (role: PaletteRoleId | null) => void;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  replaceSemanticToken: (tokenName: SemanticTokenName, hex: string) => void;
  renameRole: (role: PaletteRoleId, name: string) => boolean;
  toggleLock: (role: PaletteRoleId) => void;
  clearRolePalette: () => void;
  assignFromHexes: (hexes: string[]) => void;
};

type RolePaletteProviderProps = {
  children: ReactNode;
};

const RolePaletteContext = createContext<RolePaletteContextValue | null>(null);

export function RolePaletteProvider({ children }: RolePaletteProviderProps) {
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [tokenOverrides, setTokenOverrides] = useState<SemanticTokenOverrides>({});
  const [roleNames, setRoleNames] = useState<Partial<Record<PaletteRoleId, string>>>({});
  const [activeTheme, setActiveTheme] = useState<ThemeId>('light');
  const [savedVibrancy, setSavedVibrancy] = useState(VIBRANCY_MID);
  const [previewVibrancy, setPreviewVibrancyState] = useState(VIBRANCY_MID);
  const [illustrationSeed, setIllustrationSeed] = useState(DEFAULT_ILLUSTRATION_SEED);
  const [neutralStyle, setNeutralStyle] = useState<NeutralStyle>(DEFAULT_NEUTRAL_STYLE);
  const [lockedRolesByTheme, setLockedRolesByTheme] =
    useState<Record<ThemeId, PaletteRoleId[]>>(EMPTY_LOCKED_BY_THEME);
  const [activeRole, setActiveRole] = useState<PaletteRoleId | null>(null);

  const lockedRoles = lockedRolesByTheme[activeTheme];

  const semanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return deriveSemanticTokens({
      extracted: extractedColors,
      overrides: tokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: savedVibrancy,
    });
  }, [activeTheme, extractedColors, neutralStyle, savedVibrancy, tokenOverrides]);

  const previewSemanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return deriveSemanticTokens({
      extracted: extractedColors,
      overrides: tokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: previewVibrancy,
    });
  }, [activeTheme, extractedColors, neutralStyle, previewVibrancy, tokenOverrides]);

  const rolePalette = useMemo(
    () => (semanticTokens ? projectSemanticTokensToRolePalette(semanticTokens, roleNames) : null),
    [roleNames, semanticTokens],
  );
  const previewRolePalette = useMemo(
    () =>
      previewSemanticTokens
        ? projectSemanticTokensToRolePalette(previewSemanticTokens, roleNames)
        : null,
    [previewSemanticTokens, roleNames],
  );

  const seeds = useMemo<PaletteSeeds | null>(
    () =>
      rolePalette
        ? {
            ...extractSeedsFromPalette(rolePalette),
            extracted: extractedColors,
            vibrancy: savedVibrancy,
            illustrationSeed,
          }
        : null,
    [extractedColors, illustrationSeed, rolePalette, savedVibrancy],
  );

  const themes = useMemo<ThemesConfig>(() => EMPTY_THEMES, []);
  const hasUnsavedVibrancy = previewVibrancy !== savedVibrancy;

  const setRolePalette = useCallback(
    (palette: RolePalette | null) => {
      if (palette === null) {
        setExtractedColors([]);
        setTokenOverrides({});
        setRoleNames({});
        setLockedRolesByTheme(EMPTY_LOCKED_BY_THEME);
        setSavedVibrancy(VIBRANCY_MID);
        setPreviewVibrancyState(VIBRANCY_MID);
        setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
        setNeutralStyle(DEFAULT_NEUTRAL_STYLE);
        return;
      }

      setExtractedColors(
        Object.values(palette).map((slot, index) => ({
          hex: slot.hex,
          prominence: 1 - index * 0.05,
        })),
      );
      setTokenOverrides(rolePaletteAsSemanticOverrides(palette));
      setSavedVibrancy(VIBRANCY_MID);
      setPreviewVibrancyState(VIBRANCY_MID);
      setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
      setNeutralStyle(DEFAULT_NEUTRAL_STYLE);
    },
    [],
  );

  const assignFromExtracted = useCallback((extracted: ExtractedColor[]) => {
    setExtractedColors(extracted);
    setTokenOverrides({});
    setRoleNames({});
    setLockedRolesByTheme(EMPTY_LOCKED_BY_THEME);
    setSavedVibrancy(VIBRANCY_MID);
    setPreviewVibrancyState(VIBRANCY_MID);
    setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
    setNeutralStyle(DEFAULT_NEUTRAL_STYLE);
    setActiveRole(null);
  }, []);

  const setPreviewVibrancy = useCallback((value: number) => {
    setPreviewVibrancyState(normalizeVibrancy(value));
  }, []);

  const saveVibrancy = useCallback(() => {
    setSavedVibrancy(previewVibrancy);
  }, [previewVibrancy]);

  const regenerateIllustrationSeed = useCallback(() => {
    setIllustrationSeed((seed) => nextIllustrationSeed(seed));
  }, []);

  const replaceRole = useCallback(
    (role: PaletteRoleId, hex: string) => {
      const normalized = normalizeHex(hex);
      const tokenName = tokenNameForPaletteRole(role);

      setTokenOverrides((current) => ({
        ...current,
        [tokenName]: normalized,
      }));
    },
    [],
  );

  const replaceSemanticToken = useCallback((tokenName: SemanticTokenName, hex: string) => {
    const normalized = normalizeHex(hex);

    setTokenOverrides((current) => ({
      ...current,
      [tokenName]: normalized,
    }));
  }, []);

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

      setRoleNames((current) => ({ ...current, [role]: trimmed }));

      return true;
    },
    [rolePalette],
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
    setExtractedColors([]);
    setTokenOverrides({});
    setRoleNames({});
    setLockedRolesByTheme(EMPTY_LOCKED_BY_THEME);
    setActiveTheme('light');
    setSavedVibrancy(VIBRANCY_MID);
    setPreviewVibrancyState(VIBRANCY_MID);
    setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
    setNeutralStyle(DEFAULT_NEUTRAL_STYLE);
    setActiveRole(null);
  }, []);

  const assignFromHexes = useCallback(
    (hexes: string[]) => {
      const extracted = hexes.map((hex, index) => ({
        hex,
        prominence: 1 - index * 0.05,
      }));
      const assigned = assignRolesFromHexes(hexes);

      setExtractedColors(extracted);
      setTokenOverrides({});
      setRoleNames(
        Object.fromEntries(
          Object.values(assigned).map((slot) => [slot.role, slot.name]),
        ) as Partial<Record<PaletteRoleId, string>>,
      );
      setSavedVibrancy(VIBRANCY_MID);
      setPreviewVibrancyState(VIBRANCY_MID);
      setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
      setNeutralStyle(DEFAULT_NEUTRAL_STYLE);
    },
    [],
  );

  const selectionReady = useMemo(() => validateRolePalette(rolePalette).ok, [rolePalette]);

  const value = useMemo<RolePaletteContextValue>(
    () => ({
      rolePalette,
      semanticTokens,
      previewRolePalette,
      previewSemanticTokens,
      seeds,
      illustrationSeed,
      savedVibrancy,
      previewVibrancy,
      hasUnsavedVibrancy,
      neutralStyle,
      activeTheme,
      themes,
      lockedRoles,
      lockedRolesByTheme,
      activeRole,
      selectionReady,
      setRolePalette,
      assignFromExtracted,
      setPreviewVibrancy,
      saveVibrancy,
      regenerateIllustrationSeed,
      setNeutralStyle,
      setActiveTheme,
      setActiveRole,
      replaceRole,
      replaceSemanticToken,
      renameRole,
      toggleLock,
      clearRolePalette,
      assignFromHexes,
    }),
    [
      rolePalette,
      semanticTokens,
      previewRolePalette,
      previewSemanticTokens,
      seeds,
      illustrationSeed,
      savedVibrancy,
      previewVibrancy,
      hasUnsavedVibrancy,
      neutralStyle,
      activeTheme,
      themes,
      lockedRoles,
      lockedRolesByTheme,
      activeRole,
      selectionReady,
      setRolePalette,
      assignFromExtracted,
      setPreviewVibrancy,
      saveVibrancy,
      regenerateIllustrationSeed,
      setNeutralStyle,
      replaceRole,
      replaceSemanticToken,
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
