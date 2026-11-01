'use client';

import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { MobileDetailScreen } from './MobileDetailScreen';
import { MobileHomeScreen } from './MobileHomeScreen';
import { MobileLibraryScreen } from './MobileLibraryScreen';
import { MobilePhoneFrame } from './MobilePhoneFrame';
import type { PreviewSlotEditHandler } from './PreviewSlotTarget';
import { previewStaggerDelay } from './dashboardPreviewData';
import { MOBILE_CONTAINER_CLASS } from './mobilePreviewData';
import { onVividFill, vividFill } from './previewColor';
import { DEFAULT_PREVIEW_FONTS, type PreviewFonts } from './previewTypography';
import { useT } from '@/context/I18nContext';

export const MOBILE_VISUAL_SLOTS = [
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
  'brand1',
  'brand2',
  'brand3',
  'brand4',
  'brand5',
  'brand6',
] as const;

export { MOBILE_CONTAINER_CLASS };

/**
 * Three screens of one app side by side (home, palette detail, library), so the
 * palette is seen across a real flow instead of on a single phone.
 * The middle phone sits lower to break the row; it wraps on narrow canvases.
 */
export function MobileLayoutPreview({
  colors,
  fonts = DEFAULT_PREVIEW_FONTS,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts?: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const t = useT();
  const primaryFill = vividFill(colors.primaryAction, colors.surface);
  const onPrimary = onVividFill(primaryFill);
  const screen = { colors, fonts, onEditSlot };

  return (
    <div className={`${MOBILE_CONTAINER_CLASS} flex w-full flex-wrap items-start justify-center gap-x-6 gap-y-10 py-4`}>
      <MobilePhoneFrame {...screen} activeTab="Hoy" tabColor={primaryFill} label={t('ui.MobileLayoutPreview.inicio')} className="preview-rise">
        <MobileHomeScreen {...screen} primaryFill={primaryFill} onPrimary={onPrimary} />
      </MobilePhoneFrame>
      <div className="preview-rise @min-[912px]/mobile:mt-12" style={{ animationDelay: previewStaggerDelay(1) }}>
        <MobilePhoneFrame {...screen} activeTab="Paletas" tabColor={primaryFill} label={t('ui.MobileLayoutPreview.detalle-de-paleta')}>
          <MobileDetailScreen {...screen} primaryFill={primaryFill} onPrimary={onPrimary} />
        </MobilePhoneFrame>
      </div>
      <div className="preview-rise" style={{ animationDelay: previewStaggerDelay(2) }}>
        <MobilePhoneFrame {...screen} activeTab="Paletas" tabColor={primaryFill} label={t('ui.MobileLayoutPreview.biblioteca')}>
          <MobileLibraryScreen {...screen} />
        </MobilePhoneFrame>
      </div>
    </div>
  );
}
