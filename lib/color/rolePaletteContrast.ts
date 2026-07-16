import {
  evaluateContrast,
  getContrastStatus,
  type ContrastStatus,
  type WCAGLevel,
} from './contrast';
import type { PaletteColumnDisplay } from './paletteDisplay';
import { buildRolePaletteColumns } from './paletteDisplay';
import {
  buildPreviewTokens,
  getPreviewContrastWarnings,
  hasPreviewContrastFailure,
} from './previewTokens';
import { deriveReadableRoleVariants } from './readableRoles';
import { isPaletteRoleId, type PaletteRoleId, type RolePalette } from './rolePalette';

export type RoleContrastPairId = 'texto/fondo' | 'texto/superficie';

export type RoleContrastCheck = {
  pairId: RoleContrastPairId;
  foregroundRole: 'texto';
  backgroundRole: 'fondo' | 'superficie';
  ratio: number;
  normalText: WCAGLevel;
  status: ContrastStatus;
};

export type ChromaticReadableTextCheck = {
  role: 'primario' | 'secundario' | 'acento';
  textLabel: 'claro' | 'oscuro';
  ratio: number;
  normalText: WCAGLevel;
  status: ContrastStatus;
};

export type RoleContrastBadgeDisplay = {
  label: string;
  ratio: number;
  level: WCAGLevel;
  status: ContrastStatus;
};

const PAIR_LABELS: Record<RoleContrastPairId, string> = {
  'texto/fondo': 'vs Fondo',
  'texto/superficie': 'vs Superficie',
};

const CHROMATIC_TEXT_LABELS: Record<'claro' | 'oscuro', string> = {
  claro: 'Texto claro',
  oscuro: 'Texto legible',
};

export function getRolePaletteContrastChecks(palette: RolePalette): RoleContrastCheck[] {
  const pairs: Array<{ pairId: RoleContrastPairId; backgroundRole: 'fondo' | 'superficie' }> = [
    { pairId: 'texto/fondo', backgroundRole: 'fondo' },
    { pairId: 'texto/superficie', backgroundRole: 'superficie' },
  ];

  return pairs.map(({ pairId, backgroundRole }) => {
    const evaluation = evaluateContrast(palette.texto.hex, palette[backgroundRole].hex);

    return {
      pairId,
      foregroundRole: 'texto',
      backgroundRole,
      ratio: evaluation.ratio,
      normalText: evaluation.normalText,
      status: getContrastStatus(evaluation, 'AA'),
    };
  });
}

export function getChromaticReadableTextChecks(palette: RolePalette): ChromaticReadableTextCheck[] {
  const readable = deriveReadableRoleVariants(palette);
  const checks: Array<{
    role: 'primario' | 'secundario' | 'acento';
    foreground: string;
    background: string;
    textLabel: 'claro' | 'oscuro';
  }> = [
    {
      role: 'primario',
      foreground: readable.primarioReadable,
      background: palette.superficie.hex,
      textLabel: 'oscuro',
    },
    {
      role: 'secundario',
      foreground: readable.secundarioReadable,
      background: palette.superficie.hex,
      textLabel: 'oscuro',
    },
    {
      role: 'acento',
      foreground: readable.acentoReadableOnFondo,
      background: palette.fondo.hex,
      textLabel: 'oscuro',
    },
  ];

  return checks.map(({ role, foreground, background, textLabel }) => {
    const evaluation = evaluateContrast(foreground, background);

    return {
      role,
      textLabel,
      ratio: evaluation.ratio,
      normalText: evaluation.normalText,
      status: getContrastStatus(evaluation, 'AA'),
    };
  });
}

export function hasRolePaletteContrastFailure(palette: RolePalette): boolean {
  const neutralFailure = getRolePaletteContrastChecks(palette).some((check) => check.status === 'fail');
  const chromaticFailure = getChromaticReadableTextChecks(palette).some(
    (check) => check.status === 'fail',
  );
  const previewFailure = hasPreviewContrastFailure(buildPreviewTokens(palette));

  return neutralFailure || chromaticFailure || previewFailure;
}

