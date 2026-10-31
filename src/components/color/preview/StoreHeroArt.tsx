import { useId } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { paletteTint } from './previewButtons';
import type { PreviewSlotEditHandler } from './PreviewSlotTarget';
import { GlazeGradient, glazeTones, SoftShadowFilter, svgSlot } from './storeArtParts';

/**
 * Shelf still life for the shop hero: a bottle vase with a branch, a round pot,
 * stacked bowls and a plate leaning on the wall. Every glaze is a palette color
 * with light and shade, so the palette reads as material, not as flat swatches.
 * The plinth runs off the right and bottom edges of the hero.
 */
export function StoreHeroArt({
  colors,
  wash,
  ink,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  wash: string;
  ink: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const plate = glazeTones(colors.accent);
  const pot = glazeTones(colors.brand1);
  const bowls = glazeTones(colors.brand4);
  const plinthTop = paletteTint(colors.brand3, wash, 0.3);
  const plinthFront = paletteTint(colors.brand3, wash, 0.45);
  const leaf = paletteTint(ink, wash, 0.7);

  return (
    <svg viewBox="0 0 400 320" className="block h-auto w-full" aria-hidden="true">
      <defs>
        <GlazeGradient id={id('vase')} hex={colors.brand2} />
        <GlazeGradient id={id('pot')} hex={colors.brand1} />
        <GlazeGradient id={id('bowl')} hex={colors.brand4} />
        <radialGradient id={id('plate')} cx="0.4" cy="0.38" r="0.7">
          <stop offset="0" stopColor={plate.light} />
          <stop offset="0.55" stopColor={plate.base} />
          <stop offset="1" stopColor={plate.shade} />
        </radialGradient>
        <SoftShadowFilter id={id('blur')} />
      </defs>

      {/* Plate leaning on the wall, with its cast shadow. */}
      <g {...svgSlot('accent', onEditSlot)}>
        <circle cx="292" cy="160" r="80" fill="#000" opacity="0.1" filter={`url(#${id('blur')})`} transform="translate(8 8)" />
        <circle cx="290" cy="156" r="80" fill={`url(#${id('plate')})`} />
        <circle cx="290" cy="156" r="58" fill="none" stroke={plate.shade} strokeOpacity="0.35" strokeWidth="2" />
        <circle cx="290" cy="156" r="56" fill="none" stroke={plate.light} strokeOpacity="0.5" strokeWidth="1.5" />
      </g>

      {/* Plinth: top plane, front face and a crisp edge in the third brand color. */}
      <g {...svgSlot('brand3', onEditSlot)}>
        <path d="M24 250 Q24 244 32 244 H400 V262 H24 Z" fill={plinthTop} />
        <rect x="24" y="262" width="376" height="58" fill={plinthFront} />
        <rect x="24" y="260" width="376" height="3" fill={colors.brand3} />
      </g>

      {/* Contact shadows. */}
      <g fill="#000" opacity="0.16" filter={`url(#${id('blur')})`}>
        <ellipse cx="124" cy="254" rx="48" ry="6" />
        <ellipse cx="226" cy="254" rx="54" ry="6" />
        <ellipse cx="334" cy="254" rx="50" ry="5" />
      </g>

      {/* Branch in the vase, drawn in the page ink so it works with any palette. */}
      <g fill="none" stroke={leaf} strokeLinecap="round">
        <path d="M122 92 C118 64 126 40 150 16" strokeWidth="2.5" />
        <path d="M121 74 C108 62 100 48 98 34" strokeWidth="2" />
      </g>
      <g fill={leaf}>
        <ellipse cx="140" cy="34" rx="9" ry="4" transform="rotate(-50 140 34)" />
        <ellipse cx="152" cy="44" rx="9" ry="4" transform="rotate(10 152 44)" />
        <ellipse cx="128" cy="56" rx="9" ry="4" transform="rotate(-35 128 56)" />
        <ellipse cx="134" cy="70" rx="8" ry="3.5" transform="rotate(20 134 70)" />
        <ellipse cx="102" cy="46" rx="8" ry="3.5" transform="rotate(-70 102 46)" />
        <ellipse cx="110" cy="58" rx="8" ry="3.5" transform="rotate(30 110 58)" />
      </g>

      {/* Bottle vase. */}
      <g {...svgSlot('brand2', onEditSlot)}>
        <path
          d="M110 96 H134 V122 C134 134 166 146 166 190 V226 C166 242 156 252 140 252 H104 C88 252 78 242 78 226 V190 C78 146 110 134 110 122 Z"
          fill={`url(#${id('vase')})`}
        />
        <rect x="105" y="88" width="34" height="10" rx="4" fill={glazeTones(colors.brand2).shade} />
      </g>

      {/* Round pot with a rolled rim. */}
      <g {...svgSlot('brand1', onEditSlot)}>
        <ellipse cx="226" cy="212" rx="56" ry="42" fill={`url(#${id('pot')})`} />
        <rect x="200" y="164" width="52" height="18" rx="5" fill={`url(#${id('pot')})`} />
        <rect x="194" y="158" width="64" height="10" rx="5" fill={pot.shade} />
        <path d="M184 206 C188 190 198 180 210 176" fill="none" stroke={pot.light} strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Two stacked bowls. */}
      <g {...svgSlot('brand4', onEditSlot)}>
        <path d="M284 224 A50 30 0 0 0 384 224 Z" fill={`url(#${id('bowl')})`} />
        <ellipse cx="334" cy="224" rx="50" ry="6" fill={bowls.shade} />
        <path d="M296 206 A38 22 0 0 0 372 206 Z" fill={`url(#${id('bowl')})`} />
        <ellipse cx="334" cy="206" rx="38" ry="5" fill={bowls.shade} />
        <ellipse cx="334" cy="205" rx="30" ry="3" fill={bowls.base} />
      </g>
    </svg>
  );
}
