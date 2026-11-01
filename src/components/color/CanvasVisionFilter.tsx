'use client';

import type { CSSProperties } from 'react';
import { colorVisionFilterMatrix, type ColorVisionMode } from '@lib/color/colorVision';

const FILTER_ID = 'craftie-color-vision-filter';

/** Inline style that applies the simulation to the element that receives it. */
export function colorVisionStyle(mode: ColorVisionMode): CSSProperties | undefined {
  return mode === 'none' ? undefined : { filter: `url(#${FILTER_ID})` };
}

/** Hidden SVG that defines the sRGB color matrix used by {@link colorVisionStyle}. */
export function CanvasVisionFilterDefs({ mode }: { mode: ColorVisionMode }) {
  const matrix = colorVisionFilterMatrix(mode);
  if (!matrix) return null;

  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" className="pointer-events-none absolute">
      <filter id={FILTER_ID} colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values={matrix} />
      </filter>
    </svg>
  );
}
