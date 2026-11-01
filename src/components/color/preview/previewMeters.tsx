import type { CSSProperties } from 'react';
import type { UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { tint } from './previewPrimitives';

type SlotColorProps = {
  color: string;
  slot: UiLayoutSlot;
  onEditSlot?: PreviewSlotEditHandler;
};

export function EqualizerBars({
  color,
  slot,
  onEditSlot,
  bars = 5,
  height = 28,
}: SlotColorProps & { bars?: number; height?: number }) {
  const durations = [0.9, 1.3, 0.7, 1.1, 1.5, 0.8, 1.2];

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="flex items-end gap-0.5"
      style={{ height }}
    >
      {Array.from({ length: bars }).map((_, index) => (
        <span
          key={index}
          className="preview-eq-bar w-1 rounded-full"
          style={
            {
              height: '100%',
              backgroundColor: color,
              opacity: 0.55 + (index % 3) * 0.15,
              ['--preview-eq-dur' as string]: `${durations[index % durations.length]}s`,
              animationDelay: `${index * 0.12}s`,
            } as CSSProperties
          }
        />
      ))}
    </PreviewSlotTarget>
  );
}

export function ProgressBar({
  value,
  color,
  slot,
  onEditSlot,
  knob = false,
}: SlotColorProps & { value: number; knob?: boolean }) {
  return (
    <div className="relative h-1.5 w-full rounded-full" style={{ backgroundColor: tint(color, 22) }}>
      <PreviewSlotTarget
        slot={slot}
        onEditSlot={onEditSlot}
        className="preview-rise absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
      {knob ? (
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ left: `${value}%`, backgroundColor: color, borderColor: tint(color, 40) }}
        />
      ) : null}
    </div>
  );
}
