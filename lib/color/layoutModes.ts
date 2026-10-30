import { pickActionFillTokens } from './actionFill';
import type { SemanticTokenName, SemanticTokens } from './semanticTokens';

export type UiLayoutModeId = 'dashboard' | 'landing' | 'media' | 'analytics' | 'mobile' | 'editorial' | 'store';

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
  | 'brand1'
  | 'brand2'
  | 'brand3'
  | 'brand4'
  | 'brand5'
  | 'brand6'
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
  // Decorative swatches (tags, avatars, product images, palette tiles) use the
  // palette's own colors at their true value. data1-6 are chart colors, with
  // lightness adjusted for 3:1 contrast, and must not stand in for the brand.
  brand1: 'primary',
  brand2: 'secondary',
  brand3: 'accent',
  brand4: 'primary-300',
  brand5: 'secondary-300',
  brand6: 'accent-300',
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
    label: 'Reproductor',
    description: 'Theme-aware player surface with vibrant controls and restrained elevated panels.',
    commonSlots: baseCommonSlots,
    modeSlots: {
      secondaryAction: 'surface',
      secondaryActionText: 'on-surface',
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
  {
    id: 'mobile',
    label: 'Mobile',
    description: 'Compact phone screen: neutral chrome, one primary action, expressive data chips.',
    commonSlots: baseCommonSlots,
    modeSlots: {
      secondaryAction: 'secondary',
      secondaryActionText: 'on-secondary',
    },
  },
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Long-form reading page: neutral surfaces, one accent, text-first hierarchy.',
    commonSlots: baseCommonSlots,
  },
  {
    id: 'store',
    label: 'Tienda',
    description: 'Storefront: neutral product grid, one clear purchase action, expressive product swatches.',
    commonSlots: baseCommonSlots,
  },
];

export function getUiLayoutMode(id: UiLayoutModeId): UiLayoutModeDefinition {
  return UI_LAYOUT_MODES.find((mode) => mode.id === id) ?? UI_LAYOUT_MODES[0]!;
}

export function layoutModeTokenEntries(
  mode: UiLayoutModeDefinition,
  tokens?: SemanticTokens,
): Array<[UiLayoutSlot, SemanticTokenName]> {
  const entries: Array<[UiLayoutSlot, SemanticTokenName]> = [
    ...(Object.entries(mode.commonSlots) as Array<[UiCommonLayoutSlot, SemanticTokenName]>),
    ...(Object.entries(mode.modeSlots ?? {}) as Array<[UiModeLayoutSlot, SemanticTokenName]>),
  ];

  if (!tokens || mode.commonSlots.primaryAction !== 'primary') {
    return entries;
  }

  const action = pickActionFillTokens(tokens);

  return entries.map(([slot, tokenName]) => {
    if (slot === 'primaryAction') return [slot, action.fill];
    if (slot === 'primaryActionText') return [slot, action.on];
    return [slot, tokenName];
  });
}

export function resolveLayoutColors(
  mode: LayoutModeDefinition,
  tokens: SemanticTokens,
): ResolvedLayoutColors {
  return Object.fromEntries(
    layoutModeTokenEntries(mode, tokens).map(([slot, tokenName]) => {
      const entry = tokens[tokenName];
      // A gap with a suggestion (status colors not confirmed yet) previews in
      // the suggested color instead of a flat gray placeholder.
      return [slot, entry.gap && entry.suggestedHex ? entry.suggestedHex : entry.hex];
    }),
  ) as ResolvedLayoutColors;
}

export type LayoutModeId = UiLayoutModeId;
export type LayoutSlot = UiLayoutSlot;
export type LayoutModeDefinition = UiLayoutModeDefinition;
export const LAYOUT_MODES = UI_LAYOUT_MODES;
export const getLayoutMode = getUiLayoutMode;
