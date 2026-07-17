'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_NOW_PLAYING } from './mediaPreviewData';
import { PreviewIcon } from './previewIcons';
import { EqualizerBars, ProgressBar, tint } from './previewPrimitives';
import { labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type MediaPlayerBarProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  playing: boolean;
  primaryFill: string;
  onPrimary: string;
  onTogglePlay: () => void;
  onEditSlot?: PreviewSlotEditHandler;
};

export function MediaPlayerBar({
  colors,
  fonts,
  playing,
  primaryFill,
  onPrimary,
  onTogglePlay,
  onEditSlot,
}: MediaPlayerBarProps) {
  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className="preview-rise border-t px-3 py-2.5 sm:px-4"
      style={{
        backgroundColor: colors.chrome,
        borderColor: colors.divider,
        color: colors.text,
      }}
      aria-label="Reproductor de Craftie"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 @min-[720px]/media:grid-cols-[minmax(0,1fr)_minmax(12rem,1.1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <PreviewSlotTarget
            slot="accent"
            onEditSlot={onEditSlot}
            className="h-11 w-11 shrink-0 rounded-[10px] border"
            style={{
              borderColor: colors.divider,
              backgroundImage: `radial-gradient(circle at 30% 25%, ${tint(colors.accent, 60)}, ${tint(colors.accent, 16)} 75%)`,
            }}
          />
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
              {MEDIA_NOW_PLAYING.title}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="block truncate"
              style={labelStyle(fonts, colors.mutedText)}
            >
              {MEDIA_NOW_PLAYING.artist}
            </PreviewSlotTarget>
          </div>
          {playing ? (
            <EqualizerBars
              color={primaryFill}
              slot="primaryAction"
              onEditSlot={onEditSlot}
              bars={4}
              height={16}
            />
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-1.5 @min-[720px]/media:items-center">
          <div className="flex items-center gap-2">
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="hidden h-8 w-8 place-items-center rounded-full transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 @min-[720px]/media:grid"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              <PreviewIcon name="skipBack" size={13} />
            </PreviewSlotTarget>
            <button
              type="button"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePlay();
              }}
              className="grid h-9 w-9 place-items-center rounded-full transition-transform duration-150 ease-out hover:scale-[1.05] active:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
              style={{ backgroundColor: primaryFill, color: onPrimary }}
            >
              <PreviewSlotTarget slot="primaryAction" onEditSlot={onEditSlot} className="pointer-events-none">
                <PreviewIcon name={playing ? 'pause' : 'play'} size={15} />
              </PreviewSlotTarget>
            </button>
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="hidden h-8 w-8 place-items-center rounded-full transition-transform duration-150 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 @min-[720px]/media:grid"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              <PreviewIcon name="skipForward" size={13} />
            </PreviewSlotTarget>
          </div>
          <div
            className="hidden w-full max-w-xs items-center gap-2 tabular-nums @min-[720px]/media:flex"
            style={{ ...labelStyle(fonts), color: colors.mutedText }}
          >
            <span>{MEDIA_NOW_PLAYING.elapsed}</span>
            <div className="min-w-0 flex-1">
              <ProgressBar
                value={MEDIA_NOW_PLAYING.progress}
                color={primaryFill}
                slot="primaryAction"
                onEditSlot={onEditSlot}
                knob
              />
            </div>
            <span>{MEDIA_NOW_PLAYING.duration}</span>
          </div>
        </div>

        <div className="hidden min-w-0 items-center justify-end gap-2 @min-[720px]/media:flex">
          <PreviewSlotTarget slot="data2" onEditSlot={onEditSlot} style={{ color: colors.data2 }}>
            <PreviewIcon name="heart" size={13} />
          </PreviewSlotTarget>
          <PreviewIcon name="sparkles" size={12} style={{ color: colors.mutedText }} />
          <div className="w-24">
            <ProgressBar
              value={MEDIA_NOW_PLAYING.volume}
              color={colors.data1}
              slot="data1"
              onEditSlot={onEditSlot}
            />
          </div>
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
