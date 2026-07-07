import type { ContrastStatus, ContrastTarget, WCAGLevel } from '@lib/color/contrast';

const STATUS_LABELS: Record<ContrastStatus, string> = {
  pass: 'Cumple',
  warning: 'Parcial',
  fail: 'No cumple',
};

const STATUS_CLASSES: Record<ContrastStatus, string> = {
  pass: 'border-pass/30 bg-pass/10 text-pass',
  warning: 'border-border bg-surface-raised text-muted',
  fail: 'border-fail/30 bg-fail/10 text-fail',
};

interface ContrastBadgeProps {
  ratio: number;
  level: WCAGLevel;
  status: ContrastStatus;
  target: ContrastTarget;
  compact?: boolean;
  contextLabel?: string;
}

export function ContrastBadge({
  ratio,
  level,
  status,
  target,
  compact = false,
  contextLabel,
}: ContrastBadgeProps) {
  const levelLabel = level === 'fail' ? '—' : level;

  if (compact) {
    return (
      <span
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-white tabular-nums backdrop-blur-sm ring-1 ring-white/25"
        aria-label={`${contextLabel ? `${contextLabel}; ` : ''}Ratio ${ratio.toFixed(2)}; nivel ${levelLabel}; objetivo ${target}; ${STATUS_LABELS[status]}`}
      >
        {contextLabel ? (
          <span className="max-w-[4.5rem] truncate text-[0.5625rem] font-semibold normal-case text-white/85">
            {contextLabel}
          </span>
        ) : null}
        <span>{ratio.toFixed(2)}:1</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-end gap-0.5 rounded-md border px-3 py-2 text-right ${STATUS_CLASSES[status]}`}
      aria-label={`Ratio ${ratio.toFixed(2)}; nivel ${levelLabel}; objetivo ${target}; ${STATUS_LABELS[status]}`}
    >
      <span className="font-mono text-[0.9375rem] font-semibold tabular-nums">
        {ratio.toFixed(2)}:1
      </span>
      <span className="text-[0.75rem] font-medium">
        {levelLabel} · {STATUS_LABELS[status]}
      </span>
    </div>
  );
}
