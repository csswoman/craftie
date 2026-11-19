'use client';

import type { ImagePoint } from '@lib/color/imagePicking';

import type { BoxSize } from '@/lib/browser/useContainedSize';

const SIZE = 96;
const ZOOM = 5;
/** Gap between the pointer and the loupe so the finger does not cover it. */
const OFFSET = 28;

/** Magnified view of the pixels under the dragged marker, with their HEX. */
export function ImagePickerLoupe({
  previewUrl,
  box,
  point,
  hex,
}: {
  previewUrl: string;
  box: BoxSize;
  point: ImagePoint;
  hex: string;
}) {
  const x = point.x * box.width;
  const y = point.y * box.height;
  // Flip below the pointer when there is no room above it.
  const above = y - OFFSET - SIZE - 24 >= -box.height * 0.1;
  const top = above ? y - OFFSET - SIZE : y + OFFSET;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-20 flex flex-col items-center gap-1"
      style={{ left: x - SIZE / 2, top, width: SIZE }}
    >
      <div
        className="relative overflow-hidden rounded-full border-4 shadow-(--shadow-float)"
        style={{
          width: SIZE,
          height: SIZE,
          borderColor: hex,
          backgroundImage: `url("${previewUrl}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${box.width * ZOOM}px ${box.height * ZOOM}px`,
          backgroundPosition: `${SIZE / 2 - x * ZOOM}px ${SIZE / 2 - y * ZOOM}px`,
          imageRendering: 'pixelated',
        }}
      >
        <span className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-[0_0_0_1px_rgb(0_0_0/0.5)]" />
      </div>
      <span className="rounded-md bg-ink px-1.5 py-0.5 font-mono text-chrome-caption font-semibold text-bg">{hex}</span>
    </div>
  );
}
