import type { CSSProperties } from 'react';

/**
 * Type-role system for layout previews.
 *
 * Roles resolve against CSS custom properties set on the PreviewView root
 * (`--font-*`, `--weight-*`, `--size-*`). Call sites may still pass `PreviewFonts`
 * for API compatibility; family/weight/size come from the ancestor tokens.
 */

export type PreviewFonts = {
  headingFamily: string;
  bodyFamily: string;
  headingWeight?: number;
  bodyWeight?: number;
};

export const DEFAULT_PREVIEW_FONTS: PreviewFonts = {
  headingFamily: 'var(--font-heading)',
  bodyFamily: 'var(--font-body)',
};

type TypeRoleStyle = CSSProperties;

const FONT_HEADING = 'var(--font-heading)';
const FONT_BODY = 'var(--font-body)';
const WEIGHT_HEADING = 'var(--weight-heading)';
const WEIGHT_BODY = 'var(--weight-body)';

/**
 * Builds a role style from the `--role-<id>-*` variables that PreviewView sets
 * from the resolved type roles. The fallbacks keep the helpers usable outside
 * PreviewView. `--type-role` lets the click-to-edit mode find the role of any
 * element (custom properties inherit, so children resolve to their parent's).
 */
function roleStyle(
  id: string,
  family: 'heading' | 'body',
  fallbackSize: string,
  extra?: TypeRoleStyle,
  color?: string,
): TypeRoleStyle {
  return {
    ['--type-role' as string]: id,
    fontFamily: family === 'heading' ? FONT_HEADING : FONT_BODY,
    fontWeight: `var(--role-${id}-weight, ${family === 'heading' ? WEIGHT_HEADING : WEIGHT_BODY})`,
    fontSize: `var(--role-${id}-size, ${fallbackSize})`,
    lineHeight: `var(--role-${id}-lh, 1.4)`,
    letterSpacing: `var(--role-${id}-ls, 0em)`,
    ...extra,
    ...(color ? { color } : null),
  } as TypeRoleStyle;
}

export function displayStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return roleStyle('display', 'heading', 'var(--size-h2)');
}

export function headingStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return roleStyle('heading', 'heading', 'var(--size-h3)');
}

export function titleStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return roleStyle('title', 'body', 'var(--size-body)');
}

export function bodyStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return roleStyle('body', 'body', 'var(--size-body)', undefined, color);
}

export function labelStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return roleStyle('label', 'body', 'var(--size-small)', undefined, color);
}

/** Small metadata at body weight, so labels do not compete with headings. */
export function captionStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return roleStyle('caption', 'body', 'var(--size-small)', undefined, color);
}

export function eyebrowStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return roleStyle('eyebrow', 'body', 'var(--size-small)', { textTransform: 'uppercase' }, color);
}

/** Wordmarks and small headlines: the heading font at body size. */
export function brandStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return roleStyle('brand', 'heading', 'var(--size-body)');
}

/** Buttons, filters and active states: the strongest body-family weight. */
export function buttonStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return roleStyle('button', 'body', 'var(--size-small)', undefined, color);
}

/** Hero display for landing surfaces: tighter tracking, balanced wrap. */
export function heroStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return roleStyle('hero', 'heading', 'var(--size-h1)', { textWrap: 'balance' });
}

/** Weights for primitives that cannot take a full role style (badges, segmented controls). */
export const ROLE_WEIGHT = {
  caption: 'var(--role-caption-weight, var(--weight-body))',
  label: 'var(--role-label-weight, var(--weight-body))',
  button: 'var(--role-button-weight, var(--weight-body))',
} as const;

export function previewRootTypeStyle(): TypeRoleStyle {
  return { fontFamily: FONT_BODY, fontWeight: WEIGHT_BODY, ['--type-role' as string]: 'body' } as TypeRoleStyle;
}
