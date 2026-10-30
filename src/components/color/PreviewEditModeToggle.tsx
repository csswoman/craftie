'use client';

export type PreviewEditMode = 'color' | 'text';

const OPTIONS: { id: PreviewEditMode; label: string }[] = [
  { id: 'color', label: 'Color' },
  { id: 'text', label: 'Texto' },
];

/** Chooses what a click on the mockup edits: the color slot or the text role. */
export function PreviewEditModeToggle({
  value,
  onChange,
}: {
  value: PreviewEditMode;
  onChange: (mode: PreviewEditMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Qué editar al hacer clic"
      className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-border bg-bg/95 p-0.5 backdrop-blur-sm"
    >
      <span className="px-2 text-chrome-caption text-muted">Editar</span>
      {OPTIONS.map((option) => {
        const active = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={`min-h-8 rounded-full px-3 text-chrome-caption transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              active ? 'bg-ink text-bg' : 'text-ink hover:bg-surface'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
