import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';

export const DASHBOARD_VISUAL_SLOTS = [
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
  'success',
  'warning',
  'data1',
  'data2',
  'data3',
  'data4',
] as const;

export function DashboardLayoutPreview({ colors, fonts = DEFAULT_PREVIEW_FONTS, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const bars = [
    { label: 'Lun', value: '64%', amount: '$18.4k', color: colors.data1, slot: 'data1' },
    { label: 'Mar', value: '78%', amount: '$22.1k', color: colors.data4, slot: 'data4' },
    { label: 'Mie', value: '52%', amount: '$15.8k', color: colors.data2, slot: 'data2' },
    { label: 'Jue', value: '86%', amount: '$24.7k', color: colors.data3, slot: 'data3' },
  ] as const;
  const metrics = [
    { label: 'Pipeline', value: '$84.2k', trend: '+12%', trendSlot: 'success' },
    { label: 'Conversion', value: '18.4%', trend: '+3.1%', trendSlot: 'accent' },
    { label: 'Velocity', value: '142', trend: '24h', trendSlot: 'text' },
    { label: 'Risk', value: '7', trend: 'Review', trendSlot: 'warning' },
  ] as const;
  const activityItems = [
    { label: 'Invoice approved', detail: 'North America', slot: 'success' },
    { label: 'New account opened', detail: 'Self-serve', slot: 'accent' },
    { label: 'Budget threshold', detail: 'Needs review', slot: 'warning' },
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
      <div className="flex min-h-[34rem]">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="hidden w-52 shrink-0 border-r p-4 lg:block"
          style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3">
              <PreviewSlotTarget
                slot="primaryAction"
                onEditSlot={onEditSlot}
                className="grid h-9 w-9 place-items-center rounded-xl"
                style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
              >
                <span className="text-[0.8125rem] font-bold">C</span>
              </PreviewSlotTarget>
              <div className="min-w-0">
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="truncate text-[0.8125rem] font-bold">
                  Craftie Ops
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem]" style={{ color: colors.mutedText }}>
                  Revenue desk
                </PreviewSlotTarget>
              </div>
            </div>

            <nav className="mt-6 space-y-1.5 text-[0.75rem] font-semibold">
              {['Overview', 'Pipeline', 'Accounts', 'Forecast', 'Team'].map((item, index) => (
                <PreviewSlotTarget
                  key={item}
                  slot={index === 0 ? 'surfaceElevated' : 'chrome'}
                  onEditSlot={onEditSlot}
                  className="rounded-lg px-3 py-2"
                  style={{
                    backgroundColor: index === 0 ? colors.surfaceElevated : 'transparent',
                    color: colors.text,
                  }}
                >
                  {item}
                </PreviewSlotTarget>
              ))}
            </nav>

            <PreviewSlotTarget
              slot="surface"
              onEditSlot={onEditSlot}
              className="mt-auto rounded-xl border p-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                This week
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>
                92% on track
              </PreviewSlotTarget>
            </PreviewSlotTarget>
          </div>
        </PreviewSlotTarget>

        <main className="min-w-0 flex-1 p-4 sm:p-5 lg:p-6">
          <PreviewSlotTarget
            slot="chrome"
            onEditSlot={onEditSlot}
            className="rounded-xl border px-4 py-3"
            style={{ backgroundColor: colors.chrome, borderColor: colors.border }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                  Week overview
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="text"
                  onEditSlot={onEditSlot}
                  className="mt-1 text-[1.25rem] font-bold tracking-normal sm:text-[1.5rem]"
                  style={{ fontFamily: fonts.headingFamily }}
                >
                  Revenue operations
                </PreviewSlotTarget>
              </div>
              <div className="flex items-center gap-2">
                <PreviewSlotTarget
                  slot="surfaceElevated"
                  onEditSlot={onEditSlot}
                  className="rounded-full px-3 py-1 text-[0.6875rem] font-semibold"
                  style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
                >
                  14 active deals
                </PreviewSlotTarget>
                <PreviewSlotTarget
                  slot="primaryAction"
                  onEditSlot={onEditSlot}
                  className="rounded-lg px-3.5 py-2 text-[0.75rem] font-bold"
                  style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
                >
                  Export
                </PreviewSlotTarget>
              </div>
            </div>
          </PreviewSlotTarget>

          <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(16rem,0.95fr)]">
            <div className="min-w-0">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    colors={colors}
                    fonts={fonts}
                    label={metric.label}
                    value={metric.value}
                    trend={metric.trend}
                    trendSlot={metric.trendSlot}
                    onEditSlot={onEditSlot}
                  />
                ))}
              </section>

              <PreviewSlotTarget
                slot="surface"
                onEditSlot={onEditSlot}
                className="mt-4 rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                      Channel performance
                    </PreviewSlotTarget>
                    <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                      Expressive color stays inside the data layer.
                    </PreviewSlotTarget>
                  </div>
                  <PreviewSlotTarget
                    slot="surfaceElevated"
                    onEditSlot={onEditSlot}
                    className="rounded-full px-3 py-1 text-[0.6875rem] font-bold"
                    style={{ backgroundColor: colors.surfaceElevated, color: colors.text }}
                  >
                    Live
                  </PreviewSlotTarget>
                </div>

                <div className="mt-5 grid grid-cols-4 items-end gap-3">
                  {bars.map((bar) => (
                    <div key={bar.label} className="min-w-0">
                      <PreviewSlotTarget
                        slot={bar.slot}
                        onEditSlot={onEditSlot}
                        className="rounded-t-lg"
                        style={{
                          height: bar.value,
                          minHeight: '8rem',
                          backgroundColor: bar.color,
                        }}
                      />
                      <div className="border-x border-b px-2 py-2" style={{ borderColor: colors.divider }}>
                        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.75rem] font-semibold">
                          {bar.label}
                        </PreviewSlotTarget>
                        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
                          {bar.amount}
                        </PreviewSlotTarget>
                      </div>
                    </div>
                  ))}
                </div>
              </PreviewSlotTarget>
            </div>

            <div className="grid gap-4">
              <PreviewSlotTarget
                slot="surfaceElevated"
                onEditSlot={onEditSlot}
                className="rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
              >
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                  Focus
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                  Revenue quality
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-3 text-[0.75rem] leading-relaxed" style={{ color: colors.mutedText }}>
                  Keep the chrome quiet so the selected palette is judged on hierarchy, data color, and CTA emphasis instead of decorative UI.
                </PreviewSlotTarget>
              </PreviewSlotTarget>

              <PreviewSlotTarget
                slot="surface"
                onEditSlot={onEditSlot}
                className="rounded-xl border p-4 lg:p-5"
                style={{ backgroundColor: colors.surface, borderColor: colors.border }}
              >
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>
                  Activity
                </PreviewSlotTarget>
                <div className="mt-4 space-y-3">
                  {activityItems.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <PreviewSlotTarget
                        slot={item.slot}
                        onEditSlot={onEditSlot}
                        className="mt-1 h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.slot === 'success' ? colors.success : item.slot === 'accent' ? colors.accent : colors.warning,
                        }}
                      />
                      <div className="min-w-0">
                        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.75rem] font-semibold">
                          {item.label}
                        </PreviewSlotTarget>
                        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
                          {item.detail}
                        </PreviewSlotTarget>
                      </div>
                    </div>
                  ))}
                </div>
              </PreviewSlotTarget>
            </div>
          </section>
        </main>
      </div>
    </PreviewSlotTarget>
  );
}

function MetricCard({ colors, fonts, label, value, trend, trendSlot, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  label: string;
  value: string;
  trend: string;
  trendSlot: 'success' | 'accent' | 'text' | 'warning';
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const trendColor = trendSlot === 'success'
    ? colors.success
    : trendSlot === 'accent'
      ? colors.accent
      : trendSlot === 'warning'
        ? colors.warning
        : colors.text;

  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-xl border p-3.5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
        {label}
      </PreviewSlotTarget>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <PreviewSlotTarget
          slot="text"
          onEditSlot={onEditSlot}
          className="min-w-0 text-[1.25rem] font-bold leading-none xl:text-[1.375rem]"
          style={{ fontFamily: fonts.headingFamily }}
        >
          {value}
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot={trendSlot}
          onEditSlot={onEditSlot}
          className="shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold"
          style={{
            backgroundColor: colors.surfaceElevated,
            color: trendColor,
          }}
        >
          {trend}
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
