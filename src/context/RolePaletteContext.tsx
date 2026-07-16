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
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from '@lib/utils/historyStack';
import type { PaletteType } from '@lib/color/paletteClassification';
import { resolveUiExpressiveGaps } from '@lib/color/uiExpressiveGaps';
import {
  applyUiStatusColors,
  buildUiStatusColors,
  type ForcedStatusColor,
  STATUS_COLORS_ON_DEMAND,
  type UiStatusColor,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

export type { ThemeId, ThemesConfig };

const EMPTY_LOCKED_BY_THEME: Record<ThemeId, PaletteRoleId[]> = {
  light: [],
  dark: [],
};
const DATA_TOKEN_NAMES = [
  'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6',
] as const satisfies readonly SemanticTokenName[];

function applyClearedDataTokens(
  tokens: SemanticTokens,
  clearedTokens: SemanticTokenName[],
): SemanticTokens {
  if (clearedTokens.length === 0) return tokens;

  const next = { ...tokens };
  for (const tokenName of DATA_TOKEN_NAMES) {
    if (!clearedTokens.includes(tokenName)) continue;
    next[tokenName] = {
      hex: tokens[tokenName].hex,
      source: 'derived',
      gap: 'Esta categoría de datos está vacía. Elige un candidato para asignarla.',
    };
  }
  return next;
}

export type TokenEditPreview =
  | { kind: 'token'; tokenName: SemanticTokenName; hex: string }
  | { kind: 'status'; role: UiStatusRole; status: UiStatusColor };

/** Sub-estado que entra al historial de deshacer/rehacer. */
type EditablePaletteState = {
  tokenOverrides: SemanticTokenOverrides;
  clearedSemanticTokens: SemanticTokenName[];
  roleNames: Partial<Record<PaletteRoleId, string>>;
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
  savedVibrancy: number;
  neutralStyle: NeutralStyle;
  forcedStatusSources: Partial<Record<UiStatusRole, string>>;
  forcedStatusColors: Partial<Record<UiStatusRole, ForcedStatusColor>>;
};

const INITIAL_EDITABLE: EditablePaletteState = {
  tokenOverrides: {},
  clearedSemanticTokens: [],
  roleNames: {},
  lockedRolesByTheme: EMPTY_LOCKED_BY_THEME,
  savedVibrancy: VIBRANCY_MID,
  neutralStyle: DEFAULT_NEUTRAL_STYLE,
  forcedStatusSources: {},
  forcedStatusColors: {},
};

export type RolePaletteContextValue = {
  rolePalette: RolePalette | null;
  semanticTokens: SemanticTokens | null;
  previewRolePalette: RolePalette | null;
  previewSemanticTokens: SemanticTokens | null;
  statusColors: UiStatusColorSet | null;
  tokenEditPreview: TokenEditPreview | null;
  paletteRevision: number;
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
  canUndoEdit: boolean;
  canRedoEdit: boolean;
  undoEdit: () => void;
  redoEdit: () => void;
  setRolePalette: (palette: RolePalette | null) => void;
  assignFromExtracted: (extracted: ExtractedColor[], paletteType?: PaletteType) => void;
  setPreviewVibrancy: (value: number) => void;
  saveVibrancy: () => void;
  regenerateIllustrationSeed: () => void;
  setNeutralStyle: (style: NeutralStyle) => void;
  setActiveTheme: (theme: ThemeId) => void;
  setActiveRole: (role: PaletteRoleId | null) => void;
  replaceRole: (role: PaletteRoleId, hex: string) => void;
  replaceSemanticToken: (tokenName: SemanticTokenName, hex: string) => void;
  clearSemanticToken: (tokenName: SemanticTokenName) => void;
  generateStatusColors: () => void;
  assignSourceToStatus: (role: UiStatusRole, hex: string) => void;
  selectStatusColor: (status: UiStatusColor) => void;
  setTokenEditPreview: (preview: TokenEditPreview | null) => void;
  clearTokenEditPreview: () => void;
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
  const [editHistory, setEditHistory] = useState(() => createHistory(INITIAL_EDITABLE));
  const [activeTheme, setActiveTheme] = useState<ThemeId>('light');
  const [previewVibrancy, setPreviewVibrancyState] = useState(VIBRANCY_MID);
  const [illustrationSeed, setIllustrationSeed] = useState(DEFAULT_ILLUSTRATION_SEED);
  const [activeRole, setActiveRole] = useState<PaletteRoleId | null>(null);
  const [paletteType, setPaletteType] = useState<PaletteType | undefined>(undefined);
  const [statusColorsEnabled, setStatusColorsEnabled] = useState(!STATUS_COLORS_ON_DEMAND);
  const [tokenEditPreview, setTokenEditPreviewState] = useState<TokenEditPreview | null>(null);
  const [paletteRevision, setPaletteRevision] = useState(0);

  const {
    tokenOverrides,
    clearedSemanticTokens,
    roleNames,
    lockedRolesByTheme,
    savedVibrancy,
    neutralStyle,
    forcedStatusSources,
    forcedStatusColors,
  } = editHistory.present;

  const lockedRoles = lockedRolesByTheme[activeTheme];

  const commitEdit = useCallback(
    (updater: (current: EditablePaletteState) => EditablePaletteState) => {
      setEditHistory((history) => pushHistory(history, updater(history.present)));
    },
    [],
  );

  const resetEditable = useCallback((next: Partial<EditablePaletteState> = {}) => {
    setEditHistory(createHistory({ ...INITIAL_EDITABLE, ...next }));
  }, []);

  const previewTokenOverrides = useMemo<SemanticTokenOverrides>(() => {
    if (!tokenEditPreview || tokenEditPreview.kind !== 'token') {
      return tokenOverrides;
    }

    return {
      ...tokenOverrides,
      [tokenEditPreview.tokenName]: normalizeHex(tokenEditPreview.hex),
    };
  }, [tokenEditPreview, tokenOverrides]);

  const baseSemanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return applyClearedDataTokens(resolveUiExpressiveGaps(deriveSemanticTokens({
      extracted: extractedColors,
      overrides: tokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: savedVibrancy,
      paletteType,
    }), extractedColors), clearedSemanticTokens);
  }, [activeTheme, clearedSemanticTokens, extractedColors, neutralStyle, paletteType, savedVibrancy, tokenOverrides]);

  const previewBaseSemanticTokens = useMemo(() => {
    if (extractedColors.length === 0) {
      return null;
    }

    return applyClearedDataTokens(resolveUiExpressiveGaps(deriveSemanticTokens({
      extracted: extractedColors,
      overrides: previewTokenOverrides,
      theme: activeTheme,
      neutralStyle,
      vibrancy: previewVibrancy,
      paletteType,
    }), extractedColors), clearedSemanticTokens);
  }, [activeTheme, clearedSemanticTokens, extractedColors, neutralStyle, paletteType, previewTokenOverrides, previewVibrancy]);

  const statusColors = useMemo(
    () => statusColorsEnabled && baseSemanticTokens
      ? buildUiStatusColors({
          colors: extractedColors,
          backgroundHex: baseSemanticTokens.background.hex,
          forcedSources: forcedStatusSources,
          forcedColors: forcedStatusColors,
        })
      : null,
    [baseSemanticTokens, extractedColors, forcedStatusColors, forcedStatusSources, statusColorsEnabled],
  );
  const previewStatusColors = useMemo(() => {
    if (!statusColors) {
      return null;
    }

    if (!tokenEditPreview || tokenEditPreview.kind !== 'status') {
      return statusColors;
    }

    return {
      ...statusColors,
      [tokenEditPreview.role]: tokenEditPreview.status,
    };
  }, [statusColors, tokenEditPreview]);
  const semanticTokens = useMemo(
    () => baseSemanticTokens ? applyUiStatusColors(baseSemanticTokens, statusColors) : null,
    [baseSemanticTokens, statusColors],
  );
  const previewSemanticTokens = useMemo(
    () => previewBaseSemanticTokens
      ? applyUiStatusColors(previewBaseSemanticTokens, previewStatusColors)
      : null,
    [previewBaseSemanticTokens, previewStatusColors],
  );

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
      setPaletteRevision((revision) => revision + 1);
      if (palette === null) {
        setExtractedColors([]);
        resetEditable();
        setPreviewVibrancyState(VIBRANCY_MID);
        setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
        setPaletteType(undefined);
        setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
        setTokenEditPreviewState(null);
        return;
      }

      setExtractedColors(
        Object.values(palette).map((slot, index) => ({
          hex: slot.hex,
          prominence: 1 - index * 0.05,
        })),
      );
      setEditHistory((history) => createHistory({
        ...INITIAL_EDITABLE,
        tokenOverrides: rolePaletteAsSemanticOverrides(palette),
        roleNames: history.present.roleNames,
        lockedRolesByTheme: history.present.lockedRolesByTheme,
      }));
      setPreviewVibrancyState(VIBRANCY_MID);
      setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
      setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
      setTokenEditPreviewState(null);
    },
    [resetEditable],
  );

  const assignFromExtracted = useCallback((extracted: ExtractedColor[], nextPaletteType?: PaletteType) => {
    setPaletteRevision((revision) => revision + 1);
    setExtractedColors(extracted);
    setPaletteType(nextPaletteType);
    resetEditable();
    setPreviewVibrancyState(VIBRANCY_MID);
    setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
    setActiveRole(null);
    setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
    setTokenEditPreviewState(null);
  }, [resetEditable]);

  const setPreviewVibrancy = useCallback((value: number) => {
    setPreviewVibrancyState(normalizeVibrancy(value));
  }, []);

  const saveVibrancy = useCallback(() => {
    commitEdit((current) => current.savedVibrancy === previewVibrancy
      ? current
      : { ...current, savedVibrancy: previewVibrancy });
  }, [commitEdit, previewVibrancy]);

  const setNeutralStyle = useCallback((style: NeutralStyle) => {
    commitEdit((current) => current.neutralStyle === style
      ? current
      : { ...current, neutralStyle: style });
  }, [commitEdit]);

  const regenerateIllustrationSeed = useCallback(() => {
    setIllustrationSeed((seed) => nextIllustrationSeed(seed));
  }, []);

  const replaceRole = useCallback(
    (role: PaletteRoleId, hex: string) => {
      const normalized = normalizeHex(hex);
      const tokenName = tokenNameForPaletteRole(role);

      commitEdit((current) => ({
        ...current,
        tokenOverrides: { ...current.tokenOverrides, [tokenName]: normalized },
      }));
    },
    [commitEdit],
  );

  const replaceSemanticToken = useCallback((tokenName: SemanticTokenName, hex: string) => {
    const normalized = normalizeHex(hex);

    commitEdit((current) => ({
      ...current,
      tokenOverrides: { ...current.tokenOverrides, [tokenName]: normalized },
      clearedSemanticTokens: current.clearedSemanticTokens.filter((name) => name !== tokenName),
    }));
    setTokenEditPreviewState(null);
  }, [commitEdit]);

  const clearSemanticToken = useCallback((tokenName: SemanticTokenName) => {
    commitEdit((current) => {
      const nextOverrides = { ...current.tokenOverrides };
      delete nextOverrides[tokenName];
      return {
        ...current,
        tokenOverrides: nextOverrides,
        clearedSemanticTokens: current.clearedSemanticTokens.includes(tokenName)
          ? current.clearedSemanticTokens
          : [...current.clearedSemanticTokens, tokenName],
      };
    });
  }, [commitEdit]);

  const generateStatusColors = useCallback(() => {
    setStatusColorsEnabled(true);
  }, []);

  const assignSourceToStatus = useCallback((role: UiStatusRole, hex: string) => {
    commitEdit((current) => {
      const nextForced = { ...current.forcedStatusColors };
      delete nextForced[role];
      return {
        ...current,
        forcedStatusSources: { ...current.forcedStatusSources, [role]: normalizeHex(hex) },
        forcedStatusColors: nextForced,
      };
    });
    setStatusColorsEnabled(true);
  }, [commitEdit]);

  const selectStatusColor = useCallback((status: UiStatusColor) => {
    commitEdit((current) => ({
      ...current,
      forcedStatusColors: {
        ...current.forcedStatusColors,
        [status.role]: {
          hex: normalizeHex(status.hex),
          origin: status.origin,
          ...(status.sourceHex ? { sourceHex: normalizeHex(status.sourceHex) } : {}),
        },
      },
    }));
    setStatusColorsEnabled(true);
    setTokenEditPreviewState(null);
  }, [commitEdit]);

  const setTokenEditPreview = useCallback((preview: TokenEditPreview | null) => {
    setTokenEditPreviewState((current) => {
      if (current === null && preview === null) {
        return current;
      }

      if (
        current?.kind === 'token'
        && preview?.kind === 'token'
        && current.tokenName === preview.tokenName
        && normalizeHex(current.hex) === normalizeHex(preview.hex)
      ) {
        return current;
      }

      if (
        current?.kind === 'status'
        && preview?.kind === 'status'
        && current.role === preview.role
        && normalizeHex(current.status.hex) === normalizeHex(preview.status.hex)
      ) {
        return current;
      }

      return preview;
    });
  }, []);

  const clearTokenEditPreview = useCallback(() => {
    setTokenEditPreviewState(null);
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

      commitEdit((current) => ({
        ...current,
        roleNames: { ...current.roleNames, [role]: trimmed },
      }));

      return true;
    },
    [commitEdit, rolePalette],
  );

  const toggleLock = useCallback(
    (role: PaletteRoleId) => {
      commitEdit((current) => {
        const themeLocks = current.lockedRolesByTheme[activeTheme];
        const nextLocks = themeLocks.includes(role)
          ? themeLocks.filter((id) => id !== role)
          : [...themeLocks, role];

        return {
          ...current,
          lockedRolesByTheme: {
            ...current.lockedRolesByTheme,
            [activeTheme]: nextLocks,
          },
        };
      });
    },
    [activeTheme, commitEdit],
  );

  const clearRolePalette = useCallback(() => {
    setPaletteRevision((revision) => revision + 1);
    setExtractedColors([]);
    resetEditable();
    setActiveTheme('light');
    setPreviewVibrancyState(VIBRANCY_MID);
    setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
    setActiveRole(null);
    setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
    setTokenEditPreviewState(null);
  }, [resetEditable]);

  const assignFromHexes = useCallback(
    (hexes: string[]) => {
      setPaletteRevision((revision) => revision + 1);
      const extracted = hexes.map((hex, index) => ({
        hex,
        prominence: 1 - index * 0.05,
      }));
      const assigned = assignRolesFromHexes(hexes);

      setExtractedColors(extracted);
      resetEditable({
        roleNames: Object.fromEntries(
          Object.values(assigned).map((slot) => [slot.role, slot.name]),
        ) as Partial<Record<PaletteRoleId, string>>,
      });
      setPreviewVibrancyState(VIBRANCY_MID);
      setIllustrationSeed(DEFAULT_ILLUSTRATION_SEED);
      setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
      setTokenEditPreviewState(null);
    },
    [resetEditable],
  );

  const undoEdit = useCallback(() => {
    if (!canUndo(editHistory)) return;
    const next = undoHistory(editHistory);
    setEditHistory(next);
    setPreviewVibrancyState(next.present.savedVibrancy);
    setTokenEditPreviewState(null);
  }, [editHistory]);

  const redoEdit = useCallback(() => {
    if (!canRedo(editHistory)) return;
    const next = redoHistory(editHistory);
    setEditHistory(next);
    setPreviewVibrancyState(next.present.savedVibrancy);
    setTokenEditPreviewState(null);
  }, [editHistory]);

  const canUndoEdit = canUndo(editHistory);
  const canRedoEdit = canRedo(editHistory);

  const selectionReady = useMemo(() => validateRolePalette(rolePalette).ok, [rolePalette]);

  const value = useMemo<RolePaletteContextValue>(
    () => ({
      rolePalette,
      semanticTokens,
      previewRolePalette,
      previewSemanticTokens,
      statusColors,
      tokenEditPreview,
      paletteRevision,
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
      canUndoEdit,
      canRedoEdit,
      undoEdit,
      redoEdit,
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
      clearSemanticToken,
      generateStatusColors,
      assignSourceToStatus,
      selectStatusColor,
      setTokenEditPreview,
      clearTokenEditPreview,
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
      statusColors,
      tokenEditPreview,
      paletteRevision,
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
      canUndoEdit,
      canRedoEdit,
      undoEdit,
      redoEdit,
      setRolePalette,
      assignFromExtracted,
      setPreviewVibrancy,
      saveVibrancy,
      regenerateIllustrationSeed,
      setNeutralStyle,
      replaceRole,
      replaceSemanticToken,
      clearSemanticToken,
      generateStatusColors,
      assignSourceToStatus,
      selectStatusColor,
      setTokenEditPreview,
      clearTokenEditPreview,
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
