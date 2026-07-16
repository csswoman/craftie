import type { CSSProperties } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { tint } from './previewPrimitives';

type DataDisplayProps = {
  value: number;
  color: string;
  slot: UiLayoutSlot;
  onEditSlot?: PreviewSlotEditHandler;
};

export function RadialMetric({
  value,
  color,
  slot,
  onEditSlot,
  size = 44,
}: DataDisplayProps & { size?: number }) {
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size, color }}
      aria-label={`${value}%`}
    >
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={tint(color, 18)} strokeWidth={stroke} />
        <circle
          className="preview-ring-draw"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={
            {
              ['--preview-ring-length' as string]: circumference,
              ['--preview-ring-offset' as string]: offset,
            } as CSSProperties
          }
        />
      </svg>
      <span className="absolute text-[0.625rem] font-bold tabular-nums">{value}%</span>
    </PreviewSlotTarget>
  );
}

export function SegmentMeter({ value, color, slot, onEditSlot }: DataDisplayProps) {
  const filled = Math.round(value / 10);

  return (
    <div className="grid grid-cols-10 gap-1" role="img" aria-label={`${value}% complete`}>
      {Array.from({ length: 10 }).map((_, index) => {
        const active = index < filled;

        return (
          <PreviewSlotTarget
            key={index}
            slot={slot}
            onEditSlot={onEditSlot}
            className={`h-2.5 rounded-sm ${active ? 'preview-segment-in' : ''}`}
            style={{
              backgroundColor: active ? color : tint(color, 16),
              animationDelay: `${index * 24}ms`,
            }}
          />
        );
      })}
    </div>
  );
}
