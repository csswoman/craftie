'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';
import { readableOn } from '@lib/utils/colorMath';

import { MediaCoverArt } from './MediaCoverArt';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_MOODS, MEDIA_NOW_PLAYING, MEDIA_STATS } from './mediaPreviewData';
import { paletteTint } from './previewButtons';
import { PreviewIcon } from './previewIcons';
import { Tag } from './previewPrimitives';
import { bodyStyle, heroStyle, labelStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

type MediaNowPlayingProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  session: string;
  playing: boolean;
  primaryFill: string;
  onPrimary: string;
  onTogglePlay: () => void;
  onEditSlot?: PreviewSlotEditHandler;
};

/**
 * Session header: the cover leads, the title is the largest type on screen and
 * there is one play button. Transport controls live only in the player bar.
 * The band takes a wash of the accent and fades into the page.
 */
export function MediaNowPlaying({
  colors,
  fonts,
  session,
  playing,
  primaryFill,
  onPrimary,
  onTogglePlay,
  onEditSlot,
}: MediaNowPlayingProps) {
  const tx = useTx();
  const t = useT();
  const wash = paletteTint(colors.accent, colors.appBackground, 0.22);
  const ink = readableOn(colors.text, wash);
  const muted = readableOn(colors.mutedText, wash);
  const meta = MEDIA_STATS.map((stat) => `${stat.value} ${stat.label.toLowerCase()}`).join(' · ');

  return (
    <PreviewSlotTarget
      slot="accent"
      onEditSlot={onEditSlot}
      className="px-5 pb-6 pt-7 @min-[640px]/media:px-7"
      style={{ backgroundImage: `linear-gradient(180deg, ${wash} 0%, ${colors.appBackground} 100%)`, color: ink }}
    >
      <div className="grid items-end gap-6 @min-[640px]/media:grid-cols-[12rem_minmax(0,1fr)]">
        <MediaCoverArt
          colors={colors}
          onEditSlot={onEditSlot}
          className="aspect-square w-40 rounded-xl shadow-[0_24px_36px_-20px_rgb(0_0_0/0.5)] @min-[640px]/media:w-full"
        />

        <div className="min-w-0">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, muted)}>
            {tx(session)}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1" style={{ ...heroStyle(fonts), color: ink }}>
            {tx(MEDIA_NOW_PLAYING.title)}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2" style={labelStyle(fonts, muted)}>
            {tx(MEDIA_NOW_PLAYING.artist)} · {tx(meta)}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 max-w-[52ch] text-pretty" style={bodyStyle(fonts, muted)}>
            {tx(MEDIA_NOW_PLAYING.body)}
          </PreviewSlotTarget>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-label={playing ? t('ui.MediaNowPlaying.pausar') : t('ui.MediaNowPlaying.reproducir')}
          onClick={(event) => {
            event.stopPropagation();
            onTogglePlay();
          }}
          className="grid size-14 place-items-center rounded-full shadow-[0_14px_24px_-14px_rgb(0_0_0/0.5)] transition-transform duration-150 ease-out hover:scale-[1.04] active:scale-100 motion-reduce:transition-none motion-reduce:hover:scale-100"
          style={{ backgroundColor: primaryFill, color: onPrimary }}
        >
          <PreviewSlotTarget slot="primaryAction" onEditSlot={onEditSlot} className="pointer-events-none">
            <PreviewIcon name={playing ? 'pause' : 'play'} size={20} />
          </PreviewSlotTarget>
        </button>
        <span className="grid size-10 place-items-center rounded-full" style={{ color: muted }} aria-hidden="true">
          <PreviewIcon name="shuffle" size={18} />
        </span>
        <span className="grid size-10 place-items-center rounded-full" style={{ color: muted }} aria-hidden="true">
          <PreviewIcon name="heart" size={18} />
        </span>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {MEDIA_MOODS.map((mood) => (
            <Tag key={mood.label} label={tx(mood.label)} color={colors[mood.slot]} surfaceHex={colors.appBackground} slot={mood.slot} onEditSlot={onEditSlot} />
          ))}
        </div>
      </div>
    </PreviewSlotTarget>
  );
}
