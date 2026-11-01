import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_MORE_TRACKS, MEDIA_NOW_PLAYING, MEDIA_QUEUE } from './mediaPreviewData';
import { readableInk } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { EqualizerBars } from './previewMeters';
import { captionStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

/** Session tracklist: column header, then rows; the playing row carries the action color. */
export function MediaTrackList({
  colors,
  fonts,
  playing,
  primaryFill,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  playing: boolean;
  primaryFill: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const current = { track: MEDIA_NOW_PLAYING.title, artist: 'Craftie', time: MEDIA_NOW_PLAYING.duration };
  const rows = [current, ...MEDIA_QUEUE, ...MEDIA_MORE_TRACKS];
  const activeInk = readableInk(primaryFill, colors.appBackground);
  const grid = 'grid grid-cols-[2rem_minmax(0,1fr)_minmax(0,0.7fr)_3rem] items-center gap-3';

  return (
    <div className="px-5 pb-6 @min-[640px]/media:px-7">
      <PreviewSlotTarget
        slot="divider"
        onEditSlot={onEditSlot}
        className={`${grid} border-b px-2 pb-2`}
        style={{ ...captionStyle(fonts, colors.mutedText), borderColor: colors.divider }}
      >
        <span className="text-right">#</span>
        <span>{t('ui.MediaTrackList.titulo')}</span>
        <span>{t('ui.MediaTrackList.artista')}</span>
        <span className="flex justify-end" aria-label={t('ui.MediaTrackList.duracion')}>
          <PreviewIcon name="activity" size={13} />
        </span>
      </PreviewSlotTarget>

      <ol className="mt-1">
        {rows.map((row, index) => {
          const active = index === 0;

          return (
            <li
              key={row.track}
              className={`${grid} rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_6%,transparent)]`}
            >
              <span className="flex justify-end tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                {active && playing ? (
                  <EqualizerBars color={primaryFill} slot="primaryAction" onEditSlot={onEditSlot} bars={3} height={14} />
                ) : (
                  index + 1
                )}
              </span>
              <PreviewSlotTarget
                slot={active ? 'primaryAction' : 'text'}
                onEditSlot={onEditSlot}
                className="truncate"
                style={{ ...titleStyle(fonts), color: active ? activeInk : colors.text }}
              >
                {tx(row.track)}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="truncate" style={labelStyle(fonts, colors.mutedText)}>
                {tx(row.artist)}
              </PreviewSlotTarget>
              <span className="text-right tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                {tx(row.time)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
