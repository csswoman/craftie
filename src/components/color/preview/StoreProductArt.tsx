import { useId } from 'react';

import type { ResolvedLayoutColors, UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { paletteTint } from './previewButtons';
import { onVividFill } from './previewColor';
import { GlazeGradient, glazeTones, SoftShadowFilter } from './storeArtParts';

type ProductShape = 'cup' | 'cloth' | 'notebook' | 'jar';

export const STORE_SHAPES: readonly ProductShape[] = ['cup', 'cloth', 'notebook', 'jar'];

/**
 * Product shot drawn in the product color: a tinted wall, a table plane, a soft
 * contact shadow and the object with light and shade. Same language as the hero.
 */
export function StoreProductArt({
  colors,
  shape,
  slot,
  swatchHex,
  onEditSlot,
  className = '',
}: {
  colors: ResolvedLayoutColors;
  shape: ProductShape;
  slot: UiLayoutSlot;
  swatchHex: string;
  onEditSlot?: PreviewSlotEditHandler;
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const fill = `url(#${uid}-glaze)`;
  const tones = glazeTones(swatchHex);
  const wall = paletteTint(swatchHex, colors.surface, 0.14);
  const table = paletteTint(swatchHex, colors.surface, 0.3);
  const detail = onVividFill(swatchHex);

  return (
    <PreviewSlotTarget slot={slot} onEditSlot={onEditSlot} className={`relative overflow-hidden ${className}`} style={{ backgroundColor: wall }}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
        <defs>
          <GlazeGradient id={`${uid}-glaze`} hex={swatchHex} />
          <SoftShadowFilter id={`${uid}-blur`} />
        </defs>
        <rect x="0" y="236" width="400" height="64" fill={table} />
        <ellipse cx="200" cy="246" rx={shape === 'cloth' ? 104 : 70} ry="7" fill="#000" opacity="0.16" filter={`url(#${uid}-blur)`} />

        {shape === 'cup' ? (
          <g>
            <ellipse cx="200" cy="244" rx="78" ry="9" fill={tones.shade} />
            <ellipse cx="200" cy="241" rx="72" ry="7" fill={tones.base} />
            <path d="M246 150 C282 150 282 206 240 206" fill="none" stroke={tones.shade} strokeWidth="11" strokeLinecap="round" />
            <path d="M150 132 H250 V176 C250 214 228 238 200 238 C172 238 150 214 150 176 Z" fill={fill} />
            <ellipse cx="200" cy="132" rx="50" ry="7" fill={tones.shade} />
            <path d="M166 150 V180" stroke={tones.light} strokeOpacity="0.6" strokeWidth="5" strokeLinecap="round" />
          </g>
        ) : null}

        {shape === 'cloth' ? (
          <g>
            <defs>
              <pattern id={`${uid}-weave`} width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="1.5" height="12" fill={detail} opacity="0.1" />
              </pattern>
            </defs>
            {/* Folded linen: soft rounded fold edges, a light top face and a loose corner on the top fold. */}
            {[
              { y: 210, x: 92, w: 216 },
              { y: 184, x: 100, w: 206 },
              { y: 158, x: 96, w: 210 },
            ].map((fold) => (
              <g key={fold.y}>
                <rect x={fold.x} y={fold.y} width={fold.w} height="28" rx="14" fill={fill} />
                <rect x={fold.x} y={fold.y} width={fold.w} height="28" rx="14" fill={`url(#${uid}-weave)`} />
                <rect x={fold.x + 10} y={fold.y + 3} width={fold.w - 20} height="5" rx="2.5" fill={tones.light} opacity="0.45" />
              </g>
            ))}
            <path d="M262 158 C282 158 300 166 306 172 L282 186 C276 176 270 166 262 158 Z" fill={tones.shade} opacity="0.75" />
          </g>
        ) : null}

        {shape === 'notebook' ? (
          <g transform="rotate(-7 200 170)">
            <rect x="148" y="78" width="112" height="162" rx="8" fill={tones.shade} transform="translate(6 2)" />
            <rect x="148" y="78" width="112" height="162" rx="8" fill={fill} />
            <rect x="148" y="78" width="16" height="162" rx="6" fill={tones.shade} opacity="0.7" />
            <rect x="182" y="110" width="56" height="30" rx="3" fill={tones.light} opacity="0.85" />
            <rect x="238" y="78" width="6" height="162" fill={detail} opacity="0.45" />
          </g>
        ) : null}

        {shape === 'jar' ? (
          <g>
            <path d="M246 140 C284 142 284 206 244 206" fill="none" stroke={tones.shade} strokeWidth="11" strokeLinecap="round" />
            <path
              d="M162 100 H238 L244 116 C258 146 258 200 246 226 C242 236 234 242 222 242 H178 C166 242 158 236 154 226 C142 200 142 146 156 116 Z"
              fill={fill}
            />
            <path d="M162 100 L146 92 L154 114 Z" fill={tones.base} />
            <ellipse cx="200" cy="100" rx="38" ry="5" fill={tones.shade} />
            <path d="M168 136 C162 160 162 190 168 210" fill="none" stroke={tones.light} strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
    </PreviewSlotTarget>
  );
}
