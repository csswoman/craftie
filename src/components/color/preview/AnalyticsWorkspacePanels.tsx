'use client';

import { useState } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PreviewIcon } from './previewIcons';
import { tint } from './previewPrimitives';
import { headingStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';

const NOTIFICATIONS = [
  { title: 'New campaign comment', detail: '2 min ago', icon: 'activity', slot: 'data1' },
  { title: 'Audience goal reached', detail: '15 min ago', icon: 'users', slot: 'success' },
  { title: 'Report reminder in 30 min', detail: '1 hour ago', icon: 'bell', slot: 'data6' },
] as const;

const SETTINGS = [
  { id: 'weekly', title: 'Weekly digest', detail: 'Email performance summary', icon: 'grid' },
  { id: 'alerts', title: 'Smart alerts', detail: 'Notify unusual changes', icon: 'bell' },
  { id: 'privacy', title: 'Private reports', detail: 'Limit shared access', icon: 'shield' },
] as const;

export function AnalyticsWorkspacePanels({ colors, fonts, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ weekly: true, alerts: true, privacy: false });

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <PreviewSlotTarget
        slot="surfaceElevated"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5"
        style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
      >
        <div className="flex items-center justify-between gap-3">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            Notifications
          </PreviewSlotTarget>
          <span className="rounded-full px-2 py-0.5" style={{ ...labelStyle(fonts), backgroundColor: tint(colors.data4, 14), color: colors.data4 }}>
            3 new
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {NOTIFICATIONS.map((item, index) => (
            <div key={item.title} className="preview-list-in flex items-center gap-3" style={{ animationDelay: `${index * 45}ms` }}>
              <PreviewSlotTarget
                slot={item.slot}
                onEditSlot={onEditSlot}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: tint(colors[item.slot], 13), color: colors[item.slot] }}
              >
                <PreviewIcon name={item.icon} size={15} />
              </PreviewSlotTarget>
              <div className="min-w-0 flex-1">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                  {item.title}
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block" style={labelStyle(fonts, colors.mutedText)}>
                  {item.detail}
                </PreviewSlotTarget>
              </div>
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: colors.data4 }} />
            </div>
          ))}
        </div>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="surface"
        onEditSlot={onEditSlot}
        className="rounded-xl border p-4 lg:p-5"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
          Report settings
        </PreviewSlotTarget>
        <div className="mt-4 space-y-3">
          {SETTINGS.map((item) => {
            const active = enabled[item.id] ?? false;
            return (
              <div key={item.id} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: tint(colors.data2, 11), color: colors.data2 }}>
                  <PreviewIcon name={item.icon} size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="block truncate" style={titleStyle(fonts)}>
                    {item.title}
                  </PreviewSlotTarget>
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="block truncate" style={labelStyle(fonts, colors.mutedText)}>
                    {item.detail}
                  </PreviewSlotTarget>
                </div>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`Toggle ${item.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setEnabled((current) => ({ ...current, [item.id]: !active }));
                  }}
                  className="relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: active ? colors.data4 : tint(colors.mutedText, 22) }}
                >
                  <span
                    className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full transition-transform duration-200"
                    style={{ backgroundColor: colors.surfaceElevated, transform: `translate(${active ? 23 : 4}px, -50%)` }}
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
