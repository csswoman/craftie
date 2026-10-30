import { useCallback, useEffect, useRef, useState } from 'react';

import type { EditablePaletteState } from '@lib/color/editablePalette';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { PaletteType } from '@lib/color/paletteClassification';
import { decodeShareSnapshot } from '@lib/studio/shareLink';
import {
  deserializeWorkspace,
  serializeWorkspace,
  type WorkspaceSnapshot,
} from '@lib/studio/workspaceSnapshot';

import { clearShareHash, readShareHash } from '@/lib/browser/shareUrl';
import { readWorkspaceSnapshot, writeWorkspaceSnapshot } from '@/lib/browser/workspaceStorage';
import {
  extrasFromSnapshot,
  sameExtras,
  type RestoredSnapshotExtras,
  type SnapshotExtras,
} from '@/context/snapshotExtras';

type PersistenceInput = {
  editable: EditablePaletteState;
  extractedColors: ExtractedColor[];
  paletteType: PaletteType | undefined;
  illustrationSeed: number;
  /** Restores the palette state from a snapshot read on mount. Must be stable. */
  onHydrate: (snapshot: WorkspaceSnapshot) => void;
};

/**
 * Owns hydration (share hash / localStorage), debounced autosave, the
 * share snapshot and the typography / canvas extras that travel with it.
 */
export function useWorkspacePersistence({
  editable,
  extractedColors,
  paletteType,
  illustrationSeed,
  onHydrate,
}: PersistenceInput) {
  const {
    tokenOverridesByTheme,
    clearedSemanticTokens,
    roleNames,
    lockedRolesByTheme,
    savedVibrancy,
    neutralStyle,
    forcedStatusSources,
    forcedStatusColors,
  } = editable;

  // Tracks whether the initial hydration pass has run, so the autosave effect
  // never writes the fresh initial state before (or over) a restored snapshot.
  const hydratedRef = useRef(false);
  const [snapshotExtras, setSnapshotExtrasState] = useState<SnapshotExtras>({});
  const setSnapshotExtras = useCallback((next: SnapshotExtras) => {
    setSnapshotExtrasState((current) => (sameExtras(current, next) ? current : next));
  }, []);
  const [restoredExtras, setRestoredExtras] = useState<RestoredSnapshotExtras | null>(null);
  const restoreCounterRef = useRef(0);
  const restoreExtras = useCallback((snapshot: WorkspaceSnapshot) => {
    const extras = extrasFromSnapshot(snapshot);
    restoreCounterRef.current += 1;
    setSnapshotExtrasState(extras);
    setRestoredExtras({ extras, token: restoreCounterRef.current });
  }, []);

  useEffect(() => {
    // A valid `#p=...` share hash takes precedence over the stored snapshot so
    // an opened link always wins over whatever the visitor had locally.
    const shareHash = readShareHash();
    const snapshot =
      (shareHash ? decodeShareSnapshot(shareHash) : null)
      ?? deserializeWorkspace(readWorkspaceSnapshot());
    if (snapshot) {
      // Restore client-only persisted state once the browser document exists.
      onHydrate(snapshot);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      restoreExtras(snapshot);
    }
    // The link has been consumed: drop it so later reloads use the autosaved
    // state instead of resurrecting this older snapshot.
    if (shareHash) clearShareHash();
    hydratedRef.current = true;
  }, [onHydrate, restoreExtras]);

  // Debounced autosave: whenever a serializable field changes, persist the
  // snapshot ~500ms later. Skipped until the initial hydrate pass completes.
  useEffect(() => {
    if (!hydratedRef.current) return;

    const timeout = setTimeout(() => {
      writeWorkspaceSnapshot(
        serializeWorkspace({
          tokenOverridesByTheme,
          clearedSemanticTokens,
          roleNames,
          lockedRolesByTheme,
          savedVibrancy,
          neutralStyle,
          forcedStatusSources,
          forcedStatusColors,
          extractedColors,
          paletteType,
          illustrationSeed,
          ...snapshotExtras,
        }),
      );
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    tokenOverridesByTheme,
    clearedSemanticTokens,
    roleNames,
    lockedRolesByTheme,
    savedVibrancy,
    neutralStyle,
    forcedStatusSources,
    forcedStatusColors,
    extractedColors,
    paletteType,
    illustrationSeed,
    snapshotExtras,
  ]);

  // Current serializable snapshot, for share links and any other consumer that
  // needs the full persistable state without reaching into private sub-state.
  const getShareSnapshot = useCallback(
    (): WorkspaceSnapshot => ({
      tokenOverridesByTheme,
      clearedSemanticTokens,
      roleNames,
      lockedRolesByTheme,
      savedVibrancy,
      neutralStyle,
      forcedStatusSources,
      forcedStatusColors,
      extractedColors,
      paletteType,
      illustrationSeed,
      ...snapshotExtras,
    }),
    [
      snapshotExtras,
      tokenOverridesByTheme,
      clearedSemanticTokens,
      roleNames,
      lockedRolesByTheme,
      savedVibrancy,
      neutralStyle,
      forcedStatusSources,
      forcedStatusColors,
      extractedColors,
      paletteType,
      illustrationSeed,
    ],
  );

  return { getShareSnapshot, setSnapshotExtras, restoredExtras, restoreExtras };
}
