'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_NOTIFICATIONS, ANALYTICS_SETTINGS } from './analyticsPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import { headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

export function AnalyticsWorkspacePanels({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    walk: true,
    hungry: true,
    nap: false,
  });

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Avisos del estudio
          </PreviewSlotTarget>
          <span
            className="rounded-full px-2 py-0.5"
            style={{ ...labelStyle(fonts), backgroundColor: tint(colors.data4, 14), color: colors.data4 }}
          >
            3 nuevos
          </span>
        </div>
        <div className="mt-4 space-y-1">
          {ANALYTICS_NOTIFICATIONS.map((item, index) => (
            <div
              key={item.title}
              className="preview-list-in flex items-center gap-3 rounded-[10px] px-2 py-2 transition-colors duration-150 ease-out hover:bg-(--notify-hover) motion-reduce:transition-none"
              style={{
                animationDelay: `${index * 45}ms`,
                ['--notify-hover' as string]: tint(colors.mutedText, 8),
              }}
            >
              <PreviewSlotTarget
                slot={item.slot}
                onEditSlot={onEditSlot}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
                style={{ backgroundColor: tint(colors[item.slot], 13), color: colors[item.slot] }}
              >
                <PreviewIcon name={item.icon} size={15} />
              </PreviewSlotTarget>
              <div className="min-w-0 flex-1">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                  {item.title}
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="mutedText"
                  onEditSlot={onEditSlot}
                  className="block"
                  style={labelStyle(fonts, colors.mutedText)}
                >
                  {item.detail}
                </PreviewSlotTarget>
              </div>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors.data4 }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-[14px] border p-4 lg:p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Preferencias de Craftie
        </PreviewSlotTarget>
        <div className="mt-4 space-y-3">
          {ANALYTICS_SETTINGS.map((item) => {
            const active = enabled[item.id] ?? false;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
                  style={{ backgroundColor: tint(colors.data2, 11), color: colors.data2 }}
                >
                  <PreviewIcon name={item.icon} size={15} />
                </span>
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
                <button
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={`Alternar ${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setEnabled((current) => ({ ...current, [item.id]: !active }));
                  }}
                  className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                  style={{
                    backgroundColor: active ? colors.data4 : tint(colors.mutedText, 24),
                    outlineColor: colors.primaryAction,
                  }}
                >
                  <span
                    className="pointer-events-none block h-5 w-5 rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.18)] transition-transform duration-200 ease-out motion-reduce:transition-none"
                    style={{
                      backgroundColor: active ? onVividFill(colors.data4) : colors.surfaceElevated,
                      transform: active ? 'translateX(1.25rem)' : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </PreviewSlotTarget>
    </div>
  );
}
