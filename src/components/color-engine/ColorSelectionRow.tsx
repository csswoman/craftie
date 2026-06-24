'use client';

import { useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';

export type ColorSelectionRowProps = {
  color: SelectableColor;
  displayName: string;
  selected: boolean;
  onToggle: (color: SelectableColor) => void;
  onRename?: (colorId: string, name: string) => string | null;
};

export function ColorSelectionRow({
  color,
  displayName,
  selected,
  onToggle,
  onRename,
}: ColorSelectionRowProps) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [renameFeedback, setRenameFeedback] = useState<string | null>(null);

  function startEditing() {
    setDraftName(displayName);
    setRenameFeedback(null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraftName(displayName);
    setRenameFeedback(null);
    setEditing(false);
  }

  function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!onRename) {
      return;
    }

    const message = onRename(color.id, draftName.trim());
    setRenameFeedback(message);

    if (!message) {
      setEditing(false);
    }
  }

  if (editing && onRename) {
    return (
      <form
        onSubmit={handleRenameSubmit}
        className="rounded-lg border border-primary bg-primary/5 p-3"
      >
        <label className="block text-[0.75rem] font-medium text-muted" htmlFor={`rename-${color.id}`}>
          Nombre personalizado
        </label>
        <input
          id={`rename-${color.id}`}
          type="text"
          value={draftName}
          onChange={(event) => {
            setDraftName(event.target.value);
            setRenameFeedback(null);
          }}
          className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-[0.8125rem] text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-1.5 text-[0.75rem] font-semibold text-white hover:bg-primary-hover"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="rounded-md border border-border px-3 py-1.5 text-[0.75rem] font-medium text-muted hover:bg-surface"
          >
            Cancelar
          </button>
        </div>
        {renameFeedback ? (
          <p className="mt-2 text-[0.75rem] font-medium text-fail" role="alert">
            {renameFeedback}
          </p>
        ) : null}
      </form>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border transition-colors ${
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-bg'
      }`}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${selected ? 'Quitar' : 'Elegir'} ${displayName}, ${color.hex}`}
        onClick={() => onToggle(color)}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <span
          className="size-9 shrink-0 rounded-md border border-border/80"
          style={{ backgroundColor: color.hex }}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.875rem] font-semibold text-ink">{displayName}</span>
          <span className="block font-mono text-[0.75rem] text-muted">{color.hex.toUpperCase()}</span>
        </span>
        {selected ? (
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[0.75rem] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
        ) : (
          <span className="size-6 shrink-0" aria-hidden="true" />
        )}
      </button>
      {onRename && selected ? (
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Renombrar ${displayName}`}
          title="Renombrar"
          className="mr-2 shrink-0 rounded-md px-2 py-1 text-[0.75rem] font-medium text-muted hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          Editar
        </button>
      ) : null}
    </div>
  );
}
