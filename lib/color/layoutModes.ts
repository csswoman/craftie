import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

export type UiLayoutModeId = 'dashboard' | 'landing' | 'media' | 'analytics';

export type UiCommonLayoutSlot =
  | 'appBackground'
  | 'chrome'
  | 'surface'
  | 'surfaceElevated'
  | 'text'
  | 'mutedText'
  | 'border'
  | 'divider'
  | 'primaryAction'
  | 'primaryActionText'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'data1'
  | 'data2'
  | 'data3'
  | 'data4'
  | 'data5'
  | 'data6';

export type UiModeLayoutSlot =
  | 'secondaryAction'
  | 'secondaryActionText'
  | 'heroSurface'
  | 'onHero'
  | 'supportSurface'
  | 'supportSurfaceText';

export type UiLayoutSlot = UiCommonLayoutSlot | UiModeLayoutSlot;

export type UiLayoutModeDefinition = {
  id: UiLayoutModeId;
  label: string;
  description: string;
  commonSlots: Record<UiCommonLayoutSlot, SemanticTokenName>;
  modeSlots?: Partial<Record<UiModeLayoutSlot, SemanticTokenName>>;
};

export type ResolvedLayoutColors =
  Record<UiCommonLayoutSlot, string> & Partial<Record<UiModeLayoutSlot, string>>;

const baseCommonSlots: Record<UiCommonLayoutSlot, SemanticTokenName> = {
  appBackground: 'background',
  chrome: 'surface',
  surface: 'surface',
  surfaceElevated: 'surface-elevated',
  text: 'on-surface',
  mutedText: 'on-surface-muted',
  border: 'border',
  divider: 'divider',
  primaryAction: 'primary',
  primaryActionText: 'on-primary',
  accent: 'accent',
  success: 'success',
  warning: 'warning',
  error: 'error',
  data1: 'data-1',
  data2: 'data-2',
  data3: 'data-3',
  data4: 'data-4',
  data5: 'data-5',
  data6: 'data-6',
};

export const UI_LAYOUT_MODES: UiLayoutModeDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Neutral workspace chrome with expressive color reserved for actions and key data.',
    commonSlots: baseCommonSlots,
  },
  {
    id: 'landing',
    label: 'Landing',
    description: 'Primary-led hero and CTA, secondary support sections, neutral body chrome.',
    commonSlots: baseCommonSlots,
    modeSlots: {
      heroSurface: 'hero-surface',
      onHero: 'on-hero',
      secondaryAction: 'secondary',
      secondaryActionText: 'on-secondary',
      supportSurface: 'surface',
      supportSurfaceText: 'on-surface',
    },
  },
  {
    id: 'media',
    label: 'Music/media',
    description: 'Atmospheric dark surface with vibrant controls and restrained elevated panels.',
    commonSlots: {
      ...baseCommonSlots,
      appBackground: 'background-inverse',
      chrome: 'surface-inverse',
      surface: 'surface-inverse',
      surfaceElevated: 'surface-inverse-elevated',
      text: 'on-surface-inverse',
      mutedText: 'on-surface-inverse',
      primaryAction: 'accent',
      primaryActionText: 'on-accent',
    },
    modeSlots: {
      secondaryAction: 'surface-inverse',
      secondaryActionText: 'on-surface-inverse',
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Strictly neutral chrome with expressive tokens used only as data series.',
    commonSlots: {
      ...baseCommonSlots,
      primaryAction: 'surface',
      primaryActionText: 'on-surface',
      accent: 'data-1',
    },
  },
];

export function getUiLayoutMode(id: UiLayoutModeId): UiLayoutModeDefinition {
  return UI_LAYOUT_MODES.find((mode) => mode.id === id) ?? UI_LAYOUT_MODES[0]!;
}

export function layoutModeTokenEntries(
  mode: UiLayoutModeDefinition,
): Array<[UiLayoutSlot, SemanticTokenName]> {
  return [
    ...(Object.entries(mode.commonSlots) as Array<[UiCommonLayoutSlot, SemanticTokenName]>),
    ...(Object.entries(mode.modeSlots ?? {}) as Array<[UiModeLayoutSlot, SemanticTokenName]>),
  ];
}

export function resolveLayoutColors(
  mode: LayoutModeDefinition,
  tokens: SemanticTokens,
): ResolvedLayoutColors {
  return Object.fromEntries(
    layoutModeTokenEntries(mode).map(([slot, tokenName]) => [slot, tokens[tokenName].hex]),
  ) as ResolvedLayoutColors;
}

export type LayoutModeId = UiLayoutModeId;
export type LayoutSlot = UiLayoutSlot;
export type LayoutModeDefinition = UiLayoutModeDefinition;
export const LAYOUT_MODES = UI_LAYOUT_MODES;
export const getLayoutMode = getUiLayoutMode;
