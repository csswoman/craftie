'use client';

import { useState, type KeyboardEvent, type PointerEvent } from 'react';

import { clampPoint, type ImagePoint } from '@lib/color/imagePicking';

import { useT } from '@/context/I18nContext';
import { useContainedSize } from '@/lib/browser/useContainedSize';
import { ImagePickerLoupe } from './ImagePickerLoupe';

type Drag = { index: number; point: ImagePoint; hex: string | null };

const KEY_STEP = 0.01;
const KEY_STEP_LARGE = 0.05;
const ARROWS: Record<string, ImagePoint> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

export type ImagePickerStageProps = {
  previewUrl: string;
  alt: string;
  aspect: number;
  hexes: string[];
  points: ImagePoint[];
  activeIndex: number | null;
  sample: (point: ImagePoint) => string | null;
  onSelect: (index: number) => void;
  onCommit: (index: number, point: ImagePoint, hex: string) => void;
};

/** The photo with one draggable marker per source color. */
export function ImagePickerStage({
  previewUrl,
  alt,
  aspect,
  hexes,
  points,
  activeIndex,
  sample,
  onSelect,
  onCommit,
}: ImagePickerStageProps) {
  const t = useT();
  const { ref, box } = useContainedSize<HTMLDivElement>(aspect);
  const [drag, setDrag] = useState<Drag | null>(null);

  function pointFromEvent(event: PointerEvent<HTMLDivElement>): ImagePoint {
    const rect = event.currentTarget.getBoundingClientRect();
    return clampPoint({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const marker = (event.target as HTMLElement).closest<HTMLElement>('[data-marker-index]');
    const index = marker ? Number(marker.dataset.markerIndex) : activeIndex;
    if (index === null) return;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelect(index);
    const point = pointFromEvent(event);
    setDrag({ index, point, hex: sample(point) });
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const point = pointFromEvent(event);
    setDrag({ ...drag, point, hex: sample(point) });
  }

  function handlePointerUp() {
    if (drag?.hex) onCommit(drag.index, drag.point, drag.hex);
    setDrag(null);
  }

  function handleMarkerKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const direction = ARROWS[event.key];
    const current = points[index];
    if (!direction || !current) return;

    event.preventDefault();
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    const point = clampPoint({ x: current.x + direction.x * step, y: current.y + direction.y * step });
    const hex = sample(point);
    if (hex) onCommit(index, point, hex);
  }

  return (
    <div ref={ref} className="flex min-h-[min(60vh,420px)] flex-1 items-center justify-center lg:min-h-0">
      {box ? (
        <div
          className="relative cursor-crosshair select-none overflow-visible rounded-lg shadow-(--shadow-float)"
          style={{ width: box.width, height: box.height }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDrag(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a local blob URL from the selected file. */}
          <img
            src={previewUrl}
            alt={alt}
            draggable={false}
            className="pointer-events-none h-full w-full rounded-lg object-fill"
          />

          {points.map((stored, index) => {
            const dragging = drag?.index === index;
            const point = dragging ? drag.point : stored;
            const hex = (dragging ? drag.hex : null) ?? hexes[index] ?? '#000000';
            const active = activeIndex === index;

            return (
              <button
                key={index}
                type="button"
                data-marker-index={index}
                aria-label={t('ui.ImageColorPicker.marcador', { index: index + 1, hex })}
                aria-pressed={active}
                onKeyDown={(event) => handleMarkerKeyDown(event, index)}
                onClick={() => onSelect(index)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-2 border-white shadow-[0_0_0_1px_rgb(0_0_0/0.45),0_2px_6px_rgb(0_0_0/0.35)] transition-[width,height] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/60 motion-reduce:transition-none ${
                  active ? 'z-10 size-8' : 'size-6'
                } ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%`, backgroundColor: hex }}
              />
            );
          })}

          {drag?.hex ? <ImagePickerLoupe previewUrl={previewUrl} box={box} point={drag.point} hex={drag.hex} /> : null}
        </div>
      ) : null}
    </div>
  );
}
