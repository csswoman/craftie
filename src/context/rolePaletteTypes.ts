import type { ExtractedColor } from '@lib/color/imageExtractor';
import type { PaletteType } from '@lib/color/paletteClassification';
import type {
  HexSourceOptions,
  PaletteRoleId,
  PaletteSeeds,
  RolePalette,
} from '@lib/color/rolePalette';
import type {
  NeutralStyle,
  SemanticTokenName,
  SemanticTokenOverrides,
  SemanticTokens,
} from '@lib/color/semanticTokens';
import type { ThemeId, ThemesConfig } from '@lib/color/themePalette';
import type {
  UiStatusColor,
  UiStatusColorSet,
  UiStatusRole,
} from '@lib/color/uiStatusColors';
import type { UsageColor, UsageIntent } from '@lib/color/usageColor';
import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';
import type { RestoredSnapshotExtras, SnapshotExtras } from '@/context/snapshotExtras';

export type TokenEditPreview =
  | { kind: 'token'; tokenName: SemanticTokenName; hex: string }
  | { kind: 'status'; role: UiStatusRole; status: UiStatusColor };

export type RolePaletteContextValue = {
  rolePalette: RolePalette | null;
  getColorForUsage: (intent: UsageIntent) => UsageColor | null;
  /** Role palette locked to the `light` theme, independent of `activeTheme`, for stable export. */
  exportRolePalette: RolePalette | null;
  /** Confirmed status colors projected to semantic token overrides (success/warning/error). */
  exportStatusTokenOverrides: SemanticTokenOverrides;
  semanticTokens: SemanticTokens | null;
  previewRolePalette: RolePalette | null;
  previewSemanticTokens: SemanticTokens | null;
  statusColors: UiStatusColorSet | null;
  tokenEditPreview: TokenEditPreview | null;
  tokenOverridesByTheme: Record<ThemeId, SemanticTokenOverrides>;
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
  replaceRoles: (hexByRole: Partial<Record<PaletteRoleId, string>>) => void;
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
  /** `ordered` keeps the given order for primary, secondary and accent. */
  assignFromHexes: (hexes: string[], options?: HexSourceOptions) => void;
  /** Current serializable workspace snapshot (for share links). */
  getShareSnapshot: () => WorkspaceSnapshot;
  /** Restore a serializable snapshot at runtime (reopening a saved project). */
  applySnapshot: (snapshot: WorkspaceSnapshot) => void;
  /**
   * Publish typography / canvas view so they travel with autosave, share links
   * and saved projects. Written by the workspace controller.
   */
  setSnapshotExtras: (extras: SnapshotExtras) => void;
  /** Set whenever a snapshot is restored; the controller re-applies it to its own state. */
  restoredExtras: RestoredSnapshotExtras | null;
};
