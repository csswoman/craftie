import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

export const ANALYTICS_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'surface',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'primaryAction',
  'primaryActionText',
  'data1',
  'data2',
  'data3',
  'data4',
  'data5',
] as const;

export function AnalyticsLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const series = [
    { label: 'Organic', color: colors.data1, value: '38%' },
    { label: 'Referral', color: colors.data2, value: '24%' },
    { label: 'Email', color: colors.data3, value: '18%' },
    { label: 'Paid', color: colors.data4, value: '12%' },
    { label: 'Direct', color: colors.data5, value: '8%' },
  ] as const;
  const summaryCards = [
    { label: 'Visitors', value: '42.8k' },
    { label: 'Qualified', value: '11.3k' },
    { label: 'Intent', value: '7.4%' },
  ] as const;

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
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="mb-4 flex items-center justify-between rounded-xl border px-4 py-3"
          style={{ backgroundColor: colors.chrome, borderColor: colors.border }}
        >
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-extrabold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
              Traffic mix
            </PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
              Neutral chrome, categorical color only.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="rounded-lg border px-3 py-1.5 text-[0.75rem] font-bold transition-all duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
            style={{
              backgroundColor: colors.primaryAction,
              borderColor: colors.border,
              color: colors.primaryActionText,
            }}
          >
            Filter
          </PreviewSlotTarget>
        </PreviewSlotTarget>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.9fr)]">
          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="rounded-xl border p-4 lg:p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                  Visitors by source
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                  Series tokens provide the only expressive color.
                </PreviewSlotTarget>
              </div>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1.5rem] font-bold leading-none" style={{ fontFamily: fonts.headingFamily }}>
                42.8k
              </PreviewSlotTarget>
            </div>

            <div className="mt-5 flex h-36 items-end gap-3">
              {series.map((item, index) => (
                <div key={item.label} className="flex min-w-0 flex-1 flex-col justify-end">
                  <PreviewSlotTarget
                    slot={(['data1', 'data2', 'data3', 'data4', 'data5'] as const)[index]}
                    onEditSlot={onEditSlot}
                    className="rounded-t-xl transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-1"
                    style={{
                      height: `${42 + index * 10}%`,
                      minHeight: '5.75rem',
                      backgroundColor: item.color,
                    }}
                  />
                  <div className="border-x border-b px-2 py-2" style={{ borderColor: colors.divider }}>
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate text-[0.75rem] font-semibold">
                      {item.label}
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
                      {item.value}
                    </PreviewSlotTarget>
                  </div>
                </div>
              ))}
            </div>
          </PreviewSlotTarget>

          <div className="grid gap-4">
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="rounded-xl border p-4 lg:p-5 transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                Source summary
              </PreviewSlotTarget>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {summaryCards.map((item) => (
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
              slot="surface"
              onEditSlot={onEditSlot}
              className="rounded-xl border p-4 lg:p-5 transition-transform duration-200 ease-out motion-reduce:transition-none hover:-translate-y-0.5"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                Mix breakdown
              </PreviewSlotTarget>
              <div className="mt-4 space-y-3">
                {series.map((item, index) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-[0.75rem]">
                    <span className="flex min-w-0 items-center gap-2 font-bold">
                      <PreviewSlotTarget
                        slot={(['data1', 'data2', 'data3', 'data4', 'data5'] as const)[index]}
                        onEditSlot={onEditSlot}
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="shrink-0" style={{ color: colors.mutedText }}>
                      {item.value}
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
