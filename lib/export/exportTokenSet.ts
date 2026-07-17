import { isValidOpaqueHex, normalizeHex } from '../color/normalizeHex';
import { tokenNameForPaletteRole } from '../color/semanticRoleProjection';
import type { RolePalette } from '../color/rolePalette';
import type { SemanticTokenName, SemanticTokenOverrides } from '../color/semanticTokens';
import { PALETTE_ROLE_ORDER } from '../color/roleTypes';
import type { FontPair } from '../typography/pairings';

export const CORE_EXPORT_TOKENS = ['primary', 'background', 'on-background'] as const;

export type CoreExportToken = (typeof CORE_EXPORT_TOKENS)[number];

export type ExportColorValue = {
  light?: string;
  dark?: string;
};

export type ExportTypographyRole = {
  family: string;
  weight?: number;
  size?: string;
};

export type ExportTokenSet = {
  name: string;
  exportedAt: string;
  colors: Record<string, ExportColorValue>;
  typography?: {
    heading?: ExportTypographyRole;
    body?: ExportTypographyRole;
  };
  meta: {
    included: string[];
    missingCore: CoreExportToken[];
  };
};

export type BuildExportTokenSetInput = {
  rolePalette: RolePalette | null;
  tokenOverridesByTheme: {
    light: SemanticTokenOverrides;
    dark: SemanticTokenOverrides;
  };
  pairing: FontPair | null;
  name?: string;
  exportedAt?: string;
};

function tryNormalize(hex: string): string | null {
  if (!isValidOpaqueHex(hex)) return null;
  return normalizeHex(hex);
}

function setColor(
  colors: Record<string, ExportColorValue>,
  token: string,
  theme: 'light' | 'dark',
  hex: string,
) {
  const normalized = tryNormalize(hex);
  if (!normalized) return;
  const current = colors[token] ?? {};
  colors[token] = { ...current, [theme]: normalized };
}

export function buildExportTokenSet(input: BuildExportTokenSetInput): ExportTokenSet {
  const colors: Record<string, ExportColorValue> = {};

  if (input.rolePalette) {
    for (const role of PALETTE_ROLE_ORDER) {
      const token = tokenNameForPaletteRole(role);
      setColor(colors, token, 'light', input.rolePalette[role].hex);
    }
  }

  for (const [token, hex] of Object.entries(input.tokenOverridesByTheme.light) as Array<
    [SemanticTokenName, string]
  >) {
    if (hex == null || hex === '') continue;
    setColor(colors, token, 'light', hex);
  }

  for (const [token, hex] of Object.entries(input.tokenOverridesByTheme.dark) as Array<
    [SemanticTokenName, string]
  >) {
    if (hex == null || hex === '') continue;
    setColor(colors, token, 'dark', hex);
  }

  let typography: ExportTokenSet['typography'];
  if (input.pairing) {
    typography = {
      heading: {
        family: input.pairing.heading.family,
        ...(input.pairing.heading.defaultWeight != null
          ? { weight: input.pairing.heading.defaultWeight }
          : {}),
      },
      body: {
        family: input.pairing.body.family,
        ...(input.pairing.body.defaultWeight != null
          ? { weight: input.pairing.body.defaultWeight }
          : {}),
      },
    };
  }

  const included = Object.keys(colors).sort();
  const missingCore = CORE_EXPORT_TOKENS.filter((token) => {
    const value = colors[token];
    return !value?.light && !value?.dark;
  });

  return {
    name: input.name ?? 'craftie-tokens',
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    colors,
    ...(typography ? { typography } : {}),
    meta: { included, missingCore: [...missingCore] },
  };
}

export function canExportTokenSet(set: ExportTokenSet): boolean {
  return set.meta.missingCore.length === 0;
}

export function formatMissingCoreLabel(missingCore: readonly string[]): string {
  const labels: Record<string, string> = {
    primary: 'primario',
    background: 'fondo',
    'on-background': 'texto',
  };
  return missingCore.map((token) => labels[token] ?? token).join(', ');
}
