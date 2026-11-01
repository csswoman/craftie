import type { ReactNode } from 'react';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { compactBodyStyle, headingStyle, type PreviewFonts } from './previewTypography';
import { useTx } from '@/context/I18nContext';

/** Shared panel for the analytics page: one header layout, one padding, one border. */
export function AnalyticsPanel({
  colors,
  fonts,
  title,
  subtitle,
  trailing,
  className = '',
  onEditSlot,
  children,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  className?: string;
  onEditSlot?: PreviewSlotEditHandler;
  children: ReactNode;
}) {
  const tx = useTx();
  return (
    <PreviewSlotTarget
      slot="surface"
      onEditSlot={onEditSlot}
      className={`preview-rise flex min-w-0 flex-col rounded-xl border p-5 @min-[800px]/analytics:p-6 ${className}`}
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={headingStyle(fonts)}>
            {tx(title)}
          </PreviewSlotTarget>
          {subtitle ? (
            <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} className="mt-1" style={compactBodyStyle(fonts, colors.mutedText)}>
              {tx(subtitle)}
            </PreviewSlotTarget>
          ) : null}
        </div>
        {trailing}
      </div>
      <div className="mt-5 flex min-h-0 flex-1 flex-col">{children}</div>
    </PreviewSlotTarget>
  );
}
