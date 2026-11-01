'use client';

import {
  CONTRAST_SAMPLE_TEXT,
  type AccessibleVariantSuggestion,
} from '@lib/color/contrast';

import { Button } from '@/components/ui/Button';
import { useT, useTx } from '@/context/I18nContext';

interface ContrastSuggestionPanelProps {
  showSuggestion: boolean;
  suggestion: AccessibleVariantSuggestion | null;
  backgroundHex: string;
  copied: boolean;
  canApply: boolean;
  onSuggest: () => void;
  onCopy: () => void;
  onApply: (hex: string) => void;
  className?: string;
}

export function ContrastSuggestionPanel({
  showSuggestion,
  suggestion,
  backgroundHex,
  copied,
  canApply,
  onSuggest,
  onCopy,
  onApply,
  className = 'mt-3',
}: ContrastSuggestionPanelProps) {
  const tx = useTx();
  const t = useT();
  if (!showSuggestion) {
    return (
      <div className={className}>
        <Button
          type="button"
          variant="ghost"
          className="h-auto min-h-11 px-0 py-1 text-chrome-label font-semibold text-primary hover:bg-transparent"
          onClick={onSuggest}
        >{t('ui.ContrastSuggestionPanel.sugerir-variante-accesible')}</Button>
      </div>
    );
  }

  if (suggestion === null) {
    return (
      <p className={`${className} text-chrome-caption text-muted`}>{t('ui.ContrastSuggestionPanel.no-se-encontro-una-variante')}</p>
    );
  }

  return (
    <div className={`${className} space-y-2 rounded-lg border border-border bg-surface-raised/70 p-3`}>
      <div className="flex items-center gap-2">
        <span
          className="size-8 shrink-0 rounded-md ring-1 ring-inset ring-ink/10 dark:ring-white/15"
          style={{ backgroundColor: suggestion.hex }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="font-mono text-chrome-label font-semibold tabular-nums text-ink">
            {suggestion.hex}
          </p>
          <p className="text-chrome-caption text-muted">{t('ui.ContrastSuggestionPanel.nuevo-ratio-1', { value: suggestion.ratio.toFixed(2), value2: tx(levelLabel(suggestion.normalText)) })}
          </p>
        </div>
      </div>

      <p
        className="rounded-md px-2.5 py-2 text-chrome-label leading-relaxed"
        style={{ color: suggestion.hex, backgroundColor: backgroundHex }}
      >
        {tx(CONTRAST_SAMPLE_TEXT)}
      </p>

      <div className="flex flex-wrap gap-2">
        {canApply ? (
          <Button
            type="button"
            variant="primary"
            className="min-h-11 px-3 text-chrome-caption"
            onClick={() => onApply(suggestion.hex)}
          >{t('ui.ContrastSuggestionPanel.aplicar-a-la-paleta')}</Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 border border-border px-3 text-chrome-caption"
          onClick={onCopy}
        >
          {copied ? t('ui.ContrastSuggestionPanel.copiado') : t('ui.ContrastSuggestionPanel.copiar-hex')}
        </Button>
      </div>
    </div>
  );
}

function levelLabel(level: string): string {
  return level === 'fail' ? 'no cumple' : level;
}
