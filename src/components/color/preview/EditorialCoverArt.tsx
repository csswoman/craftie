import { useId } from 'react';

import type { ResolvedLayoutColors, UiLayoutSlot } from '@lib/color/layoutModes';

import { paletteTint } from './previewButtons';
import type { PreviewSlotEditHandler } from './PreviewSlotTarget';
import { glazeTones, svgSlot } from './storeArtParts';

const LAYER_SLOTS = ['brand1', 'brand2', 'brand3', 'accent'] as const satisfies readonly UiLayoutSlot[];

/**
 * Lead image for the article: a layered landscape at golden hour, painted with
 * the palette (sun, three hill bands, cypresses). `seed` rotates which color
 * takes which layer, so the related-reading thumbnails differ from the cover.
 */
export function EditorialCoverArt({
  colors,
  seed = 0,
  className = '',
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  seed?: number;
  className?: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const uid = useId().replace(/:/g, '');
  const slotAt = (index: number) => LAYER_SLOTS[(index + seed) % LAYER_SLOTS.length]!;
  const [near, mid, far, sun] = [slotAt(0), slotAt(1), slotAt(2), slotAt(3)];
  const paper = colors.appBackground;
  const skyTop = paletteTint(colors[far], paper, 0.16);
  const skyLow = paletteTint(colors[sun], paper, 0.34);
  const farFill = paletteTint(colors[far], skyLow, 0.6);
  const sunTones = glazeTones(colors[sun]);
  const nearTones = glazeTones(colors[near]);
  const edit = onEditSlot && seed === 0 ? onEditSlot : undefined;

  return (
    <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" className={`block ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyLow} />
        </linearGradient>
        <radialGradient id={`${uid}-sun`} cx="0.42" cy="0.4" r="0.65">
          <stop offset="0" stopColor={sunTones.light} />
          <stop offset="1" stopColor={sunTones.base} />
        </radialGradient>
        <linearGradient id={`${uid}-near`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={nearTones.base} />
          <stop offset="1" stopColor={nearTones.shade} />
        </linearGradient>
      </defs>

      <rect width="800" height="450" fill={`url(#${uid}-sky)`} />
      <g {...svgSlot(sun, edit)}>
        <circle cx="548" cy="196" r="76" fill={`url(#${uid}-sun)`} />
      </g>
      <g {...svgSlot(far, edit)}>
        <path d="M0 262 C120 214 220 236 330 222 C450 206 560 248 680 226 C730 218 770 222 800 230 V450 H0 Z" fill={farFill} />
      </g>
      <g {...svgSlot(mid, edit)}>
        <path d="M0 312 C140 270 250 300 360 284 C500 262 610 300 800 272 V450 H0 Z" fill={colors[mid]} />
        <g fill={glazeTones(colors[mid]).shade}>
          <ellipse cx="612" cy="262" rx="9" ry="34" />
          <ellipse cx="634" cy="270" rx="8" ry="27" />
          <ellipse cx="654" cy="266" rx="9" ry="31" />
        </g>
      </g>
      <g {...svgSlot(near, edit)}>
        <path d="M0 360 C160 322 300 352 440 336 C590 318 690 346 800 330 V450 H0 Z" fill={`url(#${uid}-near)`} />
        <g fill="none" stroke={nearTones.light} strokeOpacity="0.28" strokeWidth="3" strokeLinecap="round">
          <path d="M40 398 C200 370 360 392 520 378 C640 368 720 380 780 374" />
          <path d="M20 426 C200 400 380 420 560 408 C660 402 740 410 800 406" />
        </g>
      </g>
    </svg>
  );
}
