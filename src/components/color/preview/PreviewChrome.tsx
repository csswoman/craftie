import type { ThemeId } from '@lib/color/themePalette';

export function PreviewContrastWarnings({ warnings }: { warnings: string[] }) {
  return (
    <div
      role="status"
      className="rounded-lg border border-amber-500/40 bg-amber-50 px-4 py-3 text-[0.8125rem] text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
    >
      <p className="font-semibold">Contraste en vista previa</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4">
        {warnings.map((warning) => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}

export function PreviewThemeToggle({
  activeTheme,
  onChange,
}: {
  activeTheme: ThemeId;
  onChange: (theme: ThemeId) => void;
}) {
  const options: Array<{ id: ThemeId; label: string }> = [
    { id: 'light', label: 'Claro' },
    { id: 'dark', label: 'Oscuro' },
  ];

  return (
    <div className="flex w-full items-center justify-center" role="group" aria-label="Tema de vista previa">
      <div className="inline-flex rounded-lg border border-border bg-surface p-0.5 shadow-sm">
        {options.map((option) => {
          const isActive = option.id === activeTheme;

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.id)}
              className={`rounded-md px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors ${
                isActive ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
