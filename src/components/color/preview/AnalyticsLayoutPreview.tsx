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
  ];

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
      <div className="min-h-128 p-4 sm:p-5">
        <PreviewSlotTarget
          slot="chrome"
          onEditSlot={onEditSlot}
          className="mb-3 flex items-center justify-between rounded-lg border px-3 py-2"
          style={{ backgroundColor: colors.chrome, borderColor: colors.border }}
        >
          <div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.9375rem] font-extrabold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>Traffic mix</PreviewSlotTarget>
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-0.5 text-[0.6875rem]" style={{ color: colors.mutedText }}>
              Neutral chrome, categorical color only.
            </PreviewSlotTarget>
          </div>
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="rounded-md border px-3 py-1.5 text-[0.75rem] font-bold"
            style={{
              backgroundColor: colors.primaryAction,
              borderColor: colors.border,
              color: colors.primaryActionText,
            }}
          >
            Filter
          </PreviewSlotTarget>
        </PreviewSlotTarget>

        <PreviewSlotTarget
          slot="surface"
          onEditSlot={onEditSlot}
          className="rounded-lg border p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.875rem] font-bold tracking-normal" style={{ fontFamily: fonts.headingFamily }}>Visitors by source</PreviewSlotTarget>
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1 text-[0.75rem]" style={{ color: colors.mutedText }}>
                Series tokens provide the only expressive color.
              </PreviewSlotTarget>
            </div>
            <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[1.25rem] font-bold leading-none" style={{ fontFamily: fonts.headingFamily }}>42.8k</PreviewSlotTarget>
          </div>

          <div className="mt-5 flex h-24 items-end gap-2">
            {series.map((item, index) => (
              <PreviewSlotTarget
                key={item.label}
                slot={(['data1', 'data2', 'data3', 'data4', 'data5'] as const)[index]}
                onEditSlot={onEditSlot}
                className="flex-1 rounded-t-md"
                style={{
                  height: `${42 + index * 10}%`,
                  backgroundColor: item.color,
                }}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            {series.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 text-[0.75rem]">
                <span className="flex items-center gap-2 font-bold">
                  <PreviewSlotTarget
                    slot={(['data1', 'data2', 'data3', 'data4', 'data5'] as const)[series.indexOf(item)]}
                    onEditSlot={onEditSlot}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={{ color: colors.mutedText }}>{item.value}</PreviewSlotTarget>
              </div>
            ))}
          </div>
        </PreviewSlotTarget>

        <section className="mt-3 grid gap-3 sm:grid-cols-2">
          {['Retention', 'Activation'].map((label, index) => (
            <PreviewSlotTarget
              key={label}
              slot="surfaceElevated"
              onEditSlot={onEditSlot}
              className="rounded-lg border p-3"
              style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
            >
              <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="text-[0.6875rem] font-bold" style={{ color: colors.mutedText }}>
                {label}
              </PreviewSlotTarget>
              <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-2 block text-[1.125rem] font-bold" style={{ fontFamily: fonts.headingFamily }}>{index === 0 ? '71%' : '46%'}</PreviewSlotTarget>
            </PreviewSlotTarget>
          ))}
        </section>
      </div>
    </PreviewSlotTarget>
  );
}
