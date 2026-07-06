import {
  neutralFilledButton,
  PRIMARY_BUTTON_VARIANTS,
  primaryButtonVariant,
  primaryButtonVariantLabel,
  buttonEmphasisLabel,
  type ButtonVariantStyle,
  type PrimaryButtonVariant,
} from '../utils/buttonVariants';
import { contrastRatio, mix, readableOn } from '../utils/colorMath';
import { SEMANTIC_CHIP_STATES, semanticChipStyle } from '../utils/semanticChips';
import type { SemanticChipState } from '../utils/semanticChips';
import { deriveReadableRoleVariants, type ReadableRoleVariants } from './readableRoles';
import type { RolePalette } from './rolePalette';

const AA_TARGET = 4.5;
const SUPPORT_TINT_AMOUNT = 0.85;

export type PreviewPaintPair = {
  id: string;
  label: string;
  foreground: string;
  background: string;
};

export type PreviewContrastResult = PreviewPaintPair & {
  ratio: number;
  passesAa: boolean;
  corrected: boolean;
};

export type PreviewTokens = {
  readable: ReadableRoleVariants;
  buttons: Record<PrimaryButtonVariant, ButtonVariantStyle>;
  neutralFilled: ButtonVariantStyle;
  accentLink: { color: string; outlineColor: string };
  navbarActive: { color: string; borderColor: string };
  supportBanner: { backgroundColor: string; color: string };
  chips: Record<SemanticChipState, { backgroundColor: string; color: string; label: string }>;
  contrast: PreviewContrastResult[];
  warnings: string[];
};

function buildButtons(palette: RolePalette): Record<PrimaryButtonVariant, ButtonVariantStyle> {
  return Object.fromEntries(
    PRIMARY_BUTTON_VARIANTS.map((variant) => [variant, primaryButtonVariant(palette, variant)]),
  ) as Record<PrimaryButtonVariant, ButtonVariantStyle>;
}

function buildSupportBanner(palette: RolePalette): { backgroundColor: string; color: string } {
  const tintBackground = mix(palette.secundario.hex, palette.fondo.hex, SUPPORT_TINT_AMOUNT);

  return {
    backgroundColor: tintBackground,
    color: readableOn(palette.secundario.hex, tintBackground, AA_TARGET),
  };
}

function collectPaintPairs(
  palette: RolePalette,
  tokens: Omit<PreviewTokens, 'contrast' | 'warnings'>,
): PreviewPaintPair[] {
  const surface = palette.superficie.hex;
  const pairs: PreviewPaintPair[] = [];

  for (const variant of PRIMARY_BUTTON_VARIANTS) {
    const styles = tokens.buttons[variant];

    if (styles.backgroundColor !== 'transparent') {
      pairs.push({
        id: `button-brand-${variant}`,
        label: `Botón ${buttonEmphasisLabel('brand')} ${primaryButtonVariantLabel(variant)}`,
        foreground: styles.color,
        background: styles.backgroundColor,
      });
      continue;
    }

    pairs.push({
      id: `button-brand-${variant}-label`,
      label: `Botón ${buttonEmphasisLabel('brand')} ${primaryButtonVariantLabel(variant)}`,
      foreground: styles.color,
      background: surface,
    });
  }

  pairs.push({
    id: 'button-neutral-filled',
    label: `Botón ${buttonEmphasisLabel('neutral')} ${primaryButtonVariantLabel('filled')}`,
    foreground: tokens.neutralFilled.color,
    background: tokens.neutralFilled.backgroundColor,
  });

  pairs.push({
    id: 'accent-link',
    label: 'Enlace de acento',
    foreground: tokens.accentLink.color,
    background: surface,
  });

  pairs.push({
    id: 'navbar-active',
    label: 'Ítem activo navbar',
    foreground: tokens.navbarActive.color,
    background: surface,
  });

  pairs.push({
    id: 'support-banner',
    label: 'Sección de apoyo',
    foreground: tokens.supportBanner.color,
    background: tokens.supportBanner.backgroundColor,
  });

  for (const state of SEMANTIC_CHIP_STATES) {
    const chip = tokens.chips[state];
    pairs.push({
      id: `chip-${state}`,
      label: `Chip ${chip.label}`,
      foreground: chip.color,
      background: chip.backgroundColor,
    });
  }

  return pairs;
}

function validatePaintPairs(pairs: PreviewPaintPair[]): {
  contrast: PreviewContrastResult[];
  warnings: string[];
} {
  const contrast: PreviewContrastResult[] = [];
  const warnings: string[] = [];

  for (const pair of pairs) {
    let foreground = pair.foreground;
    let ratio = contrastRatio(foreground, pair.background);
    let corrected = ratio >= AA_TARGET;

    if (!corrected) {
      const fixedForeground = readableOn(foreground, pair.background, AA_TARGET);
      const fixedRatio = contrastRatio(fixedForeground, pair.background);

      if (fixedRatio >= AA_TARGET) {
        foreground = fixedForeground;
        ratio = fixedRatio;
        corrected = true;
      }
    }

    const passesAa = ratio >= AA_TARGET;

    contrast.push({
      ...pair,
      foreground,
      ratio,
      passesAa,
      corrected,
    });

    if (!passesAa) {
      warnings.push(
        `${pair.label} no alcanza AA (${ratio.toFixed(2)}:1) tras corrección readableOn.`,
      );
    }
  }

  return { contrast, warnings };
}

export function buildPreviewTokens(palette: RolePalette): PreviewTokens {
  const readable = deriveReadableRoleVariants(palette);
  const buttons = buildButtons(palette);
  const supportBanner = buildSupportBanner(palette);
  const neutralFilled = neutralFilledButton(palette);

  const partial = {
    readable,
    buttons,
    neutralFilled,
    accentLink: {
      color: readable.acentoReadableOnSuperficie,
      outlineColor: readable.acentoReadableOnSuperficie,
    },
    navbarActive: {
      color: readable.acentoReadableOnSuperficie,
      borderColor: readable.acentoReadableOnSuperficie,
    },
    supportBanner,
    chips: Object.fromEntries(
      SEMANTIC_CHIP_STATES.map((state) => [state, semanticChipStyle(palette, state)]),
    ) as PreviewTokens['chips'],
  };

  const pairs = collectPaintPairs(palette, partial);
  const { contrast, warnings } = validatePaintPairs(pairs);

  return {
    ...partial,
    contrast,
    warnings,
  };
}

export function hasPreviewContrastFailure(tokens: PreviewTokens): boolean {
  return tokens.contrast.some((entry) => !entry.passesAa);
}

export function getPreviewContrastWarnings(tokens: PreviewTokens): string[] {
  return tokens.warnings;
}
