'use client';

export function PaletteThemeToggle({
  activeTheme,
  onChange,
}: {
  activeTheme: 'light' | 'dark';
  onChange: (theme: 'light' | 'dark') => void;
}) {
  return (
    <div
      className="inline-flex shrink-0 rounded-lg border border-border bg-bg p-0.5"
      role="group"
      aria-label="Modo de la paleta: claro u oscuro"
    >
      {(['light', 'dark'] as const).map((theme) => {
        const selected = activeTheme === theme;
        const label = theme === 'light' ? 'Claro' : 'Oscuro';

        return (
          <button
            key={theme}
            type="button"
            aria-pressed={selected}
            aria-label={`Paleta en modo ${label.toLowerCase()}`}
            title={`Paleta en modo ${label.toLowerCase()}`}
            onClick={() => onChange(theme)}
            className={`min-h-11 rounded-md px-2 py-1 text-[0.6875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3 sm:py-1.5 sm:text-chrome-label ${
              selected
                ? 'bg-surface-raised text-ink ring-1 ring-border'
                : 'text-muted hover:bg-surface-raised hover:text-ink'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
