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
import type { FontClassification } from '../typography/fontPairTypes';
import {
  TYPE_SCALE_BASES,
  TYPE_SCALE_RATIOS,
  type TypeScaleBase,
  type TypeScaleRatio,
} from '../typography/typeScale';
import { parseTypeLevelOverrides, type TypeLevelOverrides } from '../typography/typeLevels';
import { parseTypeRoleOverrides, type TypeRoleOverrides } from '../typography/typeRoles';
import type { AppliedTypography } from '../typography/typeState';
import { CANVAS_VIEWS, type CanvasViewId } from '../color/canvasViews';

/**
 * Confirmed typography decisions. Hover previews and pins are transient and
 * intentionally excluded.
 */
export type SnapshotTypography = {
  applied: AppliedTypography;
  base: TypeScaleBase;
  ratio: TypeScaleRatio;
  /** Per-role weight / size / leading / tracking overrides. Optional for older snapshots. */
  typeRoles?: TypeRoleOverrides;
  /** Per-level weight / leading / tracking overrides of the scale. */
  typeLevels?: TypeLevelOverrides;
};

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
  /** Optional so snapshots written before typography was persisted still load. */
  typography?: SnapshotTypography;
  /** Active canvas view (e.g. a web layout), optional for the same reason. */
  canvasView?: CanvasViewId;
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

const FONT_CLASSIFICATIONS: readonly FontClassification[] = [
  'serif',
  'sans-serif',
  'display',
  'monospace',
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 120;
}

function isWeight(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 100 && value <= 900;
}

function parseTypography(value: unknown): SnapshotTypography | undefined {
  if (!isObject(value) || !isObject(value.applied)) return undefined;
  const applied = value.applied;
  if (
    !isNonEmptyString(applied.headingFamily)
    || !isNonEmptyString(applied.bodyFamily)
    || !isWeight(applied.headingWeight)
    || !isWeight(applied.bodyWeight)
    || !FONT_CLASSIFICATIONS.includes(applied.headingClassification as FontClassification)
    || !FONT_CLASSIFICATIONS.includes(applied.bodyClassification as FontClassification)
    || (applied.catalogPairId !== null && typeof applied.catalogPairId !== 'string')
    || !TYPE_SCALE_BASES.includes(value.base as TypeScaleBase)
    || !TYPE_SCALE_RATIOS.includes(value.ratio as TypeScaleRatio)
  ) {
    return undefined;
  }

  const typeRoles = parseTypeRoleOverrides(value.typeRoles);
  const typeLevels = parseTypeLevelOverrides(value.typeLevels);

  return {
    applied: {
      catalogPairId: applied.catalogPairId as string | null,
      headingFamily: applied.headingFamily,
      bodyFamily: applied.bodyFamily,
      headingWeight: applied.headingWeight,
      bodyWeight: applied.bodyWeight,
      headingClassification: applied.headingClassification as FontClassification,
      bodyClassification: applied.bodyClassification as FontClassification,
    },
    base: value.base as TypeScaleBase,
    ratio: value.ratio as TypeScaleRatio,
    ...(Object.keys(typeRoles).length > 0 ? { typeRoles } : {}),
    ...(Object.keys(typeLevels).length > 0 ? { typeLevels } : {}),
  };
}

function parseCanvasView(value: unknown): CanvasViewId | undefined {
  return CANVAS_VIEWS.find((view) => view.id === value)?.id;
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
    // Optional blocks never invalidate an otherwise-good snapshot.
    typography: parseTypography(parsed.typography),
    canvasView: parseCanvasView(parsed.canvasView),
  };
}
