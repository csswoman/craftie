import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

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

export function DashboardLayoutPreview({
  colors,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const bars = [
    { label: 'Lun', value: '64%', color: colors.data1, slot: 'data1' },
    { label: 'Mar', value: '78%', color: colors.data4, slot: 'data4' },
    { label: 'Mie', value: '52%', color: colors.data2, slot: 'data2' },
    { label: 'Jue', value: '86%', color: colors.data3, slot: 'data3' },
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
      }}
    >
      <div className="flex min-h-128">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="hidden w-28 shrink-0 border-r p-3 sm:block"
          style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
        >
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="mb-5 h-7 w-7 rounded-md"
            style={{ backgroundColor: colors.primaryAction }}
          />
          <nav className="space-y-2 text-[0.6875rem] font-semibold">
            {['Home', 'Orders', 'Growth', 'Team'].map((item, index) => (
              <PreviewSlotTarget
                key={item}
                slot={index === 2 ? 'surfaceElevated' : 'chrome'}
                onEditSlot={onEditSlot}
                className="rounded-md px-2 py-1.5"
                style={{
                  backgroundColor: index === 2 ? colors.surfaceElevated : 'transparent',
                  color: colors.text,
                }}
              >
                {item}
              </PreviewSlotTarget>
            ))}
          </nav>
        </PreviewSlotTarget>

        <main className="min-w-0 flex-1 p-4 sm:p-5">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
                Week overview
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-1 font-body text-[1.125rem] font-bold tracking-normal">
                Revenue operations
              </PreviewSlotTarget>
            </div>
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="rounded-md px-3 py-2 text-[0.75rem] font-bold"
              style={{
                backgroundColor: colors.primaryAction,
                color: colors.primaryActionText,
              }}
            >
              Export
            </PreviewSlotTarget>
          </header>

          <section className="grid gap-3 sm:grid-cols-3">
            <MetricCard colors={colors} label="Pipeline" value="$84.2k" trend="+12%" onEditSlot={onEditSlot} />
            <MetricCard colors={colors} label="Conversion" value="18.4%" trend="+3.1%" onEditSlot={onEditSlot} />
            <MetricCard colors={colors} label="Risk" value="7" trend="Review" subtle onEditSlot={onEditSlot} />
          </section>

          <PreviewSlotTarget
            slot="surface"
            onEditSlot={onEditSlot}
            className="mt-3 rounded-lg border p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.9375rem] font-bold tracking-normal">
                  Channel performance
                </PreviewSlotTarget>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                  Expressive colors mark data only.
                </PreviewSlotTarget>
              </div>
              <PreviewSlotTarget
                slot="surfaceElevated"
                onEditSlot={onEditSlot}
                className="rounded-full px-2.5 py-1 text-[0.6875rem] font-bold"
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
                    className="rounded-t-md"
                    style={{
                      height: bar.value,
                      minHeight: '4.5rem',
                      backgroundColor: bar.color,
                    }}
                  />
                  <PreviewSlotTarget
                    slot="mutedText"
                    onEditSlot={onEditSlot}
                    className="border-t pt-2 text-center text-[0.6875rem] font-semibold"
                    style={{ borderColor: colors.divider, color: colors.mutedText }}
                  >
                    {bar.label}
                  </PreviewSlotTarget>
                </div>
              ))}
            </div>
          </PreviewSlotTarget>

          <section className="mt-3 grid gap-3 sm:grid-cols-[1fr_0.8fr]">
            <PreviewSlotTarget
              slot="surface"
              onEditSlot={onEditSlot}
              className="rounded-lg border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.875rem] font-bold tracking-normal">Activity</PreviewSlotTarget>
              <div className="mt-3 space-y-3">
                {['Invoice approved', 'New account opened', 'Budget threshold'].map((item, index) => (
                  <div key={item} className="flex items-center gap-3">
                    <PreviewSlotTarget
                      slot={(['success', 'accent', 'warning'] as const)[index]}
                      onEditSlot={onEditSlot}
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: [colors.success, colors.accent, colors.warning][index] }}
                    />
                    <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.75rem] font-semibold">{item}</PreviewSlotTarget>
                  </div>
                ))}
              </div>
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="rounded-lg border p-4"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.875rem] font-bold tracking-normal">Focus</PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2 text-[0.75rem] leading-relaxed" style={{ color: colors.mutedText }}>
                Neutral cards keep the interface calm while key actions and status stay visible.
              </PreviewSlotTarget>
            </PreviewSlotTarget>
          </section>
        </main>
      </div>
    </PreviewSlotTarget>
  );
}

function MetricCard({
  colors,
  label,
  value,
  trend,
  subtle = false,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  label: string;
  value: string;
  trend: string;
  subtle?: boolean;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className="rounded-lg border p-3"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-semibold" style={{ color: colors.mutedText }}>
        {label}
      </PreviewSlotTarget>
      <div className="mt-2 flex items-end justify-between gap-2">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1.25rem] font-bold leading-none">{value}</PreviewSlotTarget>
        <PreviewSlotTarget
          slot={subtle ? 'text' : 'accent'}
          onEditSlot={onEditSlot}
          className="rounded-full px-2 py-0.5 text-[0.6875rem] font-bold"
          style={{
            backgroundColor: colors.surfaceElevated,
            color: subtle ? colors.text : colors.accent,
          }}
        >
          {trend}
        </PreviewSlotTarget>
      </div>
    </PreviewSlotTarget>
  );
}
