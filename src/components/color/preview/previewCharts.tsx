import { useId } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { vividFill } from './previewColor';
import { tint } from './previewPrimitives';

export type ChartSeries = {
  label: string;
  value: number;
  display?: string;
  color: string;
  slot: UiLayoutSlot;
};

function toPoints(values: readonly number[], width: number, height: number, pad: number): [number, number][] {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y];
  });
}

function smoothPath(points: [number, number][]): string {
  if (points.length < 2) {
    return points.length === 1 ? `M${points[0]![0]},${points[0]![1]}` : '';
  }

  let d = `M${points[0]![0].toFixed(1)},${points[0]![1].toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }

  return d;
}

export function Sparkline({ values, color, surfaceHex, height = 30 }: { values: readonly number[]; color: string; surfaceHex: string; height?: number }) {
  // A lighter touch than solid fills — enough lift to read as "your palette, brighter".
  const vivid = vividFill(color, surfaceHex, 0.25);
  const points = toPoints(values, 100, height, 4);
  const path = smoothPath(points);
  const last = points[points.length - 1]!;

  return (
    <svg viewBox={`0 0 100 ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke={vivid} strokeWidth={2.25} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r={2.6} fill={vivid} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function AreaChart({
  values,
  color,
  surfaceHex,
  height = 132,
}: {
  values: number[];
  color: string;
  surfaceHex: string;
  height?: number;
}) {
  const gradientId = useId();
  // Bright fill under the line for pop; the line itself gets a lighter touch so
  // it reads as the palette's color, only brighter.
  const vivid = vividFill(color, surfaceHex);
  const vividLine = vividFill(color, surfaceHex, 0.25);
  const width = 100;
  const points = toPoints(values, width, height, 12);
  const line = smoothPath(points);
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={vivid} stopOpacity={0.32} />
          <stop offset="100%" stopColor={vivid} stopOpacity={0} />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((fraction) => (
        <line
          key={fraction}
          x1="0"
          x2={width}
          y1={height * fraction}
          y2={height * fraction}
          stroke={tint(color, 12)}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        className="preview-draw"
        fill="none"
        stroke={vividLine}
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{ ['--preview-draw-length' as string]: '260' }}
      />
    </svg>
  );
}

export function DonutChart({
  segments,
  centerLabel,
  centerValue,
  surfaceHex,
  size = 148,
}: {
  segments: ChartSeries[];
  centerLabel: string;
  centerValue: string;
  surfaceHex: string;
  size?: number;
}) {
  const stroke = size * 0.14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  const arcs = segments.reduce<{ items: Array<{ label: string; color: string; length: number; offset: number }>; cumulative: number }>(
    (acc, segment) => {
      const fraction = segment.value / total;
      const length = Math.max(fraction * circumference - 2.5, 0);
      const item = { label: segment.label, color: vividFill(segment.color, surfaceHex), length, offset: -acc.cumulative };
      return { items: [...acc.items, item], cumulative: acc.cumulative + fraction * circumference };
    },
    { items: [], cumulative: 0 },
  ).items;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="preview-rise -rotate-90" aria-hidden="true">
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc.length} ${circumference - arc.length}`}
            strokeDashoffset={arc.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[0.625rem] font-bold uppercase tracking-wide opacity-60">{centerLabel}</span>
        <span className="text-[1.25rem] font-extrabold leading-none">{centerValue}</span>
      </div>
    </div>
  );
}

export function DataLegend({
  segments,
  onEditSlot,
  interactive = false,
}: {
  segments: ChartSeries[];
  onEditSlot?: PreviewSlotEditHandler;
  interactive?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      {segments.map((segment) => (
        <div
          key={segment.label}
          className={`group flex items-center justify-between gap-3 rounded-lg px-2 py-1 text-[0.75rem] transition-colors duration-200 ${interactive ? 'hover:bg-(--legend-hover)' : ''}`}
          style={{ ['--legend-hover' as string]: tint(segment.color, 12) }}
        >
          <span className="flex min-w-0 items-center gap-2 font-bold">
            <PreviewSlotTarget
              slot={segment.slot}
              onEditSlot={onEditSlot}
              className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 group-hover:scale-125"
              style={{ backgroundColor: segment.color }}
            />
            <span className="truncate">{segment.label}</span>
          </span>
          <span className="shrink-0 tabular-nums opacity-70">{segment.display ?? segment.value}</span>
        </div>
      ))}
    </div>
  );
}
