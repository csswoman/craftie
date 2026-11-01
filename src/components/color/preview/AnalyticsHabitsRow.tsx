import type { ResolvedLayoutColors } from '@lib/color/layoutModes';

import { AnalyticsPanel } from './AnalyticsPanel';
import { PreviewSlotTarget, type PreviewSlotEditHandler } from './PreviewSlotTarget';
import { ANALYTICS_DAYS, ANALYTICS_GOALS, ANALYTICS_HEATMAP, ANALYTICS_SPLIT_CLASS } from './analyticsPreviewData';
import { paletteTint } from './previewButtons';
import { captionStyle, labelStyle, titleStyle, type PreviewFonts } from './previewTypography';
import { useT, useTx } from '@/context/I18nContext';

const HEAT_SHARES = [0.08, 0.28, 0.5, 0.74, 1] as const;

const HABIT_STATS = [
  { label: 'Mejor día', value: 'Jueves' },
  { label: 'Racha actual', value: '5 días' },
  { label: 'Media diaria', value: '3,4 h' },
] as const;

/** Bottom row: a month heatmap in one series color, and goals with their own series colors. */
export function AnalyticsHabitsRow({
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
  const heat = colors.data1;
  const activeDays = ANALYTICS_HEATMAP.flat().filter((level) => level > 0).length;

  return (
    <section className={`grid min-w-0 gap-6 ${ANALYTICS_SPLIT_CLASS}`}>
      <AnalyticsPanel
        colors={colors}
        fonts={fonts}
        title={t('ui.AnalyticsHabitsRow.constancia-del-mes')}
        subtitle={t('ui.AnalyticsHabitsRow.de-28-dias-con-actividad', { activeDays })}
        onEditSlot={onEditSlot}
        trailing={
          <span className="flex items-center gap-1.5" style={captionStyle(fonts, colors.mutedText)}>{t('ui.AnalyticsHabitsRow.menos')}{HEAT_SHARES.map((share) => (
              <span key={share} aria-hidden="true" className="size-3 rounded-[3px]" style={{ backgroundColor: paletteTint(heat, colors.surface, share) }} />
            ))}{t('ui.AnalyticsHabitsRow.mas')}</span>
        }
      >
        <div className="mb-5 grid grid-cols-[2.5rem_repeat(7,minmax(0,1fr))] gap-1.5" role="img" aria-label={t('ui.AnalyticsHabitsRow.actividad-por-dia-durante-cuatro')}>
          <span />
          {ANALYTICS_DAYS.map((day) => (
            <span key={day} className="text-center" style={captionStyle(fonts, colors.mutedText)}>
              {tx(day)}
            </span>
          ))}
          {ANALYTICS_HEATMAP.map((week, row) => (
            <div key={row} className="contents">
              <span className="self-center" style={captionStyle(fonts, colors.mutedText)}>
                S{row + 1}
              </span>
              {week.map((level, day) => (
                <PreviewSlotTarget
                  key={day}
                  slot="data1"
                  onEditSlot={onEditSlot}
                  className="h-9 rounded-md"
                  style={{ backgroundColor: paletteTint(heat, colors.surface, HEAT_SHARES[level]!) }}
                />
              ))}
            </div>
          ))}
        </div>

        <PreviewSlotTarget
          slot="divider"
          onEditSlot={onEditSlot}
          className="mt-auto grid grid-cols-3 gap-4 border-t pt-4"
          style={{ borderColor: colors.divider }}
        >
          {HABIT_STATS.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <span className="block" style={captionStyle(fonts, colors.mutedText)}>
                {tx(stat.label)}
              </span>
              <span className="mt-0.5 block tabular-nums" style={titleStyle(fonts)}>
                {tx(stat.value)}
              </span>
            </div>
          ))}
        </PreviewSlotTarget>
      </AnalyticsPanel>

      <AnalyticsPanel colors={colors} fonts={fonts} title={t('ui.AnalyticsHabitsRow.metas-del-trimestre')} onEditSlot={onEditSlot}>
        <ul className="flex flex-1 flex-col justify-between gap-4">
          {ANALYTICS_GOALS.map((goal) => {
            const fill = colors[goal.slot];

            return (
              <li key={goal.label}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate" style={labelStyle(fonts, colors.text)}>
                    {tx(goal.label)}
                  </span>
                  <span className="shrink-0 tabular-nums" style={titleStyle(fonts)}>
                    {goal.value}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ backgroundColor: paletteTint(fill, colors.surface, 0.16) }}>
                  <PreviewSlotTarget slot={goal.slot} onEditSlot={onEditSlot} className="h-full rounded-full" style={{ width: `${goal.value}%`, backgroundColor: fill }} />
                </div>
                <span className="mt-1 block tabular-nums" style={captionStyle(fonts, colors.mutedText)}>
                  {tx(goal.total)}
                </span>
              </li>
            );
          })}
        </ul>
      </AnalyticsPanel>
    </section>
  );
}
