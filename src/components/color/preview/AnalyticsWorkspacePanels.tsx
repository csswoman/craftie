'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_NOTIFICATIONS, ANALYTICS_SETTINGS } from './analyticsPreviewData';
import { onVividFill } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import { captionStyle, headingStyle, titleStyle, type PreviewFonts } from './previewTypography';

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
  const accent = colors.accent;
  const onAccent = onVividFill(accent);

  return (
    <div className="mt-6 grid gap-6 @min-[720px]/analytics:grid-cols-2">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5 @min-[800px]/analytics:p-6"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Avisos del estudio
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="accent"
            onEditSlot={onEditSlot}
            className="rounded-full px-2 py-0.5"
            style={{ ...captionStyle(fonts), backgroundColor: tint(accent, 14), color: accent }}
          >
            3 nuevos
          </PreviewSlotTarget>
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
                  style={captionStyle(fonts, colors.mutedText)}
                >
                  {item.detail}
                </PreviewSlotTarget>
              </div>
              <PreviewSlotTarget
                slot="accent"
                onEditSlot={onEditSlot}
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-5 @min-[800px]/analytics:p-6"
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
                  style={{ backgroundColor: tint(colors.mutedText, 10), color: colors.mutedText }}
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
                    style={captionStyle(fonts, colors.mutedText)}
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
                    backgroundColor: active ? accent : tint(colors.mutedText, 24),
                    outlineColor: accent,
                  }}
                >
                  <span
                    className="pointer-events-none block h-5 w-5 rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.18)] transition-transform duration-200 ease-out motion-reduce:transition-none"
                    style={{
                      backgroundColor: active ? onAccent : colors.surfaceElevated,
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
