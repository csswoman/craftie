import {
  UI_LAYOUT_MODES,
  type UiLayoutModeDefinition,
  type UiLayoutSlot,
} from './layoutModes';
import {
  DEFAULT_NEUTRAL_STYLE,
  type ExpressiveScaleBase,
  type NeutralStyle,
  type SemanticTokenName,
  type TonalTokenName,
} from './semanticTokens';

export type PreviewFamilyId = 'ui' | 'illustration';

export type UiPreviewFamily = {
  id: 'ui';
  label: string;
  description: string;
  modes: UiLayoutModeDefinition[];
  contract: {
    kind: 'slot-token-map';
    slots: 'ui-layout-slots';
    slotType?: UiLayoutSlot;
    neutralChromeRule: 'structural-neutrals-only-for-large-surfaces';
    neutralStyle: NeutralStyle;
  };
};

export type IllustrationPaletteInput = {
  bases: Record<ExpressiveScaleBase, SemanticTokenName>;
  tonalScales: Record<ExpressiveScaleBase, TonalTokenName[]>;
  states: Pick<Record<SemanticTokenName, SemanticTokenName>, 'success' | 'warning' | 'error'>;
};

export type IllustrationPreviewFamily = {
  id: 'illustration';
  label: string;
  description: string;
  modes: [];
  contract: {
    kind: 'full-palette-tonal-scales';
    rendererInput: IllustrationPaletteInput;
  };
};

export type PreviewFamily = UiPreviewFamily | IllustrationPreviewFamily;

export const DEFAULT_PREVIEW_FAMILY_ID: PreviewFamilyId = 'ui';

export const PREVIEW_FAMILIES: PreviewFamily[] = [
  {
    id: 'ui',
    label: 'UI',
    description: 'Product UI previews that consume semantic tokens through declarative slots.',
    modes: UI_LAYOUT_MODES,
    contract: {
      kind: 'slot-token-map',
      slots: 'ui-layout-slots',
      neutralChromeRule: 'structural-neutrals-only-for-large-surfaces',
      neutralStyle: DEFAULT_NEUTRAL_STYLE,
    },
  },
  {
    id: 'illustration',
    label: 'Illustration',
    description: 'Future renderers consume bases and tonal scales directly, without UI slots.',
    modes: [],
    contract: {
      kind: 'full-palette-tonal-scales',
      rendererInput: {
        bases: {
          primary: 'primary',
          secondary: 'secondary',
          accent: 'accent',
        },
        tonalScales: {
          primary: [
            'primary-50',
            'primary-100',
            'primary-200',
            'primary-300',
            'primary-400',
            'primary-500',
            'primary-600',
            'primary-700',
            'primary-800',
            'primary-900',
          ],
          secondary: [
            'secondary-50',
            'secondary-100',
            'secondary-200',
            'secondary-300',
            'secondary-400',
            'secondary-500',
            'secondary-600',
            'secondary-700',
            'secondary-800',
            'secondary-900',
          ],
          accent: [
            'accent-50',
            'accent-100',
            'accent-200',
            'accent-300',
            'accent-400',
            'accent-500',
            'accent-600',
            'accent-700',
            'accent-800',
            'accent-900',
          ],
        },
        states: {
          success: 'success',
          warning: 'warning',
          error: 'error',
        },
      },
    },
  },
];

export function getPreviewFamily(id: PreviewFamilyId): PreviewFamily {
  return PREVIEW_FAMILIES.find((family) => family.id === id) ?? PREVIEW_FAMILIES[0]!;
}
