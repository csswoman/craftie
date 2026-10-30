import type { Dispatch, SetStateAction } from 'react';

import type { EditablePaletteState } from '@lib/color/editablePalette';
import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { PaletteType } from '@lib/color/paletteClassification';
import type { ThemeId } from '@lib/color/themePalette';
import type { PaletteRoleId } from '@lib/color/rolePalette';

import type { TokenEditPreview } from '@/context/rolePaletteTypes';

/**
 * Shared state handles passed from the provider to the action hooks, so each
 * hook can stay focused on one area without owning its own copy of the state.
 */
export type PaletteCore = {
  activeTheme: ThemeId;
  editable: EditablePaletteState;
  extractedColors: ExtractedColor[];
  paletteType: PaletteType | undefined;
  previewVibrancy: number;
  commitEdit: (updater: (current: EditablePaletteState) => EditablePaletteState) => void;
  resetEditable: (next?: Partial<EditablePaletteState>) => void;
  setExtractedColors: Dispatch<SetStateAction<ExtractedColor[]>>;
  setPaletteType: Dispatch<SetStateAction<PaletteType | undefined>>;
  setPreviewVibrancyState: Dispatch<SetStateAction<number>>;
  setIllustrationSeed: Dispatch<SetStateAction<number>>;
  setActiveRole: Dispatch<SetStateAction<PaletteRoleId | null>>;
  setStatusColorsEnabled: Dispatch<SetStateAction<boolean>>;
  setTokenEditPreviewState: Dispatch<SetStateAction<TokenEditPreview | null>>;
  setPaletteRevision: Dispatch<SetStateAction<number>>;
};
