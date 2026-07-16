import type { CSSProperties } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';
import { deriveForegroundForBackground } from '@lib/color/pairedForeground';
import { adjustLightnessForContrast, contrastRatio, mix } from '@lib/utils/colorMath';

import { PreviewIcon, type PreviewIconName } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

/** Soft, honest tint of a palette color — keeps the source slot recognizable. */
export function tint(hex: string, percent: number): string {
  return `color-mix(in srgb, ${hex} ${percent}%, transparent)`;
}

type SlotColorProps = {
  color: string;
  slot: UiLayoutSlot;
  onEditSlot?: PreviewSlotEditHandler;
};

export function Avatar({
  initials,
  color,
  slot,
  onEditSlot,
  size = 32,
}: SlotColorProps & { initials: string; size?: number }) {
  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundColor: tint(color, 20),
        color,
      }}
    >
      {initials}
    </PreviewSlotTarget>
  );
}

export function Tag({
  label,
  color,
  slot,
  onEditSlot,
  icon,
  surfaceHex,
}: SlotColorProps & { label: string; icon?: PreviewIconName; surfaceHex?: string }) {
  const backgroundColor = surfaceHex ? mix(color, surfaceHex, 0.85) : color;
  const pairedForeground = deriveForegroundForBackground(backgroundColor).hex;
  const foregroundColor = contrastRatio(pairedForeground, backgroundColor) >= 4.5
    ? pairedForeground
    : adjustLightnessForContrast(pairedForeground, backgroundColor, 4.5);

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold"
      style={{ backgroundColor, color: foregroundColor }}
    >
      {icon ? <PreviewIcon name={icon} size={11} strokeWidth={2.25} /> : null}
      {label}
    </PreviewSlotTarget>
  );
}

export function StatDelta({
  value,
  direction,
  color,
  slot,
  onEditSlot,
}: SlotColorProps & { value: string; direction: 'up' | 'down' }) {
  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums"
      style={{ backgroundColor: tint(color, 15), color }}
    >
      <PreviewIcon name={direction === 'up' ? 'arrowUp' : 'arrowDown'} size={11} strokeWidth={2.5} />
      {value}
    </PreviewSlotTarget>
  );
}

export function LiveDot({
  color,
  slot,
  onEditSlot,
  label,
}: SlotColorProps & { label?: string }) {
  const dot = (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="preview-pulse h-2 w-2 rounded-full"
      style={{ backgroundColor: color, ['--preview-pulse-color' as string]: tint(color, 55) } as CSSProperties}
    />
  );

  if (!label) {
    return dot;
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium" style={{ color }}>
      {dot}
      {label}
    </span>
  );
}

/** Real interaction: click switches the segment (stopPropagation → never edits). */
export function SegmentedControl({
  options,
  value,
  onChange,
  trackColor,
  activeColor,
  activeText,
  mutedText,
  trackSlot,
  onEditSlot,
}: {
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  trackColor: string;
  activeColor: string;
  activeText: string;
  mutedText: string;
  trackSlot: UiLayoutSlot;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <PreviewSlotTarget
      slot={trackSlot}
      onEditSlot={onEditSlot}
      className="inline-flex items-center gap-0.5 rounded-full p-0.5"
      style={{ backgroundColor: tint(trackColor, 60) }}
    >
      {options.map((option) => {
        const active = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onChange(option);
            }}
            className="rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold transition-colors duration-200 ease-out"
            style={{
              backgroundColor: active ? activeColor : 'transparent',
              color: active ? activeText : mutedText,
            }}
          >
            {option}
          </button>
        );
      })}
    </PreviewSlotTarget>
  );
}

/** Ambient, auto-playing equalizer — pure decoration, no click conflict. */
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
