'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { MediaAsidePanels } from './MediaAsidePanels';
import { MediaNowPlaying } from './MediaNowPlaying';
import { MediaPlayerBar } from './MediaPlayerBar';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { getMediaSessionLabel, MEDIA_CONTAINER_CLASS } from './mediaPreviewData';
import { onVividFill, vividFill } from './previewColor';
import { LiveDot } from './previewPrimitives';
import {
  DEFAULT_PREVIEW_FONTS,
  displayStyle,
  labelStyle,
  previewRootTypeStyle,
  type PreviewFonts,
} from './previewTypography';

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
  'data1',
  'data2',
  'data3',
] as const;

export { MEDIA_CONTAINER_CLASS };

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
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);

  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className={`${MEDIA_CONTAINER_CLASS} min-w-0 w-full overflow-hidden rounded-xl border`}
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
        ...previewRootTypeStyle(),
      }}
    >
      <div className="flex min-h-[36rem] min-w-0 flex-col">
        <div className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <header
            className="preview-rise mb-5 flex flex-wrap items-end justify-between gap-3"
            style={{ animationDelay: previewStaggerDelay(0) }}
          >
            <div className="min-w-0">
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
                {session}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1" style={displayStyle(fonts)}>
                Radio Craftie
              </PreviewSlotTarget>
            </div>
            <LiveDot
              color={colors.success}
              slot="success"
              onEditSlot={onEditSlot}
              label={playing ? 'Pincel en movimiento' : 'Pausa en el estudio'}
            />
          </header>

          <section className="grid gap-4 @min-[900px]/media:grid-cols-[minmax(0,1.25fr)_minmax(16rem,0.85fr)]">
            <div className="preview-rise min-w-0" style={{ animationDelay: previewStaggerDelay(1) }}>
              <MediaNowPlaying
                colors={colors}
                fonts={fonts}
                playing={playing}
                primaryFill={primaryFill}
                onPrimary={onPrimary}
                onTogglePlay={() => setPlaying((value) => !value)}
                onEditSlot={onEditSlot}
              />
            </div>
            <div className="preview-rise min-w-0" style={{ animationDelay: previewStaggerDelay(2) }}>
              <MediaAsidePanels colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
            </div>
          </section>
        </div>

        <MediaPlayerBar
          colors={colors}
          fonts={fonts}
          playing={playing}
          primaryFill={primaryFill}
          onPrimary={onPrimary}
          onTogglePlay={() => setPlaying((value) => !value)}
          onEditSlot={onEditSlot}
        />
      </div>
    </PreviewSlotTarget>
  );
}
