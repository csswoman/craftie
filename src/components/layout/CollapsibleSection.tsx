'use client';

import { useId, useState, type ReactNode } from 'react';

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  icon?: ReactNode;
  trailing?: ReactNode;
  className?: string;
  contentClassName?: string;
  headingLevel?: 2 | 3;
  collapsible?: boolean;
  variant?: 'accent' | 'neutral';
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  icon,
  trailing,
  className = '',
  contentClassName = '',
  headingLevel = 2,
  collapsible = true,
  variant = 'accent',
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const panelId = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  const isNeutral = variant === 'neutral';
  const iconShellClass = open
    ? isNeutral
      ? 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]'
      : 'bg-[var(--chrome-green)] text-white'
    : 'bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]';
  const headerClass = `flex w-full min-w-0 items-center justify-between gap-[var(--chrome-space-2)] rounded-[var(--chrome-radius-control)] px-[var(--chrome-space-2)] py-[var(--chrome-space-2)] text-left font-sans transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
    open
      ? isNeutral
        ? 'border border-border bg-surface'
        : 'bg-[var(--chrome-green-soft)]'
      : 'hover:bg-surface-raised'
  }`;

  return (
    <section className={className}>
      <Heading className="sr-only">{title}</Heading>
      <div className="flex items-center gap-[var(--chrome-space-2)]">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen(!open)}
            className={headerClass}
          >
            <span className="flex min-w-0 items-center gap-[var(--chrome-space-2)]">
              {icon ? (
                <span
                  className={`grid size-[30px] shrink-0 place-items-center rounded-[var(--chrome-radius-control)] ${iconShellClass}`}
                >
                  {icon}
                </span>
              ) : null}
              <span className="truncate text-tools-section font-semibold text-ink">
                {title}
              </span>
            </span>
            <ChevronIcon open={open} />
          </button>
        ) : (
          <div className={headerClass}>
            <span className="flex min-w-0 items-center gap-[var(--chrome-space-2)]">
              {icon ? (
                <span
                  className={`grid size-[30px] shrink-0 place-items-center rounded-[var(--chrome-radius-control)] ${iconShellClass}`}
                >
                  {icon}
                </span>
              ) : null}
              <span className="truncate text-tools-section font-semibold text-ink">
                {title}
              </span>
            </span>
          </div>
        )}
        {trailing ? (
          <div className="flex max-w-[45%] shrink-0 items-center justify-end gap-[var(--chrome-space-1)] sm:max-w-none">
            {trailing}
          </div>
        ) : null}
      </div>

      {open ? (
        <div id={panelId} className={`mt-[var(--chrome-space-2)] ${contentClassName}`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function CollapsibleChevron({ open }: { open: boolean }) {
  return <ChevronIcon open={open} />;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-3.5 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${
        open ? 'rotate-180' : ''
      }`}
    >
      <path
        d="M4 6l4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
