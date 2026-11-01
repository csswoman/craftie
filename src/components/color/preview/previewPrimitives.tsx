import type { CSSProperties } from 'react';

import type { UiLayoutSlot } from '@lib/color/layoutModes';
import { deriveForegroundForBackground } from '@lib/color/pairedForeground';
import { adjustLightnessForContrast, contrastRatio, mix, readableOn } from '@lib/utils/colorMath';

import { PreviewIcon, type PreviewIconName } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ROLE_WEIGHT } from './previewTypography';
import { useTx } from '@/context/I18nContext';

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
  surfaceHex,
  size = 32,
}: SlotColorProps & { initials: string; surfaceHex?: string; size?: number }) {
  const tx = useTx();
  // The tint over the surface is the real background of the initials; keep the
  // hue but move lightness until they pass AA on it.
  const background = surfaceHex ? mix(color, surfaceHex, 0.8) : null;
  const ink = background ? readableOn(color, background, 4.5) : color;

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        backgroundColor: tint(color, 20),
        color: ink,
      }}
    >
      {tx(initials)}
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
  const tx = useTx();
  const backgroundColor = surfaceHex ? mix(color, surfaceHex, 0.85) : color;
  const pairedForeground = deriveForegroundForBackground(backgroundColor).hex;
  const foregroundColor = contrastRatio(pairedForeground, backgroundColor) >= 4.5
    ? pairedForeground
    : adjustLightnessForContrast(pairedForeground, backgroundColor, 4.5);

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem]"
      style={{ backgroundColor, color: foregroundColor, fontWeight: ROLE_WEIGHT.button }}
    >
      {icon ? <PreviewIcon name={icon} size={11} strokeWidth={2.25} /> : null}
      {tx(label)}
    </PreviewSlotTarget>
  );
}

export function StatDelta({
  value,
  direction,
  color,
  slot,
  onEditSlot,
  surfaceHex,
}: SlotColorProps & { value: string; direction: 'up' | 'down'; surfaceHex?: string }) {
  const tx = useTx();
  // With the surface known, the chip is an opaque tint and its text is moved to AA on it.
  const background = surfaceHex ? mix(surfaceHex, color, 0.15) : tint(color, 15);
  const ink = surfaceHex ? readableOn(color, background, 4.5) : color;

  return (
    <PreviewSlotTarget
      slot={slot}
      onEditSlot={onEditSlot}
      className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[0.75rem] tabular-nums"
      style={{ backgroundColor: background, color: ink, fontWeight: ROLE_WEIGHT.button }}
    >
      <PreviewIcon name={direction === 'up' ? 'arrowUp' : 'arrowDown'} size={11} strokeWidth={2.5} />
      {tx(value)}
    </PreviewSlotTarget>
  );
}

export function LiveDot({
  color,
  slot,
  onEditSlot,
  label,
  surfaceHex,
}: SlotColorProps & { label?: string; surfaceHex?: string }) {
  const tx = useTx();
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
    <span
      className="inline-flex items-center gap-1.5 text-[0.75rem]"
      style={{ color: surfaceHex ? readableOn(color, surfaceHex) : color, fontWeight: ROLE_WEIGHT.label }}
    >
      {dot}
      {tx(label)}
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
  const tx = useTx();
  return (
    <PreviewSlotTarget
      slot={trackSlot}
      onEditSlot={onEditSlot}
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{ backgroundColor: trackColor }}
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
            className="rounded-full px-3 py-1.5 text-[0.75rem] transition-colors duration-200 ease-out"
            style={{
              backgroundColor: active ? activeColor : 'transparent',
              color: active ? activeText : mutedText,
              fontWeight: active ? ROLE_WEIGHT.button : ROLE_WEIGHT.label,
            }}
          >
            {tx(option)}
          </button>
        );
      })}
    </PreviewSlotTarget>
  );
}

/** Ambient, auto-playing equalizer — pure decoration, no click conflict. */
