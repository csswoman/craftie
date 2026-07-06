'use client';

import { useId, useState, type ReactNode } from 'react';

export type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trailing?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  trailing,
  className = '',
  headingLevel = 2,
}: CollapsibleSectionProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const panelId = useId();
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  return (
    <section className={className}>
      <Heading className="sr-only">{title}</Heading>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md py-1 text-left transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <span className="text-[0.8125rem] font-semibold text-ink">{title}</span>
          <ChevronIcon open={open} />
        </button>
        {trailing ? <div className="flex shrink-0 items-center gap-1.5">{trailing}</div> : null}
      </div>

      {open ? (
        <div id={panelId} className="mt-2">
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
