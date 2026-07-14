import type { CSSProperties } from 'react';

export type PreviewFonts = {
  headingFamily: string;
  bodyFamily: string;
};

export const DEFAULT_PREVIEW_FONTS: PreviewFonts = {
  headingFamily: 'var(--font-display)',
  bodyFamily: 'var(--font-body)',
};

/**
 * Type-role system for the layout previews.
 *
 * The previews exist to show the user's selected *heading + body font pairing*
 * against their palette. So the two families must both be visible and clearly
 * differentiated — display sets headings, body sets everything else — and weight
 * must be a real ladder (not "everything bold"), so hierarchy reads as size +
 * weight + color, letting the fonts breathe.
 *
 * Roles, from loudest to quietest:
 *  - `display`  — the one hero number/title on a surface (heading font, 600)
 *  - `heading`  — panel + section titles (heading font, 600)
 *  - `title`    — small card titles, list-item names (body font, 500)
 *  - `body`     — prose, descriptions, help text (body font, 400)
 *  - `label`    — metric labels, metadata, timestamps (body font, 400/500)
 *  - `eyebrow`  — the small caps kicker above a title (body font, 500, tracked)
 *
 * Each role returns a `style` object; the display/heading families come from the
 * caller's `PreviewFonts`, everything else uses the body family. Sizes stay as
 * Tailwind classes at the call site so per-layout responsive steps still work.
 */

type TypeRoleStyle = CSSProperties;

export function displayStyle(fonts: PreviewFonts): TypeRoleStyle {
  return { fontFamily: fonts.headingFamily, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.05 };
}

export function headingStyle(fonts: PreviewFonts): TypeRoleStyle {
  return { fontFamily: fonts.headingFamily, fontWeight: 600, letterSpacing: '-0.006em', lineHeight: 1.2 };
}

export function titleStyle(fonts: PreviewFonts): TypeRoleStyle {
  return { fontFamily: fonts.bodyFamily, fontWeight: 500, lineHeight: 1.35 };
}

export function bodyStyle(fonts: PreviewFonts, color?: string): TypeRoleStyle {
  return { fontFamily: fonts.bodyFamily, fontWeight: 400, lineHeight: 1.55, ...(color ? { color } : null) };
}

export function labelStyle(fonts: PreviewFonts, color?: string): TypeRoleStyle {
  return { fontFamily: fonts.bodyFamily, fontWeight: 500, lineHeight: 1.35, ...(color ? { color } : null) };
}

export function eyebrowStyle(fonts: PreviewFonts, color?: string): TypeRoleStyle {
  return {
    fontFamily: fonts.bodyFamily,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
    ...(color ? { color } : null),
  };
}

/** Hero display for landing surfaces — tighter tracking, balanced wrap. */
export function heroStyle(fonts: PreviewFonts): TypeRoleStyle {
  return { fontFamily: fonts.headingFamily, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.04, textWrap: 'balance' };
}
