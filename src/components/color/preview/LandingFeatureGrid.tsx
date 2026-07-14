import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { PreviewIcon, type PreviewIconName } from './previewIcons';
import { bodyStyle, titleStyle, type PreviewFonts } from './previewTypography';

const FEATURES: Array<{ title: string; text: string; icon: PreviewIconName }> = [
  { title: 'Story', text: 'Clear hero hierarchy for launches and announcements.', icon: 'sparkles' },
  { title: 'System', text: 'Reusable modules that still adapt to each palette.', icon: 'layers' },
  { title: 'Trust', text: 'Accessible defaults that keep the interface credible.', icon: 'shield' },
];

export function LandingFeatureGrid({ colors, fonts, onEditSlot }: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {FEATURES.map((item) => (
        <PreviewSlotTarget
          key={item.title}
          slot="surfaceElevated"
          onEditSlot={onEditSlot}
          className="rounded-xl border p-4 transition-transform duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.border }}
        >
          <PreviewSlotTarget
            slot="primaryAction"
            onEditSlot={onEditSlot}
            className="grid h-8 w-8 place-items-center rounded-lg"
            style={{ backgroundColor: colors.primaryAction, color: colors.primaryActionText }}
          >
            <PreviewIcon name={item.icon} size={15} />
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="mt-3 text-[0.875rem]" style={{ ...titleStyle(fonts), fontWeight: 600 }}>
            {item.title}
          </PreviewSlotTarget>
          <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-2 text-[0.75rem]" style={bodyStyle(fonts, colors.mutedText)}>
            {item.text}
          </PreviewSlotTarget>
        </PreviewSlotTarget>
      ))}
    </div>
  );
}
