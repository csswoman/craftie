import type { ResolvedLayoutColors, UiLayoutModeId, UiLayoutSlot } from '@lib/color/layoutModes';

import { AnalyticsLayoutPreview } from '@/components/color/preview/AnalyticsLayoutPreview';
import { DashboardLayoutPreview } from '@/components/color/preview/DashboardLayoutPreview';
import { EditorialLayoutPreview } from '@/components/color/preview/EditorialLayoutPreview';
import { LandingLayoutPreview } from '@/components/color/preview/LandingLayoutPreview';
import { MediaLayoutPreview } from '@/components/color/preview/MediaLayoutPreview';
import { MobileLayoutPreview } from '@/components/color/preview/MobileLayoutPreview';
import { StoreLayoutPreview } from '@/components/color/preview/StoreLayoutPreview';
import type { PreviewFonts } from '@/components/color/preview/previewTypography';

export function ActiveLayoutPreview({
  mode,
  colors,
  fonts,
  onEditSlot,
}: {
  mode: UiLayoutModeId;
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot: (slot: UiLayoutSlot, element: HTMLElement) => void;
}) {
  switch (mode) {
    case 'landing':
      return <LandingLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'media':
      return <MediaLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'analytics':
      return <AnalyticsLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'mobile':
      return <MobileLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'editorial':
      return <EditorialLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'store':
      return <StoreLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'dashboard':
    default:
      return <DashboardLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
  }
}
