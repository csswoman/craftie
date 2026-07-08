import type { ExtractedColor } from './imageExtractor';
import { toOklch } from './oklchMath';
import { deriveSemanticTokens, type SemanticTokenName } from './semanticTokens';
import {
  projectSemanticTokensToRolePalette,
  rolePaletteToSemanticOverrides,
} from './semanticRoleProjection';
import {
  DERIVED_ROLES,
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  SEED_ROLES,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
} from './roleTypes';
import {
  generatePaletteFromRolePalette,
  rolePaletteToGeneratedPalette,
  validateRolePalette,
} from './rolePaletteGenerated';
import { recomputeDerivedRoles } from './rolePaletteDerived';
export {
  assignColorToRolePalette,
  isPaletteRoleId,
  renameRoleSlot,
  replaceRoleHex,
  toggleColorInRolePalette,
} from './rolePaletteMutations';
import {
  applyUniqueRoleNames,
  buildPaletteInput,
  createRoleSlot,
} from './rolePaletteSlots';

export {
  DERIVED_ROLES,
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  SEED_ROLES,
  type ColorSource,
  type PaletteRoleId,
  type RolePalette,
  type RoleSlot,
} from './roleTypes';

export {
  generatePaletteFromRolePalette,
  rolePaletteToGeneratedPalette,
  validateRolePalette,
} from './rolePaletteGenerated';

export { recomputeDerivedRoles } from './rolePaletteDerived';

export type PaletteSeeds = {
  primario: string;
  acento: string;
  neutralHue: number;
  extracted?: ExtractedColor[];
  vibrancy?: number;
};

export function extractSeedsFromPalette(palette: RolePalette): PaletteSeeds {
  const fondo = toOklch(palette.fondo.hex);
  const primario = toOklch(palette.primario.hex);

  return {
    primario: palette.primario.hex,
    acento: palette.acento.hex,
    neutralHue: fondo?.h ?? primario?.h ?? 0,
  };
}

export function buildBasePalette(
  slots: { fondo: string; primario: string; acento: string },
  sources?: Partial<Record<'fondo' | 'primario' | 'acento', ColorSource>>,
): RolePalette {
  const paletteInput = buildPaletteInput(slots);
  const palette = {} as RolePalette;

  palette.fondo = createRoleSlot(
    'fondo',
    slots.fondo,
    sources?.fondo ?? 'derived',
    paletteInput,
  );
  palette.primario = createRoleSlot(
    'primario',
    slots.primario,
    sources?.primario ?? 'derived',
    paletteInput,
  );
  palette.acento = createRoleSlot(
    'acento',
    slots.acento,
    sources?.acento ?? 'derived',
    paletteInput,
  );

  for (const role of DERIVED_ROLES) {
    if (role === 'fondo') {
      continue;
    }

    palette[role] = createRoleSlot(role, slots.fondo, 'derived', paletteInput);
  }

  return palette;
}

export function buildPaletteFromSeeds(
  seeds: PaletteSeeds,
  theme: 'light' | 'dark' = 'light',
  lockedRoles: PaletteRoleId[] = [],
): RolePalette {
  const extracted =
    seeds.extracted ??
    [
      { hex: seeds.primario, prominence: 1 },
      { hex: seeds.acento, prominence: 0.9 },
    ];
  const tokens = deriveSemanticTokens({
    extracted,
    overrides: {
      primary: seeds.primario,
      accent: seeds.acento,
    },
    theme,
    vibrancy: seeds.vibrancy,
  });
  const projected = projectSemanticTokensToRolePalette(tokens);

  return lockedRoles.length > 0 ? projected : projected;
}

/** @deprecated Use buildBasePalette */
export function buildSeedPalette(
  seeds: { fondo: string; primario: string; acento: string },
  seedSources?: Partial<Record<'fondo' | 'primario' | 'acento', ColorSource>>,
): RolePalette {
  return buildBasePalette(seeds, seedSources);
}

export function finalizeRolePalette(palette: RolePalette): RolePalette {
  return applyUniqueRoleNames(palette);
}

export function assignRolesFromExtracted(
  extracted: ExtractedColor[],
  theme: 'light' | 'dark' = 'light',
): RolePalette {
  return projectSemanticTokensToRolePalette(deriveSemanticTokens({ extracted, theme }));
}

export function assignRolesFromHexes(hexes: string[]): RolePalette {
  const extracted: ExtractedColor[] = hexes.map((hex, index) => ({
    hex,
    prominence: 1 - index * 0.05,
  }));

  return assignRolesFromExtracted(extracted);
}

export function mergeRolePalettePreservingLocks(
  current: RolePalette,
  next: RolePalette,
  lockedRoles: PaletteRoleId[],
): RolePalette {
  if (lockedRoles.length === 0) {
    return next;
  }

  const locked = new Set<PaletteRoleId>(lockedRoles);
  const merged = { ...next };

  for (const role of PALETTE_ROLE_ORDER) {
    if (locked.has(role)) {
      merged[role] = current[role];
    }
  }

  return applyUniqueRoleNames(merged);
}

export function deriveRolePaletteFromSemanticInput({
  extracted,
  overrides,
  names,
  theme = 'light',
  vibrancy,
}: {
  extracted: ExtractedColor[];
  overrides?: Partial<Record<SemanticTokenName, string>>;
  names?: Partial<Record<PaletteRoleId, string>>;
  theme?: 'light' | 'dark';
  vibrancy?: number;
}): RolePalette {
  return projectSemanticTokensToRolePalette(
    deriveSemanticTokens({ extracted, overrides, theme, vibrancy }),
    names,
  );
}

export function rolePaletteAsSemanticOverrides(
  palette: RolePalette,
): Partial<Record<SemanticTokenName, string>> {
  return rolePaletteToSemanticOverrides(palette);
}

