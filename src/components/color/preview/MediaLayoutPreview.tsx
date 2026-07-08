import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

export const MEDIA_VISUAL_SLOTS = [
  'appBackground',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'divider',
  'primaryAction',
  'primaryActionText',
  'accent',
] as const;

export function MediaLayoutPreview({
  colors,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <PreviewSlotTarget
      slot="appBackground"
      onEditSlot={onEditSlot}
      className="overflow-hidden rounded-xl border"
      style={{
        backgroundColor: colors.appBackground,
        borderColor: colors.border,
        color: colors.text,
      }}
    >
      <div className="min-h-128 p-4 sm:p-5">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold" style={{ color: colors.mutedText }}>
              Evening queue
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 font-body text-[1.125rem] font-extrabold tracking-normal">
              Studio radio
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="rounded-full px-3 py-1.5 text-[0.75rem] font-bold"
            style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
          >
            Library
          </PreviewSlotTarget>
        </header>

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="rounded-lg border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="mx-auto aspect-square w-36 rounded-lg border"
            style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.divider }}
          >
            <div className="flex h-full items-end p-3">
              <PreviewSlotTarget
                slot="accent"
                onEditSlot={onEditSlot}
                className="h-2 w-full rounded-full"
                style={{ backgroundColor: colors.accent }}
              />
            </div>
          </PreviewSlotTarget>

          <div className="mt-4 text-center">
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[1rem] font-extrabold tracking-normal">Red Flower Static</PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
              Low-light mix · 42 min
            </PreviewSlotTarget>
          </div>

          <div className="mt-5 flex items-center justify-center gap-4">
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="grid h-9 w-9 place-items-center rounded-full text-[0.875rem] font-bold"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              ‹
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="grid h-12 w-12 place-items-center rounded-full text-[0.875rem] font-extrabold"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
            >
              ▶
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="grid h-9 w-9 place-items-center rounded-full text-[0.875rem] font-bold"
              style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
            >
              ›
            </PreviewSlotTarget>
          </div>
        </PreviewSlotTarget>

        <PreviewSlotTarget
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="mt-3 rounded-lg border p-4"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.875rem] font-bold tracking-normal">Next up</PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                Atmospheric background, brighter controls.
              </PreviewSlotTarget>
            </div>
            <PreviewSlotTarget slot="accent" onEditSlot={onEditSlot} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
          </div>
          <div className="mt-4 space-y-2">
            {['Night bloom', 'Granite pulse', 'Signal afterglow'].map((track, index) => (
              <div key={track} className="flex items-center justify-between gap-3 text-[0.75rem]">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-bold">{track}</PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={{ color: colors.mutedText }}>{index === 0 ? '3:18' : '4:02'}</PreviewSlotTarget>
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
