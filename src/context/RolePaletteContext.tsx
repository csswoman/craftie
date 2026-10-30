'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTheme } from 'next-themes';

import {
  editableFromSnapshot,
  type EditablePaletteState,
} from '@lib/color/editablePalette';
import { DEFAULT_ILLUSTRATION_SEED } from '@lib/color/illustrationComposer';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { PaletteType } from '@lib/color/paletteClassification';
import type { PaletteRoleId } from '@lib/color/rolePalette';
import {
  EMPTY_THEMES,
  resolveActiveThemeFromUi,
  type ThemeId,
  type ThemesConfig,
} from '@lib/color/themePalette';
import { STATUS_COLORS_ON_DEMAND } from '@lib/color/uiStatusColors';
import type { UsageColor, UsageIntent } from '@lib/color/usageColor';
import { VIBRANCY_MID } from '@lib/color/vibrancy';
import { createHistory } from '@lib/utils/historyStack';
import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';

import type { PaletteCore } from '@/context/paletteCore';
import type {
  RolePaletteContextValue,
  TokenEditPreview,
} from '@/context/rolePaletteTypes';
import { useDerivedPalette } from '@/context/useDerivedPalette';
import { useEditHistory } from '@/context/useEditHistory';
import { usePaletteEditActions } from '@/context/usePaletteEditActions';
import { usePaletteResetActions } from '@/context/usePaletteResetActions';
import { useStatusActions } from '@/context/useStatusActions';
import { useWorkspacePersistence } from '@/context/useWorkspacePersistence';

export type { ThemeId, ThemesConfig };
export type { UsageColor, UsageIntent };
export type { RolePaletteContextValue, TokenEditPreview };

type RolePaletteProviderProps = {
  children: ReactNode;
};

const RolePaletteContext = createContext<RolePaletteContextValue | null>(null);

export function RolePaletteProvider({ children }: RolePaletteProviderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  // Derive from next-themes so cold start (e.g. persisted dark) stays aligned
  // without syncing via an effect.
  const activeTheme = resolveActiveThemeFromUi(resolvedTheme);
  const setActiveTheme = useCallback(
    (theme: ThemeId) => {
      setTheme(theme);
    },
    [setTheme],
  );
  const [extractedColors, setExtractedColors] = useState<ExtractedColor[]>([]);
  const [previewVibrancy, setPreviewVibrancyState] = useState(VIBRANCY_MID);
  const [illustrationSeed, setIllustrationSeed] = useState(DEFAULT_ILLUSTRATION_SEED);
  const [activeRole, setActiveRole] = useState<PaletteRoleId | null>(null);
  const [paletteType, setPaletteType] = useState<PaletteType | undefined>(undefined);
  const [statusColorsEnabled, setStatusColorsEnabled] = useState(!STATUS_COLORS_ON_DEMAND);
  const [tokenEditPreview, setTokenEditPreviewState] = useState<TokenEditPreview | null>(null);
  const [paletteRevision, setPaletteRevision] = useState(0);

  const syncAfterTimeTravel = useCallback((present: EditablePaletteState) => {
    setPreviewVibrancyState(present.savedVibrancy);
    setTokenEditPreviewState(null);
  }, []);
  const {
    editable,
    setEditHistory,
    commitEdit,
    resetEditable,
    undoEdit,
    redoEdit,
    canUndoEdit,
    canRedoEdit,
  } = useEditHistory(syncAfterTimeTravel);

  // Restores the palette fields of a snapshot without touching revision or
  // transient UI state. Used by the mount hydrate pass and by `applySnapshot`.
  const restoreSnapshotState = useCallback((snapshot: WorkspaceSnapshot) => {
    setEditHistory(createHistory(editableFromSnapshot(snapshot)));
    setExtractedColors(snapshot.extractedColors);
    setPaletteType(snapshot.paletteType);
    setIllustrationSeed(snapshot.illustrationSeed);
    setPreviewVibrancyState(snapshot.savedVibrancy);
  }, [setEditHistory]);

  const { getShareSnapshot, setSnapshotExtras, restoredExtras, restoreExtras } =
    useWorkspacePersistence({
      editable,
      extractedColors,
      paletteType,
      illustrationSeed,
      onHydrate: restoreSnapshotState,
    });

  // Runtime reopen path used by saved projects; also resets transient state.
  const applySnapshot = useCallback((snapshot: WorkspaceSnapshot) => {
    setPaletteRevision((revision) => revision + 1);
    restoreSnapshotState(snapshot);
    setStatusColorsEnabled(!STATUS_COLORS_ON_DEMAND);
    setTokenEditPreviewState(null);
    setActiveRole(null);
    restoreExtras(snapshot);
  }, [restoreExtras, restoreSnapshotState]);

  const core: PaletteCore = {
    activeTheme,
    editable,
    extractedColors,
    paletteType,
    previewVibrancy,
    commitEdit,
    resetEditable,
    setExtractedColors,
    setPaletteType,
    setPreviewVibrancyState,
    setIllustrationSeed,
    setActiveRole,
    setStatusColorsEnabled,
    setTokenEditPreviewState,
    setPaletteRevision,
  };

  const derived = useDerivedPalette({
    activeTheme,
    editable,
    extractedColors,
    paletteType,
    previewVibrancy,
    illustrationSeed,
    statusColorsEnabled,
    tokenEditPreview,
  });
  const editActions = usePaletteEditActions(core, derived.rolePalette);
  const resetActions = usePaletteResetActions(core, setEditHistory);
  const statusActions = useStatusActions(core);

  const themes = useMemo<ThemesConfig>(() => EMPTY_THEMES, []);
  const { savedVibrancy, neutralStyle, lockedRolesByTheme, tokenOverridesByTheme } = editable;

  const value = useMemo<RolePaletteContextValue>(
    () => ({
      ...derived,
      ...editActions,
      ...resetActions,
      ...statusActions,
      tokenEditPreview,
      tokenOverridesByTheme,
      paletteRevision,
      illustrationSeed,
      savedVibrancy,
      previewVibrancy,
      hasUnsavedVibrancy: previewVibrancy !== savedVibrancy,
      neutralStyle,
      activeTheme,
      themes,
      lockedRoles: lockedRolesByTheme[activeTheme],
      lockedRolesByTheme,
      activeRole,
      canUndoEdit,
      canRedoEdit,
      undoEdit,
      redoEdit,
      setActiveTheme,
      setActiveRole,
      getShareSnapshot,
      applySnapshot,
      setSnapshotExtras,
      restoredExtras,
    }),
    [
      derived,
      editActions,
      resetActions,
      statusActions,
      tokenEditPreview,
      tokenOverridesByTheme,
      paletteRevision,
      illustrationSeed,
      savedVibrancy,
      previewVibrancy,
      neutralStyle,
      activeTheme,
      themes,
      lockedRolesByTheme,
      activeRole,
      canUndoEdit,
      canRedoEdit,
      undoEdit,
      redoEdit,
      setActiveTheme,
      getShareSnapshot,
      applySnapshot,
      setSnapshotExtras,
      restoredExtras,
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
