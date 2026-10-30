import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { MediaCoverArt } from './MediaCoverArt';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_QUEUE, MEDIA_STATS } from './mediaPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { compactBodyStyle, displayStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type MediaAsidePanelsProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function MediaAsidePanels({ colors, fonts, onEditSlot }: MediaAsidePanelsProps) {
  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3">
        {MEDIA_STATS.map((item, index) => {
          const slot = index === 0 ? 'brand1' : 'brand2';
          const fill = colors[slot];
          const ink = onVividFill(fill);

          return (
            <PreviewSlotTarget
              key={item.label}
              slot={slot}
              onEditSlot={onEditSlot}
              className="preview-lift min-w-0 rounded-[14px] p-4 shadow-[0_16px_26px_-18px_rgb(0_0_0/0.5)]"
              style={{ backgroundColor: fill, color: ink }}
            >
              <span className="block" style={labelStyle(fonts, ink)}>
                {item.label}
              </span>
              <span className="mt-1 block tabular-nums" style={displayStyle(fonts)}>
                {item.value}
              </span>
            </PreviewSlotTarget>
          );
        })}
      </div>

      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="preview-surface rounded-[14px] border p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
              Siguiente
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="mutedText"
              onEditSlot={onEditSlot}
              className="mt-1 text-pretty"
              style={compactBodyStyle(fonts, colors.mutedText)}
            >
              Lo que Craftie pone mientras seca la pintura.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="brand1"
            onEditSlot={onEditSlot}
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors.brand1 }}
          />
        </div>
        <div className="mt-5 space-y-1">
          {MEDIA_QUEUE.map((item, index) => {
            return (
              <div
                key={item.track}
                className="group flex items-center gap-3 rounded-[10px] px-1.5 py-2 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_6%,transparent)]"
              >
                <MediaCoverArt
                  colors={colors}
                  seed={index}
                  className="size-9 shrink-0 rounded-[10px] transition-transform duration-200 ease-out group-hover:rotate-[-3deg] motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                />
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <PreviewIcon
                    name="play"
                    size={10}
                    className="shrink-0 opacity-0 transition-opacity duration-150 group-hover:opacity-70"
                  />
                  <span className="min-w-0">
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                      {item.track}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget
                      slot="mutedText"
                      onEditSlot={onEditSlot}
                      className="block truncate"
                      style={compactBodyStyle(fonts, colors.mutedText)}
                    >
                      {item.artist}
                    </PreviewSlotTarget>
                  </span>
                </span>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="shrink-0 tabular-nums"
                  style={labelStyle(fonts, colors.mutedText)}
                >
                  {item.time}
                </PreviewSlotTarget>
              </div>
            );
          })}
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
