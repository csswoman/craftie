export function UiFocusedPanelHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <header className="border-b border-line-soft pb-4">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver al panel de color"
          className="-ml-1 flex size-9 shrink-0 items-center justify-center rounded-md text-xl leading-none text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <div className="min-w-0 pt-0.5">
          <h2 className="font-display text-[1.125rem] font-semibold leading-tight text-ink">{title}</h2>
          <p className="mt-1 text-[0.71875rem] leading-relaxed text-muted">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}
