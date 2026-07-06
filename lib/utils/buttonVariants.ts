import type { RolePalette } from '../color/rolePalette';
import { bestTextOn, mix, readableOn } from './colorMath';

export type ButtonEmphasis = 'brand' | 'neutral';
export type PrimaryButtonVariant = 'filled' | 'tonal' | 'ghost' | 'text';

export type ButtonVariantStyle = {
  backgroundColor: string;
  color: string;
  borderColor?: string;
  emphasis: ButtonEmphasis;
};

const VARIANT_LABELS: Record<PrimaryButtonVariant, string> = {
  filled: 'Filled',
  tonal: 'Tonal',
  ghost: 'Ghost',
  text: 'Text',
};

const EMPHASIS_LABELS: Record<ButtonEmphasis, string> = {
  brand: 'Marca',
  neutral: 'Neutral',
};

export function primaryButtonVariantLabel(variant: PrimaryButtonVariant): string {
  return VARIANT_LABELS[variant];
}

export function buttonEmphasisLabel(emphasis: ButtonEmphasis): string {
  return EMPHASIS_LABELS[emphasis];
}

export const PRIMARY_BUTTON_VARIANTS: PrimaryButtonVariant[] = [
  'filled',
  'tonal',
  'ghost',
  'text',
];

function brandButtonVariant(
  palette: RolePalette,
  variant: PrimaryButtonVariant,
): ButtonVariantStyle {
  const primary = palette.primario.hex;
  const surface = palette.superficie.hex;
  const border = palette.borde.hex;
  const onPrimary = bestTextOn(primary);
  const onSurface = readableOn(primary, surface);

  switch (variant) {
    case 'filled':
      return {
        emphasis: 'brand',
        backgroundColor: primary,
        color: onPrimary,
      };
    case 'tonal': {
      const tonalBackground = mix(primary, surface, 0.85);

      return {
        emphasis: 'brand',
        backgroundColor: tonalBackground,
        color: readableOn(primary, tonalBackground),
      };
    }
    case 'ghost':
      return {
        emphasis: 'brand',
        backgroundColor: 'transparent',
        color: onSurface,
        borderColor: mix(onSurface, border, 0.45),
      };
    case 'text':
      return {
        emphasis: 'brand',
        backgroundColor: 'transparent',
        color: onSurface,
      };
  }
}

function neutralButtonVariant(
  palette: RolePalette,
  variant: PrimaryButtonVariant,
): ButtonVariantStyle {
  const canvas = palette.fondo.hex;
  const ink = palette.texto.hex;
  const surface = palette.superficie.hex;
  const border = palette.borde.hex;

  switch (variant) {
    case 'filled':
      return {
        emphasis: 'neutral',
        backgroundColor: ink,
        color: canvas,
      };
    case 'tonal': {
      const tonalBackground = mix(ink, surface, 0.85);

      return {
        emphasis: 'neutral',
        backgroundColor: tonalBackground,
        color: canvas,
      };
    }
    case 'ghost':
      return {
        emphasis: 'neutral',
        backgroundColor: 'transparent',
        color: ink,
        borderColor: mix(ink, border, 0.45),
      };
    case 'text':
      return {
        emphasis: 'neutral',
        backgroundColor: 'transparent',
        color: ink,
      };
  }
}

/** Button styles with brand or neutral emphasis. */
export function buttonVariant(
  palette: RolePalette,
  variant: PrimaryButtonVariant,
  emphasis: ButtonEmphasis = 'brand',
): ButtonVariantStyle {
  return emphasis === 'neutral'
    ? neutralButtonVariant(palette, variant)
    : brandButtonVariant(palette, variant);
}

/** @deprecated Use buttonVariant with emphasis "brand". */
export function primaryButtonVariant(
  palette: RolePalette,
  variant: PrimaryButtonVariant,
): ButtonVariantStyle {
  return buttonVariant(palette, variant, 'brand');
}

export function primaryButtonVariants(
  palette: RolePalette,
): Record<PrimaryButtonVariant, ButtonVariantStyle> {
  return Object.fromEntries(
    PRIMARY_BUTTON_VARIANTS.map((variant) => [variant, buttonVariant(palette, variant, 'brand')]),
  ) as Record<PrimaryButtonVariant, ButtonVariantStyle>;
}

export function neutralFilledButton(palette: RolePalette): ButtonVariantStyle {
  return buttonVariant(palette, 'filled', 'neutral');
}
