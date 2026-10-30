'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { MediaCoverArt } from './MediaCoverArt';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_MOODS, MEDIA_NOW_PLAYING } from './mediaPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewIcon } from './previewIcons';
import { EqualizerBars, ProgressBar, Tag } from './previewPrimitives';
import { bodyStyle, displayStyle, labelStyle, type PreviewFonts } from './previewTypography';

type MediaNowPlayingProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  playing: boolean;
  primaryFill: string;
  onPrimary: string;
  onTogglePlay: () => void;
  onEditSlot?: PreviewSlotEditHandler;
};

export function MediaNowPlaying({
  colors,
  fonts,
  playing,
  primaryFill,
  onPrimary,
  onTogglePlay,
  onEditSlot,
}: MediaNowPlayingProps) {
  const wash = paletteTint(colors.accent, colors.surface, 0.1);
  const ink = readableOn(colors.text, wash);
  const muted = readableOn(colors.mutedText, wash);

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="preview-surface rounded-[14px] border p-5 @min-[900px]/media:p-6"
      style={{ backgroundColor: wash, borderColor: colors.border, color: ink }}
    >
      <div className="grid gap-5 @min-[640px]/media:grid-cols-[11rem_minmax(0,1fr)] @min-[640px]/media:gap-7 @min-[640px]/media:items-center">
        <MediaCoverArt
          colors={colors}
          onEditSlot={onEditSlot}
          className="mx-auto aspect-square w-40 rounded-[14px] shadow-[0_22px_32px_-18px_rgb(0_0_0/0.45)] transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 @min-[640px]/media:mx-0 @min-[640px]/media:w-full"
        >
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-2 p-3">
            <span
              className="rounded-md px-2 py-1 text-[0.75rem]"
              style={{ backgroundColor: colors.surface, color: colors.text }}
            >
              {playing ? 'En vivo' : 'En pausa'}
            </span>
            {playing ? (
              <span className="rounded-md px-1.5 py-1" style={{ backgroundColor: colors.surface }}>
                <EqualizerBars color={colors.text} slot="text" onEditSlot={onEditSlot} bars={5} height={16} />
              </span>
            ) : null}
          </div>
        </MediaCoverArt>

        <div className="min-w-0">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, muted)}>
            Ahora suena
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1.5 text-balance" style={displayStyle(fonts)}>
            {MEDIA_NOW_PLAYING.title}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={labelStyle(fonts, muted)}>
            {MEDIA_NOW_PLAYING.artist}
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="mt-3 max-w-[46ch] text-pretty"
            style={bodyStyle(fonts, muted)}
          >
            {MEDIA_NOW_PLAYING.body}
          </PreviewSlotTarget>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {MEDIA_MOODS.map((mood) => (
              <Tag
                key={mood.label}
                label={mood.label}
                color={colors[mood.slot]}
                surfaceHex={wash}
                slot={mood.slot}
                onEditSlot={onEditSlot}
              />
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3 tabular-nums" style={{ ...labelStyle(fonts), color: muted }}>
            <span>{MEDIA_NOW_PLAYING.elapsed}</span>
            <div className="flex-1">
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

          <div className="mt-5 flex items-center gap-3">
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              <PreviewIcon name="skipBack" size={15} />
            </PreviewSlotTarget>
            <button
              type="button"
              aria-label={playing ? 'Pausar' : 'Reproducir'}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePlay();
              }}
              className="grid h-12 w-12 place-items-center rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0 active:scale-100 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
              style={{ backgroundColor: primaryFill, color: onPrimary }}
            >
              <PreviewSlotTarget slot="primaryAction" onEditSlot={onEditSlot} className="pointer-events-none">
                <PreviewIcon name={playing ? 'pause' : 'play'} size={18} />
              </PreviewSlotTarget>
            </button>
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="grid h-10 w-10 place-items-center rounded-full transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              <PreviewIcon name="skipForward" size={15} />
            </PreviewSlotTarget>
            <div className="ml-1 flex min-w-0 flex-1 items-center gap-2">
              <PreviewIcon name="sparkles" size={13} style={{ color: colors.mutedText }} />
              <div className="min-w-0 flex-1">
                <ProgressBar
                  value={MEDIA_NOW_PLAYING.volume}
                  color={colors.brand1}
                  slot="brand1"
                  onEditSlot={onEditSlot}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