export function getRolePaletteContrastWarnings(palette: RolePalette): string[] {
  const warnings = getRolePaletteContrastChecks(palette)
    .filter((check) => check.status === 'fail')
    .map(
      (check) =>
        `Texto ${PAIR_LABELS[check.pairId].toLowerCase()} no alcanza AA (${check.ratio.toFixed(2)}:1).`,
    );

  const chromaticWarnings = getChromaticReadableTextChecks(palette)
    .filter((check) => check.status === 'fail')
    .map(
      (check) =>
        `${check.role}: el mejor texto (${check.textLabel}) no alcanza AA (${check.ratio.toFixed(2)}:1).`,
    );

  const previewWarnings = getPreviewContrastWarnings(buildPreviewTokens(palette));

  return [...warnings, ...chromaticWarnings, ...previewWarnings];
}

function toNeutralBadge(check: RoleContrastCheck): RoleContrastBadgeDisplay {
  return {
    label: PAIR_LABELS[check.pairId],
    ratio: check.ratio,
    level: check.normalText,
    status: check.status,
  };
}

function toChromaticBadge(check: ChromaticReadableTextCheck): RoleContrastBadgeDisplay {
  return {
    label: CHROMATIC_TEXT_LABELS[check.textLabel],
    ratio: check.ratio,
    level: check.normalText,
    status: check.status,
  };
}

function previewPairRole(pairId: string): PaletteRoleId | null {
  if (pairId.startsWith('button-brand-')) {
    return 'primario';
  }

  if (pairId === 'button-neutral-filled') {
    return 'texto';
  }

  if (pairId === 'accent-link' || pairId === 'navbar-active') {
    return 'acento';
  }

  if (pairId === 'support-banner') {
    return 'secundario';
  }

  return null;
}

function toPreviewFailBadge(pair: {
  label: string;
  ratio: number;
}): RoleContrastBadgeDisplay {
  return {
    label: pair.label,
    ratio: pair.ratio,
    level: 'fail',
    status: 'fail',
  };
}

function mergeBadges(
  ...groups: Array<RoleContrastBadgeDisplay[] | undefined>
): RoleContrastBadgeDisplay[] | undefined {
  const merged = groups.flatMap((group) => group ?? []);
  return merged.length > 0 ? merged : undefined;
}

export function buildRolePaletteColumnsWithContrast(palette: RolePalette): PaletteColumnDisplay[] {
  const columns = buildRolePaletteColumns(palette);
  const neutralChecks = getRolePaletteContrastChecks(palette);
  const chromaticChecks = getChromaticReadableTextChecks(palette);
  const checksByBackground = new Map(neutralChecks.map((check) => [check.backgroundRole, check]));
  const chromaticByRole = new Map(chromaticChecks.map((check) => [check.role, check]));
  const previewFailBadgesByRole = new Map<PaletteRoleId, RoleContrastBadgeDisplay[]>();

  for (const entry of buildPreviewTokens(palette).contrast) {
    if (entry.passesAa) {
      continue;
    }

    const role = previewPairRole(entry.id);
    if (!role) {
      continue;
    }

    const existing = previewFailBadgesByRole.get(role) ?? [];
    existing.push(toPreviewFailBadge(entry));
    previewFailBadgesByRole.set(role, existing);
  }

  return columns.map((column) => {
    const previewBadges = isPaletteRoleId(column.id)
      ? previewFailBadgesByRole.get(column.id)
      : undefined;

    if (column.id === 'texto') {
      return {
        ...column,
        contrastBadges: mergeBadges(neutralChecks.map(toNeutralBadge), previewBadges),
      };
    }

    if (column.id === 'fondo' || column.id === 'superficie') {
      const check = checksByBackground.get(column.id);

      return {
        ...column,
        contrastBadges: mergeBadges(check ? [toNeutralBadge(check)] : undefined, previewBadges),
      };
    }

    if (column.id === 'primario' || column.id === 'secundario' || column.id === 'acento') {
      const check = chromaticByRole.get(column.id);

      return {
        ...column,
        contrastBadges: mergeBadges(check ? [toChromaticBadge(check)] : undefined, previewBadges),
      };
    }

    return previewBadges ? { ...column, contrastBadges: previewBadges } : column;
  });
}

export function isRoleContrastRelevant(role: PaletteRoleId): boolean {
  return (
    role === 'texto' ||
    role === 'fondo' ||
    role === 'superficie' ||
    role === 'primario' ||
    role === 'secundario' ||
    role === 'acento'
  );
}
