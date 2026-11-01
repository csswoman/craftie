import type { SemanticTokens } from '@lib/color/semanticTokens';
import {
  colorLoadVerdict,
  UI_COMPOSITION_SEGMENTS,
} from '@lib/color/uiColorComposition';
import { useT, useTx } from '@/context/I18nContext';

export function UiColorComposition({
  tokens,
  loadPercent,
}: {
  tokens: SemanticTokens;
  loadPercent: number;
}) {
  const tx = useTx();
  const t = useT();
  const verdict = colorLoadVerdict(loadPercent);
  const verdictColor = verdict.level === 'balanced'
    ? 'text-[var(--chrome-green)]'
    : verdict.level === 'saturated' ? 'text-fail' : 'text-muted';
  const meterColor = verdict.level === 'balanced'
    ? 'bg-[var(--chrome-green)]'
    : verdict.level === 'saturated' ? 'bg-fail' : 'bg-muted';

  return (
    <div className="space-y-3" aria-label={t('ui.UiColorComposition.composicion-de-carga-de-color')}>
      <div className="flex h-4 overflow-hidden rounded-md ring-1 ring-inset ring-ink/10">
        {UI_COMPOSITION_SEGMENTS.map((segment) => (
          <span
            key={segment.token}
            style={{
              backgroundColor: tokens[segment.token].hex,
              flexGrow: segment.area,
              flexBasis: 0,
            }}
            title={`${segment.label} ${Math.round(segment.area * 100)}% · ${tokens[segment.token].hex.toUpperCase()}`}
            aria-label={t('ui.UiColorComposition.por-ciento', { label: tx(segment.label), value: Math.round(segment.area * 100) })}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-2.5 gap-y-1">
        {UI_COMPOSITION_SEGMENTS.map((segment) => (
          <span key={segment.token} className="inline-flex items-center gap-1.5 text-tools-micro text-muted">
            <span className="size-2 shrink-0 rounded-full ring-1 ring-inset ring-ink/10" style={{ backgroundColor: tokens[segment.token].hex }} aria-hidden="true" />
            {tx(segment.label)} {Math.round(segment.area * 100)}%
          </span>
        ))}
      </div>

      <div>
        <div className="relative h-[5px] overflow-hidden rounded-full bg-surface-raised" aria-hidden="true">
          <span className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-200 motion-reduce:transition-none ${meterColor}`} style={{ width: `${loadPercent}%` }} />
          <span className="absolute inset-y-0 z-10 bg-[var(--chrome-green-soft)]/70 ring-1 ring-inset ring-[var(--chrome-green)]/30" style={{ left: '8%', width: '20%' }} />
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-3" role="status" aria-live="polite">
          <div>
            <p className={`text-tools-body-sm font-semibold ${verdictColor}`}>{tx(verdict.label)}</p>
            <p className="text-tools-meta-scale leading-snug text-muted">{tx(verdict.subtitle)}</p>
          </div>
          <span className={`font-mono text-tools-meta font-semibold tabular-nums ${verdictColor}`}>{loadPercent}%</span>
        </div>
      </div>
    </div>
  );
}
