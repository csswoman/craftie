import type { ResolvedLayoutColors, UiLayoutModeId, UiLayoutSlot } from '@lib/color/layoutModes';

import { AnalyticsLayoutPreview } from '@/components/color/preview/AnalyticsLayoutPreview';
import { DashboardLayoutPreview } from '@/components/color/preview/DashboardLayoutPreview';
import { EditorialLayoutPreview } from '@/components/color/preview/EditorialLayoutPreview';
import { LandingLayoutPreview } from '@/components/color/preview/LandingLayoutPreview';
import { MediaLayoutPreview } from '@/components/color/preview/MediaLayoutPreview';
import { MobileLayoutPreview } from '@/components/color/preview/MobileLayoutPreview';
import { PreviewBrowserFrame } from '@/components/color/preview/PreviewBrowserFrame';
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
  onEditSlot?: (slot: UiLayoutSlot, element: HTMLElement) => void;
}) {
  switch (mode) {
    case 'landing':
      return (
        <PreviewBrowserFrame url="craftie.studio">
          <LandingLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
    case 'media':
      return (
        <PreviewBrowserFrame url="radio.craftie.studio">
          <MediaLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
    case 'analytics':
      return (
        <PreviewBrowserFrame url="metricas.craftie.studio">
          <AnalyticsLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
    case 'mobile':
      return <MobileLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />;
    case 'editorial':
      return (
        <PreviewBrowserFrame url="revistataller.com/ensayos">
          <EditorialLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
    case 'store':
      return (
        <PreviewBrowserFrame url="casabarro.es">
          <StoreLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
    case 'dashboard':
    default:
      return (
        <PreviewBrowserFrame url="app.craftie.studio/estudio">
          <DashboardLayoutPreview colors={colors} fonts={fonts} onEditSlot={onEditSlot} />
        </PreviewBrowserFrame>
      );
  }
}
