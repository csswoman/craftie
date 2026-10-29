import type { ExtractedColor } from '../color/imageTypes';
import type { PaletteType } from '../color/paletteClassification';
import type { PaletteRoleId } from '../color/roleTypes';
import type {
  NeutralStyle,
  SemanticTokenName,
  SemanticTokenOverrides,
} from '../color/semanticTokens';
import type { ThemeId } from '../color/themePalette';
import type { ForcedStatusColor, UiStatusRole } from '../color/uiStatusColors';

/**
 * Serializable view of the Select-Colors workspace. Mirrors the sub-state the
 * RolePaletteContext treats as persistable: the editable palette history
 * `present` plus the top-level extracted colors / palette type / illustration
 * seed. Kept framework- and browser-agnostic so it can be reused by later
 * features (share link, project model) without pulling in React or the DOM.
 */
export type WorkspaceSnapshot = {
  tokenOverridesByTheme: Record<ThemeId, SemanticTokenOverrides>;
  clearedSemanticTokens: SemanticTokenName[];
  roleNames: Partial<Record<PaletteRoleId, string>>;
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
  savedVibrancy: number;
  neutralStyle: NeutralStyle;
  forcedStatusSources: Partial<Record<UiStatusRole, string>>;
  forcedStatusColors: Partial<Record<UiStatusRole, ForcedStatusColor>>;
  extractedColors: ExtractedColor[];
  paletteType: PaletteType | undefined;
  illustrationSeed: number;
};

const SNAPSHOT_VERSION = 1 as const;

/** Versioned envelope written to storage. Only `version: 1` is accepted back. */
type WorkspaceSnapshotEnvelope = { version: typeof SNAPSHOT_VERSION } & WorkspaceSnapshot;

const THEME_IDS: readonly ThemeId[] = ['light', 'dark'];
const NEUTRAL_STYLES: readonly NeutralStyle[] = ['pure', 'tinted'];
const STATUS_ORIGINS: readonly ForcedStatusColor['origin'][] = [
  'found',
  'found-adjusted',
  'synthetic',
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!isObject(value)) return false;
  return Object.values(value).every((entry) => typeof entry === 'string');
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isOverridesByTheme(
  value: unknown,
): value is Record<ThemeId, SemanticTokenOverrides> {
  if (!isObject(value)) return false;
  return THEME_IDS.every((theme) => isStringRecord(value[theme]));
}

function isLockedByTheme(
  value: unknown,
): value is Record<ThemeId, PaletteRoleId[]> {
  if (!isObject(value)) return false;
  return THEME_IDS.every((theme) => isStringArray(value[theme]));
}

function isExtractedColors(value: unknown): value is ExtractedColor[] {
  return (
    Array.isArray(value)
    && value.every(
      (entry) =>
        isObject(entry)
        && typeof entry.hex === 'string'
        && typeof entry.prominence === 'number',
    )
  );
}

function isForcedStatusColors(
  value: unknown,
): value is Partial<Record<UiStatusRole, ForcedStatusColor>> {
  if (!isObject(value)) return false;
  return Object.values(value).every((entry) => {
    if (!isObject(entry)) return false;
    if (typeof entry.hex !== 'string') return false;
    if (!STATUS_ORIGINS.includes(entry.origin as ForcedStatusColor['origin'])) {
      return false;
    }
    if (entry.sourceHex !== undefined && typeof entry.sourceHex !== 'string') {
      return false;
    }
    return true;
  });
}

function isPaletteType(value: unknown): value is PaletteType {
  return (
    value === 'pastel' || value === 'vivid' || value === 'dark' || value === 'neutral'
  );
}

/** Serialize the workspace snapshot into a versioned JSON string. */
export function serializeWorkspace(state: WorkspaceSnapshot): string {
  const envelope: WorkspaceSnapshotEnvelope = {
    version: SNAPSHOT_VERSION,
    ...state,
  };
  return JSON.stringify(envelope);
}

/**
 * Parse and validate a serialized workspace snapshot. Returns `null` for any
 * input that is not a well-formed `version: 1` envelope so the caller can fall
 * back to a fresh workspace rather than crashing on stale/corrupt data.
 */
export function deserializeWorkspace(raw: unknown): WorkspaceSnapshot | null {
  let parsed: unknown = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!isObject(parsed)) return null;
  // Forward-migration guard: only the current version is accepted.
  if (parsed.version !== SNAPSHOT_VERSION) return null;

  if (!isOverridesByTheme(parsed.tokenOverridesByTheme)) return null;
  if (!isStringArray(parsed.clearedSemanticTokens)) return null;
  if (!isStringRecord(parsed.roleNames)) return null;
  if (!isLockedByTheme(parsed.lockedRolesByTheme)) return null;
  if (typeof parsed.savedVibrancy !== 'number') return null;
  if (!NEUTRAL_STYLES.includes(parsed.neutralStyle as NeutralStyle)) return null;
  if (!isStringRecord(parsed.forcedStatusSources)) return null;
  if (!isForcedStatusColors(parsed.forcedStatusColors)) return null;
  if (!isExtractedColors(parsed.extractedColors)) return null;
  if (parsed.paletteType !== undefined && !isPaletteType(parsed.paletteType)) {
    return null;
  }
  if (typeof parsed.illustrationSeed !== 'number') return null;

  return {
    tokenOverridesByTheme: parsed.tokenOverridesByTheme,
    clearedSemanticTokens: parsed.clearedSemanticTokens as SemanticTokenName[],
    roleNames: parsed.roleNames as Partial<Record<PaletteRoleId, string>>,
    lockedRolesByTheme: parsed.lockedRolesByTheme,
    savedVibrancy: parsed.savedVibrancy,
    neutralStyle: parsed.neutralStyle as NeutralStyle,
    forcedStatusSources: parsed.forcedStatusSources as Partial<
      Record<UiStatusRole, string>
    >,
    forcedStatusColors: parsed.forcedStatusColors,
    extractedColors: parsed.extractedColors,
    paletteType: parsed.paletteType as PaletteType | undefined,
    illustrationSeed: parsed.illustrationSeed,
  };
}
