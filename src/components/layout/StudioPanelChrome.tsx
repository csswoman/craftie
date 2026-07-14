import type { ReactNode } from 'react';

export function PanelCollapseBar({
  align,
  title,
  subtitle,
  children,
  alwaysVisible = false,
}: {
  align: 'start' | 'end';
  title: string;
  subtitle?: string;
  children: ReactNode;
  alwaysVisible?: boolean;
}) {
  return (
    <div
      className={`shrink-0 items-center border-b border-border/40 px-2.5 py-1.5 ${
        alwaysVisible ? 'flex' : 'hidden xl:flex'
      } ${align === 'end' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className={`min-w-0 ${align === 'end' ? 'text-right' : 'text-left'}`}>
          <p className="truncate text-chrome-label font-semibold text-ink">{title}</p>
          {subtitle ? <p className="truncate text-chrome-caption text-muted">{subtitle}</p> : null}
        </div>
        <div className="shrink-0">{children}</div>
      </div>
    </div>
  );
}

export function PanelCollapseButton({
  label,
  direction,
  closeTarget = false,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  closeTarget?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-inspector-close={closeTarget ? '' : undefined}
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

export function PanelCollapseRail({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-full min-h-11 w-11 items-center justify-center text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      <ChevronIcon direction={direction} />
    </button>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const path = direction === 'left' ? 'M10 4l-4 4 4 4' : 'M6 4l4 4-4 4';

  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
