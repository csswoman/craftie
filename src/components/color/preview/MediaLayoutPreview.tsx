import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

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
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
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
        fontFamily: fonts.bodyFamily,
      }}
    >
      <div className="min-h-[32rem] p-4 sm:p-5 lg:p-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold" style={{ color: colors.mutedText }}>
              Evening queue
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1.25rem] font-extrabold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
              Studio radio
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="surfaceElevated"
            onEditSlot={onEditSlot}
            className="rounded-full px-3 py-1.5 text-[0.75rem] font-bold transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
            style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
          >
            Library
          </PreviewSlotTarget>
        </header>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.85fr)]">
          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="rounded-xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-center">
              <PreviewSlotTarget
                slot="surfaceElevated"
                onEditSlot={onEditSlot}
                className="mx-auto aspect-square w-48 rounded-xl border transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-1"
                style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.divider }}
              >
                <div className="flex h-full items-end p-4">
                  <PreviewSlotTarget
                    slot="accent"
                    onEditSlot={onEditSlot}
                    className="h-2.5 w-full rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  />
                </div>
              </PreviewSlotTarget>

              <div className="min-w-0">
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold" style={{ color: colors.mutedText }}>
                  Now playing
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 text-[1.5rem] font-extrabold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                  Red Flower Static
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2 max-w-sm text-[0.8125rem] leading-relaxed" style={{ color: colors.mutedText }}>
                  Low-light mix for focused sessions, with calmer chrome and brighter transport controls.
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="accent"
                  onEditSlot={onEditSlot}
                  className="mt-5 h-1.5 w-full rounded-full"
                  style={{ backgroundColor: colors.accent }}
                />
                <div className="mt-5 flex items-center gap-4">
                  <PreviewSlotTarget
                    slot="surfaceElevated"
                    onEditSlot={onEditSlot}
                    className="grid h-10 w-10 place-items-center rounded-full text-[0.875rem] font-bold transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
                    style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
                  >
                    ‹
                  </PreviewSlotTarget>
                  <PreviewSlotTarget
                    slot="primaryAction"
                    onEditSlot={onEditSlot}
                    className="grid h-14 w-14 place-items-center rounded-full text-[0.875rem] font-extrabold transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:scale-[1.02]"
                    style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
                  >
                    ▶
                  </PreviewSlotTarget>
                  <PreviewSlotTarget
                    slot="surfaceElevated"
                    onEditSlot={onEditSlot}
                    className="grid h-10 w-10 place-items-center rounded-full text-[0.875rem] font-bold transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
                    style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
                  >
                    ›
                  </PreviewSlotTarget>
                </div>
              </div>
            </div>
          </PreviewSlotTarget>

          <div className="grid gap-4">
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="rounded-xl border p-4 transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                Queue status
              </PreviewSlotTarget>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Queued', value: '18' },
                  { label: 'Saved', value: '64' },
                ].map((item) => (
                  <div key={item.label}>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold" style={{ color: colors.mutedText }}>
                      {item.label}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 block text-[1.125rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                      {item.value}
                    </PreviewSlotTarget>
                  </div>
                ))}
              </div>
            </PreviewSlotTarget>

            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="rounded-xl border p-4 transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.9375rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                    Next up
                  </PreviewSlotTarget>
                  <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                    Atmospheric background, brighter controls.
                  </PreviewSlotTarget>
                </div>
                <PreviewSlotTarget slot="accent" onEditSlot={onEditSlot} className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { track: 'Night bloom', time: '3:18' },
                  { track: 'Granite pulse', time: '4:02' },
                  { track: 'Signal afterglow', time: '4:02' },
                ].map((item) => (
                  <div key={item.track} className="flex items-center justify-between gap-3 text-[0.75rem]">
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate font-bold">
                      {item.track}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="shrink-0" style={{ color: colors.mutedText }}>
                      {item.time}
                    </PreviewSlotTarget>
                  </div>
                ))}
              </div>
            </PreviewSlotTarget>
          </div>
        </section>
      </div>
    </PreviewSlotTarget>
  );
}
