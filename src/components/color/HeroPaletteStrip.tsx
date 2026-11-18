import { contrastRatio } from '@lib/utils/colorMath';

/**
 * Sample palette (sampled from the mascot illustration) shown as the visual
 * anchor of the empty home screen. Palette First: the only saturated colour on
 * the page. Each swatch states its real contrast ratio (Show, don't tell).
 * Decorative: the same information is conveyed by the pillars copy, so the
 * strip is hidden from assistive tech.
 */
const SAMPLE_SWATCHES = [
  { hex: '#1f3b4d', grow: 1.1 },
  { hex: '#5fb7ab', grow: 1.5 },
  { hex: '#f2b49a', grow: 1.2 },
  { hex: '#f3d98b', grow: 1.7 },
  { hex: '#f6ecd2', grow: 1 },
] as const;

const INK = '#1a2420';
const WHITE = '#ffffff';

function pickForeground(bg: string): { fg: string; ratio: number } {
  const onInk = contrastRatio(INK, bg);
  const onWhite = contrastRatio(WHITE, bg);
  return onInk >= onWhite ? { fg: INK, ratio: onInk } : { fg: WHITE, ratio: onWhite };
}

export function HeroPaletteStrip() {
  return (
    <div aria-hidden="true" className="flex h-24 w-full gap-2 sm:h-32 lg:h-36">
      {SAMPLE_SWATCHES.map(({ hex, grow }) => {
        const { fg, ratio } = pickForeground(hex);
        return (
          <div
            key={hex}
            style={{ backgroundColor: hex, color: fg, flexGrow: grow }}
            className="flex min-w-0 basis-0 flex-col justify-end rounded-lg p-2.5 sm:p-3"
          >
            <span className="font-body text-chrome-label font-semibold uppercase tabular-nums">
              {hex.slice(1)}
            </span>
            <span className="hidden text-chrome-caption tabular-nums sm:block">
              {ratio.toFixed(1)}:1
            </span>
          </div>
        );
      })}
    </div>
  );
}
