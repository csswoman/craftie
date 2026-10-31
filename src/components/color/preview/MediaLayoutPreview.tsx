'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { MediaNowPlaying } from './MediaNowPlaying';
import { MediaPlayerBar } from './MediaPlayerBar';
import { MediaSidebar } from './MediaSidebar';
import { MediaTrackList } from './MediaTrackList';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { getMediaSessionLabel, MEDIA_CONTAINER_CLASS } from './mediaPreviewData';
import { buttonPairOn } from './previewButtons';
import { DEFAULT_PREVIEW_FONTS, previewRootTypeStyle, type PreviewFonts } from './previewTypography';

export const MEDIA_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
  'primaryAction',
  'primaryActionText',
  'accent',
  'success',
  'brand1',
  'brand2',
  'brand3',
] as const;

export { MEDIA_CONTAINER_CLASS };

/** Desktop player: library rail, session header with one play button, tracklist, and a single transport bar. */
export function MediaLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [playing, setPlaying] = useState(true);
  const session = getMediaSessionLabel(new Date().getHours());
  const button = buttonPairOn(colors, colors.appBackground);
  const togglePlay = () => setPlaying((value) => !value);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${MEDIA_CONTAINER_CLASS} min-w-0 w-full overflow-hidden`}
      style={{ backgroundColor: colors.appBackground, color: colors.text, ...previewRootTypeStyle() }}
    >
      <div className="flex min-w-0">
        <MediaSidebar colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        <main className="preview-rise min-w-0 flex-1" style={{ animationDelay: previewStaggerDelay(1) }}>
          <MediaNowPlaying
            colors={colors}
            fonts={fonts}
            session={session}
            playing={playing}
            primaryFill={button.fill}
            onPrimary={button.on}
            onTogglePlay={togglePlay}
            onEditSlot={onEditSlot}
          />
          <MediaTrackList colors={colors} fonts={fonts} playing={playing} primaryFill={button.fill} onEditSlot={onEditSlot} />
        </main>
      </div>

      <MediaPlayerBar
        colors={colors}
        fonts={fonts}
        playing={playing}
        primaryFill={button.fill}
        onPrimary={button.on}
        onTogglePlay={togglePlay}
        onEditSlot={onEditSlot}
      />
    </PreviewSlotTarget>
  );
}
