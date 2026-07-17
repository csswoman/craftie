import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { MEDIA_QUEUE, MEDIA_STATS } from './mediaPreviewData';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import { bodyStyle, displayStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

type MediaAsidePanelsProps = {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
};

export function MediaAsidePanels({ colors, fonts, onEditSlot }: MediaAsidePanelsProps) {
  return (
    <div className="grid gap-4">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-[14px] border p-4"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Ritmo del estudio
        </PreviewSlotTarget>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {MEDIA_STATS.map((item) => (
            <div key={item.label} className="min-w-0">
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
                {item.label}
              </PreviewSlotTarget>
              <PreviewSlotTarget
                slot="text"
                onEditSlot={onEditSlot}
                className="mt-1 block tabular-nums"
                style={displayStyle(fonts)}
              >
                {item.value}
              </PreviewSlotTarget>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-[14px] border p-4"
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
              style={bodyStyle(fonts, colors.mutedText)}
            >
              Lo que Craftie pone mientras seca la pintura.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="data3"
            onEditSlot={onEditSlot}
            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colors.data3 }}
          />
        </div>
        <div className="mt-4 space-y-1">
          {MEDIA_QUEUE.map((item, index) => {
            const swatch = [colors.data1, colors.data2, colors.data3][index]!;

            return (
              <div
                key={item.track}
                className="group flex items-center gap-3 rounded-[10px] px-1.5 py-2 transition-colors duration-150 hover:bg-[color-mix(in_srgb,currentColor_6%,transparent)]"
              >
                <span
                  className="h-8 w-8 shrink-0 rounded-[10px] transition-transform duration-200 ease-out group-hover:rotate-[-3deg] motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
                  style={{
                    backgroundImage: `radial-gradient(circle at 30% 30%, ${tint(swatch, 72)}, ${tint(swatch, 28)})`,
                  }}
                  aria-hidden="true"
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
                      style={bodyStyle(fonts, colors.mutedText)}
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
