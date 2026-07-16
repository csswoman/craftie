import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
      className={`shrink-0 items-center border-b border-line-soft px-4 py-3 ${
        alwaysVisible ? 'flex' : 'hidden xl:flex'
      } ${align === 'end' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        <div className={`min-w-0 ${align === 'end' ? 'text-right' : 'text-left'}`}>
          <p className="truncate font-display text-[1.375rem] font-medium leading-none text-forest">{title}</p>
          {subtitle ? <p className="mt-1 truncate text-chrome-caption text-muted">{subtitle}</p> : null}
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
      <PanelChevron direction={direction} />
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
      <PanelChevron direction={direction} />
    </button>
  );
}

function PanelChevron({ direction }: { direction: 'left' | 'right' }) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return <Icon size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />;
}
