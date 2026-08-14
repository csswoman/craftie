import type { ReactNode } from 'react';
import { Pin } from 'lucide-react';

export function ScaleToken({ label, value }: { label: string; value: number }) {
  return (
    <span className="whitespace-nowrap">
      <span className="font-semibold text-primary">{label}</span>{' '}
      <span className="font-normal tabular-nums text-muted">{value}px</span>
    </span>
  );
}

export function TypeWeightBadge({
  weight,
  tone = 'muted',
}: {
  weight: number;
  tone?: 'muted' | 'ink';
}) {
  return (
    <span
      className={`inline-flex min-w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-raised px-1.5 py-0.5 text-chrome-caption tabular-nums ${
        tone === 'ink' ? 'font-medium text-ink' : 'font-medium text-muted'
      }`}
    >
      {weight}
    </span>
  );
}

export function RoleRow({
  label,
  family,
  weight,
  stack,
  pinned,
  onTogglePin,
}: {
  label: string;
  family: string;
  weight: number;
  stack: string;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  const pinHint = pinned
    ? `Desfijar ${label}: vuelve a cambiar al elegir otro par`
    : `Fijar ${label}: se mantiene al elegir otro par`;

  return (
    <div className="flex min-w-0 items-center gap-2 py-2.5">
      <span className="w-[3.25rem] shrink-0 text-chrome-label font-medium text-muted">{label}</span>
      <span
        className="min-w-0 flex-1 truncate text-chrome-title font-medium leading-[1.25] text-ink"
        style={{ fontFamily: stack, fontWeight: weight }}
        title={family}
      >
        {family}
      </span>
      <TypeWeightBadge weight={weight} />
      <button
        type="button"
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinHint}
        title={pinHint}
        className={`inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-md border px-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
          pinned
            ? 'border-primary/45 bg-primary/10 text-primary'
            : 'border-border bg-bg text-muted hover:border-primary/45 hover:text-primary'
        }`}
      >
        <Pin
          size={13}
          strokeWidth={1.25}
          fill={pinned ? 'currentColor' : 'none'}
          aria-hidden="true"
        />
        <span className="text-chrome-caption font-medium">{pinned ? 'Fijado' : 'Fijar'}</span>
      </button>
    </div>
  );
}

export function SegmentedField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-chrome-caption font-semibold uppercase tracking-[0.08em] text-primary">{label}</p>
      <div className="mt-1.5 flex min-w-0 gap-0.5 rounded-lg bg-surface-raised p-0.5">{children}</div>
    </div>
  );
}

export function SegmentButton({
  active,
  onClick,
  label,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={`min-h-7 min-w-0 flex-1 rounded-md px-0.5 text-chrome-caption tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'bg-primary font-semibold text-bg'
          : 'bg-transparent font-normal text-muted hover:bg-primary/10 hover:text-primary'
      }`}
    >
      {label}
    </button>
  );
}
