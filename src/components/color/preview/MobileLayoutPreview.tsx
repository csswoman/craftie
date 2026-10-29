'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewIcon } from './previewIcons';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import {
  getMobileGreeting,
  getMobileReviewNote,
  MOBILE_CONTAINER_CLASS,
  MOBILE_PALETTES,
  MOBILE_SUMMARY,
  MOBILE_TABS,
} from './mobilePreviewData';
import { onVividFill, vividFill } from './previewColor';
import { tint } from './previewPrimitives';
import {
  bodyStyle,
  captionStyle,
  DEFAULT_PREVIEW_FONTS,
  displayStyle,
  headingStyle,
  labelStyle,
  previewRootTypeStyle,
  titleStyle,
  type PreviewFonts,
} from './previewTypography';

export const MOBILE_VISUAL_SLOTS = [
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
  'data1',
  'data2',
  'data3',
  'data4',
  'data5',
  'data6',
] as const;

export { MOBILE_CONTAINER_CLASS };

export function MobileLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [activeTab, setActiveTab] = useState(MOBILE_TABS[0]!.label);
  const greeting = getMobileGreeting(new Date().getHours());
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);
  const [pinned, ...rest] = MOBILE_PALETTES;
  const dataSwatches = [colors.data1, colors.data2, colors.data3, colors.data4, colors.data5, colors.data6];

  function swatchHex(slot: string): string {
    const index = Number(slot.replace('data', '')) - 1;
    return dataSwatches[index] ?? colors.accent;
  }

  return (
    <div className={`${MOBILE_CONTAINER_CLASS} flex w-full justify-center`}>
      <PreviewSlotTarget
        slot="appBackground"
        onEditSlot={onEditSlot}
        className="flex min-h-[38rem] w-full max-w-[22rem] flex-col overflow-hidden rounded-[2rem] border"
        style={{
          backgroundColor: colors.appBackground,
          borderColor: colors.border,
          color: colors.text,
          ...previewRootTypeStyle(),
        }}
      >
        <header
          className="preview-rise flex items-center justify-between px-5 pb-3 pt-6"
          style={{ animationDelay: previewStaggerDelay(0) }}
        >
          <div className="min-w-0">
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={labelStyle(fonts, colors.mutedText)}>
              {greeting}
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-0.5" style={displayStyle(fonts)}>
              Tus paletas
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="grid size-10 shrink-0 place-items-center rounded-full border"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.mutedText }}
          >
            <PreviewIcon name="bell" size={18} />
          </PreviewSlotTarget>
        </header>

        <div className="flex-1 space-y-4 overflow-hidden px-5">
          <section
            className="preview-rise grid grid-cols-2 gap-3"
            style={{ animationDelay: previewStaggerDelay(1) }}
          >
            {MOBILE_SUMMARY.map((item) => (
              <PreviewSlotTarget
                key={item.label}
                slot="surface"
                onEditSlot={onEditSlot}
                className="rounded-2xl border p-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <PreviewSlotTarget slot={item.slot} onEditSlot={onEditSlot} className="size-2 rounded-full" style={{ backgroundColor: swatchHex(item.slot) }} />
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 block tabular-nums" style={headingStyle(fonts)}>
                  {item.value}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 block" style={captionStyle(fonts, colors.mutedText)}>
                  {item.label}
                </PreviewSlotTarget>
              </PreviewSlotTarget>
            ))}
          </section>

          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="preview-rise rounded-2xl border p-4"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border, animationDelay: previewStaggerDelay(2) }}
          >
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={titleStyle(fonts)}>
              {pinned!.name}
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 block" style={captionStyle(fonts, colors.mutedText)}>
              {getMobileReviewNote(0)}
            </PreviewSlotTarget>
            <div className="mt-3 flex gap-1.5">
              {pinned!.swatches.map((slot, index) => (
                <PreviewSlotTarget
                  key={`${slot}-${index}`}
                  slot={slot}
                  onEditSlot={onEditSlot}
                  className="h-8 flex-1 rounded-lg"
                  style={{ backgroundColor: swatchHex(slot) }}
                />
              ))}
            </div>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="mt-4 block rounded-xl py-2.5 text-center"
              style={{ ...labelStyle(fonts), fontWeight: 600, backgroundColor: primaryFill, color: onPrimary }}
            >
              Exportar guía
            </PreviewSlotTarget>
          </PreviewSlotTarget>

          <section className="preview-rise space-y-2" style={{ animationDelay: previewStaggerDelay(3) }}>
            {rest.map((palette) => (
              <PreviewSlotTarget
                key={palette.name}
                slot="surface"
                onEditSlot={onEditSlot}
                className="flex items-center gap-3 rounded-2xl border p-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <span className="flex shrink-0 gap-1" aria-hidden="true">
                  {palette.swatches.map((slot, index) => (
                    <span
                      key={`${slot}-${index}`}
                      className="size-6 rounded-md"
                      style={{ backgroundColor: tint(swatchHex(slot), 90) }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                    {palette.name}
                  </PreviewSlotTarget>
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block truncate" style={bodyStyle(fonts, colors.mutedText)}>
                    {palette.note}
                  </PreviewSlotTarget>
                </span>
                <PreviewIcon name="arrowRight" size={16} style={{ color: colors.mutedText }} />
              </PreviewSlotTarget>
            ))}
          </section>
        </div>

        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="mt-4 flex items-center justify-around border-t px-4 py-3"
          style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
        >
          {MOBILE_TABS.map((tab) => {
            const active = tab.label === activeTab;

            return (
              <button
                key={tab.label}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveTab(tab.label);
                }}
                className="flex flex-col items-center gap-1 rounded-lg px-3 py-1"
                style={{ color: active ? colors.text : colors.mutedText }}
              >
                <PreviewIcon name={tab.icon} size={18} style={{ color: active ? primaryFill : colors.mutedText }} />
                <span style={{ ...captionStyle(fonts), fontWeight: active ? 600 : 400 }}>{tab.label}</span>
              </button>
            );
          })}
        </PreviewSlotTarget>
      </PreviewSlotTarget>
    </div>
  );
}
