'use client';

import {
  CONTRAST_SAMPLE_TEXT,
  type AccessibleVariantSuggestion,
} from '@lib/color/contrast';

import { Button } from '@/components/ui/Button';

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
  if (!showSuggestion) {
    return (
      <div className={className}>
        <Button
          type="button"
          variant="ghost"
          className="h-auto px-0 py-1 text-[0.8125rem] font-semibold text-primary hover:bg-transparent"
          onClick={onSuggest}
        >
          Sugerir variante accesible
        </Button>
      </div>
    );
  }

  if (suggestion === null) {
    return (
      <p className={`${className} text-[0.75rem] text-muted`}>
        No se encontró una variante accesible ajustando solo la luminosidad.
      </p>
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
          <p className="font-mono text-[0.8125rem] font-semibold tabular-nums text-ink">
            {suggestion.hex}
          </p>
          <p className="text-[0.75rem] text-muted">
            Nuevo ratio {suggestion.ratio.toFixed(2)}:1 · {levelLabel(suggestion.normalText)}
          </p>
        </div>
      </div>

      <p
        className="rounded-md px-2.5 py-2 text-[0.8125rem] leading-relaxed"
        style={{ color: suggestion.hex, backgroundColor: backgroundHex }}
      >
        {CONTRAST_SAMPLE_TEXT}
      </p>

      <div className="flex flex-wrap gap-2">
        {canApply ? (
          <Button
            type="button"
            variant="primary"
            className="h-8 px-3 text-[0.75rem]"
            onClick={() => onApply(suggestion.hex)}
          >
            Aplicar a la paleta
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="h-8 border border-border px-3 text-[0.75rem]"
          onClick={onCopy}
        >
          {copied ? 'Copiado' : 'Copiar HEX'}
        </Button>
      </div>
    </div>
  );
}

function levelLabel(level: string): string {
  return level === 'fail' ? 'no cumple' : level;
}
