import { PALETTE_ROLE_ORDER, type RolePalette } from '../color/roleTypes';

/** A single rectangle, in device-independent pixels, inside the share card. */
export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** A swatch to paint: its rectangle, the fill hex, the role label and a
 * text color that reads safely over the swatch. */
export type SwatchLayout = {
  role: string;
  label: string;
  hex: string;
  rect: Rect;
  /** Hex to use for the role label drawn over the swatch. */
  labelColor: string;
};

/** A positioned text anchor (top-left baseline box) with a font size. */
export type TextAnchor = {
  text: string;
  x: number;
  y: number;
  fontSize: number;
};

export type ShareCardLayout = {
  width: number;
  height: number;
  /** Paper/background fill for the whole card. */
  background: string;
  /** Primary ink color for the title + body text. */
  ink: string;
  title: TextAnchor;
  /** Font-pair line ("Heading / Body"), present only when a pairing is given. */
  pairing: TextAnchor | null;
  swatches: SwatchLayout[];
};

/** Roles painted on the card, in a deliberate reading order. */
const CARD_ROLE_ORDER = PALETTE_ROLE_ORDER;

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const CARD_PADDING = 64;
const TITLE_FONT_SIZE = 56;
const PAIRING_FONT_SIZE = 28;
const SWATCH_LABEL_FONT_SIZE = 22;
const HEADER_BLOCK_HEIGHT = 190;
const SWATCH_GAP = 16;
const SWATCH_LABEL_INSET = 20;

export type ShareCardInput = {
  palette: RolePalette;
  title: string;
  pairing?: { heading: string; body: string } | null;
};

/**
 * Computes a deterministic layout for the share card: overall canvas size,
 * one swatch rectangle per role laid out as an even horizontal strip, and
 * text anchors for the title and optional font-pair line. No DOM / canvas.
 */
export function computeShareCardLayout({
  palette,
  title,
  pairing,
}: ShareCardInput): ShareCardLayout {
  const background = palette.fondo.hex;
  const ink = palette.texto.hex;

  const stripTop = CARD_PADDING + HEADER_BLOCK_HEIGHT;
  const stripHeight = CARD_HEIGHT - stripTop - CARD_PADDING;
  const stripWidth = CARD_WIDTH - CARD_PADDING * 2;

  const count = CARD_ROLE_ORDER.length;
  const totalGap = SWATCH_GAP * (count - 1);
  const swatchWidth = (stripWidth - totalGap) / count;

  const swatches: SwatchLayout[] = CARD_ROLE_ORDER.map((role, index) => {
    const slot = palette[role];
    const x = CARD_PADDING + index * (swatchWidth + SWATCH_GAP);
    return {
      role,
      label: slot.name,
      hex: slot.hex,
      rect: {
        x,
        y: stripTop,
        width: swatchWidth,
        height: stripHeight,
      },
      labelColor: readableTextColor(slot.hex),
    };
  });

  const titleAnchor: TextAnchor = {
    text: title,
    x: CARD_PADDING,
    y: CARD_PADDING + TITLE_FONT_SIZE,
    fontSize: TITLE_FONT_SIZE,
  };

  const pairingAnchor: TextAnchor | null = pairing
    ? {
      text: `${pairing.heading} / ${pairing.body}`,
      x: CARD_PADDING,
      y: CARD_PADDING + TITLE_FONT_SIZE + 48,
      fontSize: PAIRING_FONT_SIZE,
    }
    : null;

  return {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    background,
    ink,
    title: titleAnchor,
    pairing: pairingAnchor,
    swatches,
  };
}

/** Inset (from the swatch bottom-left) where a role label baseline sits. */
export function swatchLabelAnchor(swatch: SwatchLayout): TextAnchor {
  return {
    text: swatch.label,
    x: swatch.rect.x + SWATCH_LABEL_INSET / 2,
    y: swatch.rect.y + swatch.rect.height - SWATCH_LABEL_INSET,
    fontSize: SWATCH_LABEL_FONT_SIZE,
  };
}

const DARK_INK = '#111111';
const LIGHT_INK = '#FFFFFF';

/**
 * Picks black or white for a label over a swatch: whichever yields the higher
 * WCAG contrast ratio against the fill. Original implementation, no third-party
 * data. Ties favor dark ink to match the Quiet Gallery look.
 */
export function readableTextColor(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) {
    return DARK_INK;
  }
  const fill = relativeLuminance(rgb);
  const darkContrast = contrastRatio(fill, 0);
  const lightContrast = contrastRatio(fill, 1);
  return darkContrast >= lightContrast ? DARK_INK : LIGHT_INK;
}

function contrastRatio(lumA: number, lumB: number): number {
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    return null;
  }
  const value = match[1];
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}
