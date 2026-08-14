'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAY_STATS, ANALYTICS_TOP_ACTIVITIES } from './analyticsPreviewData';
import { StatDelta, tint } from './previewPrimitives';
import { captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

export function AnalyticsAsidePanels({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <aside className="@container/analyticsaside flex min-w-0 flex-col gap-6">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Estado de ánimo
        </PreviewSlotTarget>
        <div className="mt-4 grid gap-4 @min-[480px]/analyticsaside:grid-cols-3 @min-[800px]/analytics:grid-cols-1">
          {ANALYTICS_DAY_STATS.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="mt-1 block tabular-nums"
                  style={{ ...titleStyle(fonts), fontSize: 'var(--size-h3)' }}
                >
                  {item.value}
                </PreviewSlotTarget>
              </div>
              <StatDelta
                value={item.trend}
                direction={item.dir}
                color={item.dir === 'up' ? colors.success : colors.error}
                slot={item.dir === 'up' ? 'success' : 'error'}
                onEditSlot={onEditSlot}
              />
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Sitios favoritos
        </PreviewSlotTarget>
        <div className="mt-4 space-y-4">
          {ANALYTICS_TOP_ACTIVITIES.map((place, index) => (
            <div key={place.label} className="preview-list-in" style={{ animationDelay: `${index * 45}ms` }}>
              <div className="mb-2 flex items-center gap-3">
                <span className="tabular-nums" style={captionStyle(fonts, colors[place.slot])}>
                  {index + 1}
                </span>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="min-w-0 flex-1 truncate"
                  style={titleStyle(fonts)}
                >
                  {place.label}
                </PreviewSlotTarget>
                <span className="shrink-0 tabular-nums" style={captionStyle(fonts, colors.mutedText)}>
                  {place.share}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: tint(colors[place.slot], 14) }}>
                <PreviewSlotTarget
                  slot={place.slot}
                  onEditSlot={onEditSlot}
                  className="block h-full rounded-full"
                  style={{ width: `${place.share}%`, backgroundColor: colors[place.slot] }}
                />
              </div>
            </div>
          ))}
        </div>
      </PreviewSlotTarget>
    </aside>
  );
}
