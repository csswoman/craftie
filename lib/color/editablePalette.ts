import type { WorkspaceSnapshot } from '../studio/workspaceSnapshot';
import {
  accentFamilyCompanionTokens,
  counterpartRoleForAccentFamilySync,
  syncAccentFamilyOverrides,
} from './accentFamily';
import type { ExtractedColor } from './imageTypes';
import { normalizeHex } from './normalizeHex';
import type { PaletteType } from './paletteClassification';
import type { PaletteRoleId } from './roleTypes';
import { getPairedOnTokenForFill } from './semanticTokenTargets';
import {
  DEFAULT_NEUTRAL_STYLE,
  deriveSemanticTokens,
  type NeutralStyle,
  type SemanticTokenName,
  type SemanticTokenOverrides,
  type SemanticTokens,
} from './semanticTokens';
import { counterpartRoleColorForTheme, oppositeTheme } from './themeCounterpartColor';
import type { ThemeId } from './themePalette';
import type { ForcedStatusColor, UiStatusRole } from './uiStatusColors';
import { VIBRANCY_MID } from './vibrancy';

/** Sub-estado que entra al historial de deshacer/rehacer. */
export type EditablePaletteState = {
  tokenOverridesByTheme: Record<ThemeId, SemanticTokenOverrides>;
  clearedSemanticTokens: SemanticTokenName[];
  roleNames: Partial<Record<PaletteRoleId, string>>;
  lockedRolesByTheme: Record<ThemeId, PaletteRoleId[]>;
  savedVibrancy: number;
  neutralStyle: NeutralStyle;
  forcedStatusSources: Partial<Record<UiStatusRole, string>>;
  forcedStatusColors: Partial<Record<UiStatusRole, ForcedStatusColor>>;
};

const EMPTY_LOCKED_BY_THEME: Record<ThemeId, PaletteRoleId[]> = {
  light: [],
  dark: [],
};
const EMPTY_OVERRIDES_BY_THEME: Record<ThemeId, SemanticTokenOverrides> = {
  light: {},
  dark: {},
};
const DATA_TOKEN_NAMES = [
  'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6',
] as const satisfies readonly SemanticTokenName[];

export const INITIAL_EDITABLE: EditablePaletteState = {
  tokenOverridesByTheme: EMPTY_OVERRIDES_BY_THEME,
  clearedSemanticTokens: [],
  roleNames: {},
  lockedRolesByTheme: EMPTY_LOCKED_BY_THEME,
  savedVibrancy: VIBRANCY_MID,
  neutralStyle: DEFAULT_NEUTRAL_STYLE,
  forcedStatusSources: {},
  forcedStatusColors: {},
};

export function editableFromSnapshot(snapshot: WorkspaceSnapshot): EditablePaletteState {
  return {
    tokenOverridesByTheme: snapshot.tokenOverridesByTheme,
    clearedSemanticTokens: snapshot.clearedSemanticTokens,
    roleNames: snapshot.roleNames,
    lockedRolesByTheme: snapshot.lockedRolesByTheme,
    savedVibrancy: snapshot.savedVibrancy,
    neutralStyle: snapshot.neutralStyle,
    forcedStatusSources: snapshot.forcedStatusSources,
    forcedStatusColors: snapshot.forcedStatusColors,
  };
}

function stripPairedOnTokens(
  overrides: SemanticTokenOverrides,
  tokenNames: SemanticTokenName[],
): SemanticTokenOverrides {
  const next = { ...overrides };
  for (const tokenName of tokenNames) {
    const pairedOn = getPairedOnTokenForFill(tokenName);
    if (pairedOn) delete next[pairedOn];
  }
  return next;
}

export function applyClearedDataTokens(
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

export type ApplyTokenOptions = {
  activeTheme: ThemeId;
  extractedColors: ExtractedColor[];
  paletteType: PaletteType | undefined;
};

export function applySemanticTokenHex(
  current: EditablePaletteState,
  tokenName: SemanticTokenName,
  hex: string,
  options: ApplyTokenOptions,
): EditablePaletteState {
  const normalized = normalizeHex(hex);
  const syncedNames = [tokenName, ...accentFamilyCompanionTokens(tokenName)];
  const counterpartRole = counterpartRoleForAccentFamilySync(tokenName);
  const otherTheme = oppositeTheme(options.activeTheme);

  const activeOverrides = stripPairedOnTokens(
    syncAccentFamilyOverrides(
      current.tokenOverridesByTheme[options.activeTheme],
      tokenName,
      normalized,
    ),
    syncedNames,
  );

  let otherOverrides: SemanticTokenOverrides = {
    ...current.tokenOverridesByTheme[otherTheme],
  };

  if (counterpartRole) {
    const otherBase = deriveSemanticTokens({
      extracted: options.extractedColors,
      overrides: otherOverrides,
      theme: otherTheme,
      neutralStyle: current.neutralStyle,
      vibrancy: current.savedVibrancy,
      paletteType: options.paletteType,
    });
    const counterpart = counterpartRoleColorForTheme(normalized, counterpartRole, otherTheme, {
      fondoHex: otherBase.background.hex,
      superficieHex: otherBase.surface.hex,
      textoHex: otherBase['on-background'].hex,
    });

    otherOverrides = stripPairedOnTokens(
      syncAccentFamilyOverrides(otherOverrides, tokenName, counterpart),
      syncedNames,
    );
  }

  return {
    ...current,
    tokenOverridesByTheme: {
      ...current.tokenOverridesByTheme,
      [options.activeTheme]: activeOverrides,
      [otherTheme]: otherOverrides,
    },
    clearedSemanticTokens: current.clearedSemanticTokens.filter(
      (name) => !syncedNames.includes(name),
    ),
  };
}

/** Removes the overrides of a token (and its synced family) from both themes. */
export function clearSemanticTokenState(
  current: EditablePaletteState,
  tokenName: SemanticTokenName,
): EditablePaletteState {
  const syncedNames = [tokenName, ...accentFamilyCompanionTokens(tokenName)];
  const dataNamesToClear = syncedNames.filter((name) => name.startsWith('data-'));

  const nextByTheme = {
    light: { ...current.tokenOverridesByTheme.light },
    dark: { ...current.tokenOverridesByTheme.dark },
  };

  for (const theme of ['light', 'dark'] as const) {
    for (const name of syncedNames) {
      delete nextByTheme[theme][name];
      const pairedOn = getPairedOnTokenForFill(name);
      if (pairedOn) {
        delete nextByTheme[theme][pairedOn];
      }
    }
  }

  const clearedSemanticTokens = [...current.clearedSemanticTokens];
  for (const name of dataNamesToClear) {
    if (!clearedSemanticTokens.includes(name as SemanticTokenName)) {
      clearedSemanticTokens.push(name as SemanticTokenName);
    }
  }

  return {
    ...current,
    tokenOverridesByTheme: nextByTheme,
    clearedSemanticTokens,
  };
}

/** Confirmed explicit status colors projected to semantic token overrides (danger → `error`). */
export function statusColorsAsTokenOverrides(
  forcedStatusColors: EditablePaletteState['forcedStatusColors'],
): SemanticTokenOverrides {
  const overrides: SemanticTokenOverrides = {};
  if (forcedStatusColors.success) overrides.success = forcedStatusColors.success.hex;
  if (forcedStatusColors.warning) overrides.warning = forcedStatusColors.warning.hex;
  if (forcedStatusColors.danger) overrides.error = forcedStatusColors.danger.hex;
  return overrides;
}
