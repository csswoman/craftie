import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';

export const LANDING_VISUAL_SLOTS = [
  'appBackground',
  'chrome',
  'heroSurface',
  'onHero',
  'primaryAction',
  'primaryActionText',
  'secondaryAction',
  'secondaryActionText',
  'supportSurface',
  'supportSurfaceText',
  'surfaceElevated',
  'text',
  'mutedText',
  'border',
  'data1',
  'data2',
  'data3',
] as const;

export function LandingLayoutPreview({
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
      style={{ backgroundColor: colors.appBackground, borderColor: colors.border, color: colors.text }}
    >
      <PreviewSlotTarget
        slot="chrome"
        onEditSlot={onEditSlot}
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
      >
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.8125rem] font-bold tracking-normal">Northstar</PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="hidden gap-4 text-[0.6875rem] font-bold sm:flex" style={{ color: colors.mutedText }}>
          <span>Product</span>
          <span>Stories</span>
          <span>Pricing</span>
        </PreviewSlotTarget>
      </PreviewSlotTarget>

      <PreviewSlotTarget
        slot="heroSurface"
        onEditSlot={onEditSlot}
        className="px-5 py-8 sm:px-7"
        style={{
          backgroundColor: colors.heroSurface ?? colors.primaryAction,
          color: colors.onHero ?? colors.primaryActionText,
        }}
      >
        <div className="max-w-sm">
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="text-[0.75rem] font-bold opacity-80">Launch system</PreviewSlotTarget>
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="mt-2 font-body text-[1.75rem] font-extrabold leading-tight tracking-normal">
            Ship the brand story with fewer loose ends.
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="onHero" onEditSlot={onEditSlot} className="mt-3 text-[0.875rem] leading-relaxed opacity-85">
            A focused landing experience where the primary tone carries the hero and the main call to action.
          </PreviewSlotTarget>
          <div className="mt-5 flex flex-wrap gap-2">
            <PreviewSlotTarget
              slot="primaryAction"
              onEditSlot={onEditSlot}
              className="rounded-md px-4 py-2 text-[0.8125rem] font-bold"
              style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
            >
              Start trial
            </PreviewSlotTarget>
            <PreviewSlotTarget
              slot="secondaryAction"
              onEditSlot={onEditSlot}
              className="rounded-md border px-4 py-2 text-[0.8125rem] font-bold"
              style={{
                backgroundColor: colors.secondaryAction ?? colors.surface,
                borderColor: colors.onHero ?? colors.primaryActionText,
                color: colors.secondaryActionText ?? colors.text,
              }}
            >
              View demo
            </PreviewSlotTarget>
          </div>
        </div>
      </PreviewSlotTarget>

      <main className="grid gap-3 p-4 sm:grid-cols-[1fr_0.9fr] sm:p-5">
        <PreviewSlotTarget
          slot="supportSurface"
          onEditSlot={onEditSlot}
          className="rounded-lg border p-4"
          style={{ backgroundColor: colors.supportSurface ?? colors.surface, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="supportSurfaceText" onEditSlot={onEditSlot} className="font-body text-[0.9375rem] font-bold tracking-normal">
            Built for campaign teams
          </PreviewSlotTarget>
          <PreviewSlotTarget
            slot="supportSurfaceText"
            onEditSlot={onEditSlot}
            className="mt-2 text-[0.8125rem] leading-relaxed"
            style={{ color: colors.supportSurfaceText ?? colors.mutedText }}
          >
            Secondary color is reserved for supporting actions and moments of contrast, while body content stays neutral.
          </PreviewSlotTarget>
        </PreviewSlotTarget>
        <PreviewSlotTarget
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="rounded-lg border p-4"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        >
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="font-body text-[0.9375rem] font-bold tracking-normal">Proof points</PreviewSlotTarget>
          <div className="mt-4 space-y-3">
            {['Faster approval', 'Reusable launch kit', 'Accessible by default'].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <PreviewSlotTarget
                  slot={(['data1', 'data2', 'data3'] as const)[index]}
                  onEditSlot={onEditSlot}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: [colors.data1, colors.data2, colors.data3][index] }}
                />
                <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="text-[0.75rem] font-bold">{item}</PreviewSlotTarget>
              </div>
            ))}
          </div>
        </PreviewSlotTarget>
      </main>
    </PreviewSlotTarget>
  );
}
