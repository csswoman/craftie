'use client';

export function PaletteThemeToggle({
  activeTheme,
  onChange,
}: {
  activeTheme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
        Previsualizar en
      </p>
      <div
        className="inline-flex rounded-lg border border-border bg-bg p-0.5"
        role="group"
        aria-label="Vista previa de la paleta en claro u oscuro"
      >
        {(['light', 'dark'] as const).map((theme) => (
          <button
            key={theme}
            type="button"
            aria-pressed={activeTheme === theme}
            title={`Vista previa: ${theme === 'light' ? 'Claro' : 'Oscuro'}`}
            onClick={() => onChange(theme)}
            className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              activeTheme === theme
                ? 'bg-ink text-bg'
                : 'text-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {theme === 'light' ? 'Claro' : 'Oscuro'}
          </button>
        ))}
      </div>
    </div>
  );
}
