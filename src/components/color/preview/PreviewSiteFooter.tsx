import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { brandStyle, captionStyle, labelStyle, type PreviewFonts } from './previewTypography';

/** Quiet closing row for website mockups: wordmark, legal line, a few links. Neutral chrome only. */
export function PreviewSiteFooter({
  colors,
  fonts,
  brand,
  legal,
  links,
  gutterClass,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  brand: string;
  legal: string;
  links: readonly string[];
  gutterClass: string;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className={`flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t py-6 ${gutterClass}`}
      style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
    >
      <div className="flex min-w-0 items-baseline gap-4">
        <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} style={brandStyle(fonts)}>
          {brand}
        </PreviewSlotTarget>
        <PreviewSlotTarget slot="mutedText" onEditSlot={onEditSlot} style={captionStyle(fonts, colors.mutedText)}>
          {legal}
        </PreviewSlotTarget>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Pie de página">
        {links.map((link) => (
          <span key={link} style={labelStyle(fonts, colors.mutedText)}>
            {link}
          </span>
        ))}
      </nav>
    </PreviewSlotTarget>
  );
}
