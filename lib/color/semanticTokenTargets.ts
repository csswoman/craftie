import {
  evaluateContrast,
  getContrastStatus,
  type ContrastStatus,
  type WCAGLevel,
} from './contrast';
import type { ActiveRoleContrastInfo } from './roleInspectorContrast';
import type {
  OnTonalTokenName,
  SemanticTokenName,
  SemanticTokens,
  TonalTokenName,
} from './semanticTokens';
import { TONAL_SCALE_STEPS, TONAL_TEXT_CARRIER_STEPS } from './tonalScale';

const EXPRESSIVE_SCALE_BASES = ['primary', 'secondary', 'accent'] as const;

const TONAL_LABELS = Object.fromEntries(
  EXPRESSIVE_SCALE_BASES.flatMap((base) => [
    ...TONAL_SCALE_STEPS.map((step) => [
      `${base}-${step}`,
      `${base[0]!.toUpperCase()}${base.slice(1)} ${step}`,
    ]),
    ...TONAL_TEXT_CARRIER_STEPS.map((step) => [
      `on-${base}-${step}`,
      `On ${base} ${step}`,
    ]),
  ]),
) as Record<TonalTokenName | OnTonalTokenName, string>;

export const SEMANTIC_TOKEN_LABELS: Record<SemanticTokenName, string> = {
  background: 'Background',
  surface: 'Surface',
  'surface-elevated': 'Surface elevated',
  'background-inverse': 'Background inverse',
  'surface-inverse': 'Surface inverse',
  'surface-inverse-elevated': 'Surface inverse elevated',
  'on-background': 'On background',
  'on-surface': 'On surface',
  'on-surface-muted': 'On surface muted',
  'on-background-inverse': 'On background inverse',
  'on-surface-inverse': 'On surface inverse',
  border: 'Border',
  divider: 'Divider',
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  'on-primary': 'On primary',
  'on-secondary': 'On secondary',
  'on-accent': 'On accent',
  'hero-surface': 'Hero surface',
  'on-hero': 'On hero',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  'data-1': 'Data 1',
  'data-2': 'Data 2',
  'data-3': 'Data 3',
  'data-4': 'Data 4',
  'data-5': 'Data 5',
  'data-6': 'Data 6',
  ...TONAL_LABELS,
};

const TONAL_READABLE_PAIRS = Object.fromEntries(
  EXPRESSIVE_SCALE_BASES.flatMap((base) =>
    TONAL_TEXT_CARRIER_STEPS.flatMap((step) => [
      [`${base}-${step}`, `on-${base}-${step}`],
      [`on-${base}-${step}`, `${base}-${step}`],
    ]),
  ),
) as Partial<Record<SemanticTokenName, SemanticTokenName>>;

const READABLE_PAIRS: Partial<Record<SemanticTokenName, SemanticTokenName>> = {
  background: 'on-background',
  surface: 'on-surface',
  'on-surface-muted': 'surface',
  'background-inverse': 'on-background-inverse',
  'surface-inverse': 'on-surface-inverse',
  primary: 'on-primary',
  secondary: 'on-secondary',
  accent: 'on-accent',
  'hero-surface': 'on-hero',
  'on-background': 'background',
  'on-surface': 'surface',
  'on-background-inverse': 'background-inverse',
  'on-surface-inverse': 'surface-inverse',
  'on-primary': 'primary',
  'on-secondary': 'secondary',
  'on-accent': 'accent',
  'on-hero': 'hero-surface',
  ...TONAL_READABLE_PAIRS,
};

function buildContrastInfo(
  foregroundHex: string,
  backgroundHex: string,
  pairLabel: string,
): ActiveRoleContrastInfo {
  const evaluation = evaluateContrast(foregroundHex, backgroundHex);

  return {
    pairLabel,
    foregroundHex,
    backgroundHex,
    ratio: evaluation.ratio,
    level: evaluation.normalText as WCAGLevel,
    status: getContrastStatus(evaluation, 'AA') as ContrastStatus,
    passesAaa: evaluation.normalText === 'AAA',
  };
}

export function getSemanticTokenContrastInfo(
  tokens: SemanticTokens,
  tokenName: SemanticTokenName,
): ActiveRoleContrastInfo | null {
  const pairedToken = READABLE_PAIRS[tokenName];

  if (!pairedToken) {
    return null;
  }

  const isForeground = tokenName.startsWith('on-') || tokenName === 'on-surface-muted';
  const foreground = isForeground ? tokenName : pairedToken;
  const background = isForeground ? pairedToken : tokenName;

  return buildContrastInfo(
    tokens[foreground].hex,
    tokens[background].hex,
    `${SEMANTIC_TOKEN_LABELS[foreground]} sobre ${SEMANTIC_TOKEN_LABELS[background]}`,
  );
}
