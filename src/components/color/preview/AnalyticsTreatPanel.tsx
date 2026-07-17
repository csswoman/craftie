import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import {
  ANALYTICS_MONTHS,
  ANALYTICS_RECENT_TREATS,
  ANALYTICS_TREAT_BREAKDOWN,
  ANALYTICS_TREAT_HIGHLIGHTS,
  ANALYTICS_TREAT_MILESTONE,
  ANALYTICS_TREATS,
} from './analyticsPreviewData';
import { PreviewIcon } from './previewIcons';
import { StatDelta, tint } from './previewPrimitives';
import { displayStyle, headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

export function AnalyticsTreatPanel({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <div className="mt-5 flex flex-1 flex-col border-t pt-4" style={{ borderColor: colors.divider }}>
      <div className="flex items-center justify-between gap-3">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Premios
        </PreviewSlotTarget>
        <StatDelta value="12%" direction="up" color={colors.success} slot="success" onEditSlot={onEditSlot} />
      </div>

      <div className="mt-3 grid gap-4 @min-[720px]/analytics:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block tabular-nums" style={displayStyle(fonts)}>
            1,254
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="mt-1 block"
            style={labelStyle(fonts, colors.mutedText)}
          >
            acumulados este semestre
          </PreviewSlotTarget>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {ANALYTICS_TREAT_HIGHLIGHTS.map((item) => (
              <div
                key={item.label}
                className="rounded-[10px] px-2.5 py-2"
                style={{ backgroundColor: tint(colors.mutedText, 8) }}
              >
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="block"
                  style={labelStyle(fonts, colors.mutedText)}
                >
                  {item.label}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="mt-0.5 block tabular-nums"
                  style={titleStyle(fonts)}
                >
                  {item.value}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="block"
                  style={{ ...labelStyle(fonts, colors.mutedText), fontSize: '0.6875rem' }}
                >
                  {item.detail}
                </PreviewSlotTarget>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {ANALYTICS_TREAT_BREAKDOWN.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                <PreviewSlotTarget
                  slot={item.slot}
                  onEditSlot={onEditSlot}
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colors[item.slot] }}
                />
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="min-w-0 flex-1 truncate"
                  style={labelStyle(fonts)}
                >
                  {item.label}
                </PreviewSlotTarget>
                <span className="shrink-0 tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                  {item.value}
                </span>
                <span className="w-8 shrink-0 text-right tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                  {item.share}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid h-[7.5rem] grid-cols-6 items-end gap-2 border-b" style={{ borderColor: colors.divider }}>
            {ANALYTICS_TREATS.map((value, index) => (
              <div key={ANALYTICS_MONTHS[index]} className="flex h-full flex-col items-center justify-end gap-1">
                <span className="tabular-nums" style={labelStyle(fonts, colors.mutedText)}>
                  {value}
                </span>
                <PreviewSlotTarget
                  slot="data1"
                  onEditSlot={onEditSlot}
                  className="preview-bar-grow w-full rounded-t-md"
                  style={{
                    height: `${value}%`,
                    minHeight: 18,
                    backgroundColor: colors.data1,
                    animationDelay: `${index * 45}ms`,
                  }}
                  aria-label={`${ANALYTICS_MONTHS[index]} premios: ${value}`}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-6 text-center" style={labelStyle(fonts, colors.mutedText)}>
            {ANALYTICS_MONTHS.map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        className="mt-auto grid gap-3 border-t pt-4 @min-[720px]/analytics:grid-cols-2"
        style={{ borderColor: colors.divider }}
      >
        <div
          className="rounded-[10px] px-3 py-3"
          style={{ backgroundColor: tint(colors.mutedText, 8) }}
        >
          <div className="flex items-center justify-between gap-3">
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              {ANALYTICS_TREAT_MILESTONE.label}
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot={ANALYTICS_TREAT_MILESTONE.slot}
              onEditSlot={onEditSlot}
              className="tabular-nums font-semibold"
              style={{ ...titleStyle(fonts), color: colors[ANALYTICS_TREAT_MILESTONE.slot] }}
            >
              {ANALYTICS_TREAT_MILESTONE.value}%
            </PreviewSlotTarget>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: tint(colors.data1, 18) }}>
            <PreviewSlotTarget
              slot={ANALYTICS_TREAT_MILESTONE.slot}
              onEditSlot={onEditSlot}
              className="block h-full rounded-full"
              style={{ width: `${ANALYTICS_TREAT_MILESTONE.value}%`, backgroundColor: colors.data1 }}
            />
          </div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="tabular-nums" style={titleStyle(fonts)}>
              {ANALYTICS_TREAT_MILESTONE.current}
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              / {ANALYTICS_TREAT_MILESTONE.target}
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="mutedText"
            onEditSlot={onEditSlot}
            className="mt-1 block text-pretty"
            style={labelStyle(fonts, colors.mutedText)}
          >
            {ANALYTICS_TREAT_MILESTONE.detail}
          </PreviewSlotTarget>
        </div>

        <div className="min-w-0 space-y-2">
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
            Premios recientes
          </PreviewSlotTarget>
          {ANALYTICS_RECENT_TREATS.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2"
              style={{ backgroundColor: tint(colors.mutedText, 8) }}
            >
              <PreviewSlotTarget
                slot={item.slot}
                onEditSlot={onEditSlot}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                style={{ backgroundColor: tint(colors[item.slot], 16), color: colors[item.slot] }}
              >
                <PreviewIcon name={item.icon} size={12} />
              </PreviewSlotTarget>
              <div className="min-w-0 flex-1">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                  {item.title}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="block truncate"
                  style={labelStyle(fonts, colors.mutedText)}
                >
                  {item.detail}
                </PreviewSlotTarget>
              </div>
              <span className="shrink-0" style={labelStyle(fonts, colors.mutedText)}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
