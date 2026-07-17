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
  return (
    <div className="flex min-w-0 items-center gap-2.5 py-2.5">
      <span className="w-[3.25rem] shrink-0 text-chrome-label font-medium text-muted">{label}</span>
      <span
        className="min-w-0 flex-1 truncate text-chrome-title font-medium leading-[1.25] text-ink"
        style={{ fontFamily: stack, fontWeight: weight }}
        title={family}
      >
        {family}
      </span>
      <span className="shrink-0 rounded-md bg-surface-raised px-1.5 py-0.5 text-chrome-caption tabular-nums text-muted">
        {weight}
      </span>
      <button
        type="button"
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinned ? `Desfijar ${label}` : `Fijar ${label}`}
        title={pinned ? `Desfijar ${label}` : `Fijar ${label}: se mantiene al elegir otro par`}
        className={`grid size-7 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
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
