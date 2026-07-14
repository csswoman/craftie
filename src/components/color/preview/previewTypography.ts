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
const WEIGHT_UI = 'var(--weight-ui)';

export function displayStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return {
    fontFamily: FONT_HEADING,
    fontWeight: WEIGHT_HEADING,
    letterSpacing: '-0.01em',
    lineHeight: 1.05,
    fontSize: 'var(--size-h2)',
  };
}

export function headingStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return {
    fontFamily: FONT_HEADING,
    fontWeight: WEIGHT_HEADING,
    letterSpacing: '-0.006em',
    lineHeight: 1.2,
    fontSize: 'var(--size-h3)',
  };
}

export function titleStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return {
    fontFamily: FONT_BODY,
    fontWeight: 500,
    lineHeight: 1.35,
    fontSize: 'var(--size-body)',
  };
}

export function bodyStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return {
    fontFamily: FONT_BODY,
    fontWeight: WEIGHT_BODY,
    lineHeight: 1.55,
    fontSize: 'var(--size-body)',
    ...(color ? { color } : null),
  };
}

export function labelStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return {
    fontFamily: FONT_BODY,
    fontWeight: WEIGHT_UI,
    lineHeight: 1.35,
    fontSize: 'var(--size-small)',
    ...(color ? { color } : null),
  };
}

export function eyebrowStyle(_fonts?: PreviewFonts, color?: string): TypeRoleStyle {
  return {
    fontFamily: FONT_BODY,
    fontWeight: WEIGHT_UI,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
    fontSize: 'var(--size-small)',
    ...(color ? { color } : null),
  };
}

/** Hero display for landing surfaces — tighter tracking, balanced wrap. */
export function heroStyle(_fonts?: PreviewFonts): TypeRoleStyle {
  return {
    fontFamily: FONT_HEADING,
    fontWeight: WEIGHT_HEADING,
    letterSpacing: '-0.02em',
    lineHeight: 1.04,
    textWrap: 'balance',
    fontSize: 'var(--size-h1)',
  };
}

export function previewRootTypeStyle(): TypeRoleStyle {
  return { fontFamily: FONT_BODY };
}
