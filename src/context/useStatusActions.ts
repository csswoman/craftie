import { useCallback, useMemo } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import type { UiStatusColor, UiStatusRole } from '@lib/color/uiStatusColors';

import type { PaletteCore } from '@/context/paletteCore';
import type { TokenEditPreview } from '@/context/rolePaletteTypes';

/** Status color assignment and the transient token/status edit preview. */
export function useStatusActions(core: PaletteCore) {
  const { commitEdit, setStatusColorsEnabled, setTokenEditPreviewState } = core;

  const generateStatusColors = useCallback(() => {
    setStatusColorsEnabled(true);
  }, [setStatusColorsEnabled]);

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
  }, [commitEdit, setStatusColorsEnabled]);

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
  }, [commitEdit, setStatusColorsEnabled, setTokenEditPreviewState]);

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
  }, [setTokenEditPreviewState]);

  const clearTokenEditPreview = useCallback(() => {
    setTokenEditPreviewState(null);
  }, [setTokenEditPreviewState]);

  return useMemo(
    () => ({
      generateStatusColors,
      assignSourceToStatus,
      selectStatusColor,
      setTokenEditPreview,
      clearTokenEditPreview,
    }),
    [
      generateStatusColors,
      assignSourceToStatus,
      selectStatusColor,
      setTokenEditPreview,
      clearTokenEditPreview,
    ],
  );
}
