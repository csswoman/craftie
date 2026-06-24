import {
  CONTRAST_SAMPLE_TEXT,
  getContrastStatus,
  type ContrastResult,
  type ContrastTarget,
} from '@lib/color/contrast';

import { ContrastBadge } from './ContrastBadge';

const PAIR_LABELS: Record<ContrastResult['pairRole'], string> = {
  'on-surface/surface': 'Sobre superficie sobre superficie',
  'primary/surface': 'Primario sobre superficie',
  'primary/neutral-light': 'Primario sobre neutro claro',
  'accent/surface': 'Acento sobre superficie',
  'accent/neutral-dark': 'Acento sobre neutro oscuro',
};

interface ContrastRowProps {
  result: ContrastResult;
  target: ContrastTarget;
}

export function ContrastRow({ result, target }: ContrastRowProps) {
  const status = getContrastStatus(result, target);
  const failsTarget = status !== 'pass';

  return (
    <li
      className={`rounded-md border p-4 ${
        failsTarget ? 'border-fail/40 bg-fail/5' : 'border-border bg-surface'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-medium text-muted">{PAIR_LABELS[result.pairRole]}</p>

          <div className="mt-3 flex items-center gap-2">
            <Swatch color={result.foreground.hex} label="Primer plano" />
            <span className="text-muted" aria-hidden="true">
              /
            </span>
            <Swatch color={result.background.hex} label="Fondo" />
          </div>

          <p
            className="mt-3 max-w-prose rounded-md px-3 py-2 text-[0.9375rem] leading-relaxed"
            style={{
              color: result.foreground.hex,
              backgroundColor: result.background.hex,
            }}
          >
            {CONTRAST_SAMPLE_TEXT}
          </p>
        </div>

        <ContrastBadge
          ratio={result.ratio}
          level={result.normalText}
          status={status}
          target={target}
        />
      </div>
    </li>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-10 w-10 shrink-0 rounded-md border border-border"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-[0.75rem] font-medium text-muted">{label}</span>
    </div>
  );
}
