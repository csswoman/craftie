import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_TABS } from './analyticsPreviewData';
import { readableInk } from './previewColor';
import { PreviewIcon } from './previewIcons';
import { Avatar } from './previewPrimitives';
import { brandStyle, labelStyle, ROLE_WEIGHT, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

/** Top navigation for the analytics app: wordmark, section tabs with an underline, date filter. */
export function AnalyticsTopBar({
  colors,
  fonts,
  onEditSlot,
}: {
  colors: ResolvedLayoutColors;
  fonts: PreviewFonts;
  onEditSlot?: PreviewSlotEditHandler;
}) {
  const tx = useTx();
  const t = useT();
  const underline = readableInk(colors.primaryAction, colors.chrome, 3);

  return (
    <PreviewSlotTarget
      slot="chrome"
      onEditSlot={onEditSlot}
      className="flex items-center gap-8 border-b px-6 @min-[900px]/analytics:px-8"
      style={{ backgroundColor: colors.chrome, borderColor: colors.divider }}
    >
      <PreviewSlotTarget slot="text" onEditSlot={onEditSlot} className="py-4" style={brandStyle(fonts)}>{t('ui.AnalyticsTopBar.craftie-metricas')}</PreviewSlotTarget>
      <nav className="hidden items-stretch gap-6 self-stretch @min-[640px]/analytics:flex" aria-label={t('ui.AnalyticsTopBar.secciones')}>
        {ANALYTICS_TABS.map((tab, index) => {
          const active = index === 0;

          return (
            <span
              key={tab}
              className="flex items-center border-b-2"
              style={{
                ...labelStyle(fonts, active ? colors.text : colors.mutedText),
                fontWeight: active ? ROLE_WEIGHT.button : ROLE_WEIGHT.label,
                borderColor: active ? underline : 'transparent',
              }}
            >
              {tx(tab)}
            </span>
          );
        })}
      </nav>
      <div className="my-3 ml-auto flex items-center gap-3" style={{ color: colors.mutedText }}>
        <PreviewIcon name="search" size={17} />
        <PreviewIcon name="bell" size={17} />
        <Avatar initials="LR" color={colors.brand2} slot="brand2" surfaceHex={colors.chrome} onEditSlot={onEditSlot} size={32} />
      </div>
    </PreviewSlotTarget>
  );
}
