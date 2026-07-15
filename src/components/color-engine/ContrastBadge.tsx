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
  dense?: boolean;
  contextLabel?: string;
}

export function ContrastBadge({
  ratio,
  level,
  status,
  target,
  compact = false,
  dense = false,
  contextLabel,
}: ContrastBadgeProps) {
  const levelLabel = level === 'fail' ? '—' : level;

  if (compact) {
    return (
      <span
        className={`inline-flex shrink-0 items-center rounded-full bg-black/55 font-mono font-semibold text-white tabular-nums ring-1 ring-white/25 ${
          dense
            ? 'gap-0.5 px-1 py-0 text-[0.5625rem] leading-[1.1]'
            : 'gap-1 px-2 py-0.5 text-chrome-caption'
        }`}
        aria-label={`${contextLabel ? `${contextLabel}; ` : ''}Ratio ${ratio.toFixed(2)}; nivel ${levelLabel}; objetivo ${target}; ${STATUS_LABELS[status]}`}
      >
        {contextLabel ? (
          <span className={`truncate font-semibold normal-case text-white/85 ${dense ? 'max-w-[3.5rem] text-[0.5rem]' : 'max-w-[4.5rem] text-[0.5625rem]'}`}>
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
      <span className="font-mono text-chrome-body font-semibold tabular-nums">
        {ratio.toFixed(2)}:1
      </span>
      <span className="text-chrome-caption font-medium">
        {levelLabel} · {STATUS_LABELS[status]}
      </span>
    </div>
  );
}
