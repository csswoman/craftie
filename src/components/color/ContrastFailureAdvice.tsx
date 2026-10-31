'use client';

import { useMemo } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';

import { buildContrastAdvice, type ContrastFix, type ContrastFixSide } from '@lib/color/contrastAdvice';
import { CONTRAST_SAMPLE_TEXT } from '@lib/color/contrast';

type ContrastFailureAdviceProps = {
  foregroundHex: string;
  backgroundHex: string;
  /** Side owned by the role being edited. Fixes on the other side are shown as advice only. */
  editableSide?: ContrastFixSide;
  disabled?: boolean;
  onApply?: (hex: string) => void;
};

const SIDE_LABEL: Record<ContrastFixSide, string> = {
  foreground: 'texto',
  background: 'fondo',
};

export function ContrastFailureAdvice({
  foregroundHex,
  backgroundHex,
  editableSide,
  disabled = false,
  onApply,
}: ContrastFailureAdviceProps) {
  const advice = useMemo(
    () => buildContrastAdvice(foregroundHex, backgroundHex),
    [foregroundHex, backgroundHex],
  );

  if (advice.fixes.length === 0 && advice.tips.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Cómo mejorar el contraste"
      className="space-y-3 rounded-2xl border border-fail/30 bg-bg px-4 py-3"
    >
      <header className="flex items-start gap-2">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-fail" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-chrome-label font-semibold text-ink">
            Faltan {(advice.required - advice.ratio).toFixed(1)} puntos para AA
          </p>
          <p className="text-chrome-caption text-muted">
            Tienes {advice.ratio.toFixed(2)}:1 y el mínimo para texto normal es {advice.required}:1.
          </p>
        </div>
      </header>

      <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised" aria-hidden="true">
        <div
          className="h-full rounded-full bg-fail"
          style={{ width: `${Math.round(advice.progress * 100)}%` }}
        />
      </div>

      <p
        className="rounded-md border border-border px-3 py-2 text-chrome-label leading-relaxed"
        style={{ color: foregroundHex, backgroundColor: backgroundHex }}
      >
        {CONTRAST_SAMPLE_TEXT}
      </p>

      {advice.fixes.length > 0 ? (
        <ul className="space-y-2">
          {advice.fixes.map((fix) => (
            <FixRow
              key={fix.side}
              fix={fix}
              foregroundHex={foregroundHex}
              backgroundHex={backgroundHex}
              canApply={!disabled && onApply !== undefined && fix.side === editableSide}
              onApply={onApply}
            />
          ))}
        </ul>
      ) : null}

      <ul className="list-disc space-y-1 pl-4 text-chrome-caption text-muted">
        {advice.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}

function FixRow({
  fix,
  foregroundHex,
  backgroundHex,
  canApply,
  onApply,
}: {
  fix: ContrastFix;
  foregroundHex: string;
  backgroundHex: string;
  canApply: boolean;
  onApply?: (hex: string) => void;
}) {
  const previewForeground = fix.side === 'foreground' ? fix.hex : foregroundHex;
  const previewBackground = fix.side === 'background' ? fix.hex : backgroundHex;
  const currentHex = fix.side === 'foreground' ? foregroundHex : backgroundHex;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-md font-sans text-chrome-label font-bold ring-1 ring-inset ring-ink/10"
        style={{ color: previewForeground, backgroundColor: previewBackground }}
        aria-hidden="true"
      >
        Aa
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-chrome-label font-semibold text-ink">
          Ajustar {SIDE_LABEL[fix.side]}
        </p>
        <p className="flex flex-wrap items-center gap-1 font-mono text-chrome-caption tabular-nums text-muted">
          {currentHex.toUpperCase()}
          <ArrowRight size={11} aria-hidden="true" />
          {fix.hex.toUpperCase()} · {fix.ratio.toFixed(2)}:1
        </p>
      </div>
      {canApply ? (
        <button
          type="button"
          onClick={() => onApply?.(fix.hex)}
          className="min-h-10 shrink-0 rounded-md border border-pass/40 bg-pass/10 px-3 font-sans text-chrome-caption font-semibold text-ink hover:bg-pass/15 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-pass/25"
        >
          Aplicar
        </button>
      ) : null}
    </li>
  );
}
