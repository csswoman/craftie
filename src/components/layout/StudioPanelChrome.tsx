import type { ReactNode, Ref } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function PanelCollapseBar({
  align,
  title,
  subtitle,
  children,
  alwaysVisible = false,
}: {
  align: 'start' | 'end';
  title?: string;
  subtitle?: string;
  children: ReactNode;
  alwaysVisible?: boolean;
}) {
  return (
    <div
      className={`shrink-0 items-center border-b border-line-soft px-3 py-2.5 ${
        alwaysVisible ? 'flex' : 'hidden xl:flex'
      } ${align === 'end' ? 'justify-end' : 'justify-start'}`}
    >
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
        {title || subtitle ? (
          <div className={`min-w-0 ${align === 'end' ? 'text-right' : 'text-left'}`}>
            {title ? (
              <p className="truncate font-display text-[1rem] font-semibold leading-none text-forest">{title}</p>
            ) : null}
            {subtitle ? (
              <p className={`truncate text-[0.75rem] leading-none text-muted ${title ? 'mt-1' : ''}`}>{subtitle}</p>
            ) : null}
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 shrink items-center justify-end gap-2">{children}</div>
      </div>
    </div>
  );
}

export function PanelCollapseButton({
  label,
  direction,
  closeTarget = false,
  expanded,
  onClick,
  ref,
}: {
  label: string;
  direction: 'left' | 'right';
  closeTarget?: boolean;
  expanded?: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      data-inspector-close={closeTarget ? '' : undefined}
      aria-label={label}
      aria-expanded={expanded}
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
  expanded,
  onClick,
  ref,
}: {
  label: string;
  direction: 'left' | 'right';
  expanded?: boolean;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-expanded={expanded}
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
