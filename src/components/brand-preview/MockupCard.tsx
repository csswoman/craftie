'use client';

export type MockupCardProps = {
  title: string;
  description?: string;
  featured?: boolean;
  children: React.ReactNode;
  onClick: () => void;
};

export function MockupCard({
  title,
  description,
  featured = false,
  children,
  onClick,
}: MockupCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full flex-col overflow-hidden rounded-xl border bg-bg text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        featured
          ? 'border-primary/25 hover:border-primary/40'
          : 'border-border hover:border-primary/30'
      }`}
    >
      <div
        className={`w-full overflow-hidden border-b border-border bg-surface/40 p-2 sm:p-3 ${
          featured ? 'aspect-[21/9] min-h-[200px] sm:min-h-[220px]' : 'aspect-[4/3] min-h-[168px] sm:min-h-[192px]'
        }`}
      >
        <div className="pointer-events-none h-full w-full overflow-hidden rounded-lg border border-border/70">
          {children}
        </div>
      </div>
      <div className="px-3 py-3">
        <p className="text-[0.8125rem] font-semibold text-ink group-hover:text-primary">{title}</p>
        {description ? (
          <p className="mt-0.5 text-[0.75rem] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </button>
  );
}
