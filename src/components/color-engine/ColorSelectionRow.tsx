'use client';

import { useEffect, useRef, useState } from 'react';

import { pickReadableTextColor } from '@lib/color/readableText';
import type { SelectableColor } from '@lib/color/selectableColors';

export type ColorSelectionRowProps = {
  color: SelectableColor;
  displayName: string;
  selected: boolean;
  activeAssignment?: boolean;
  onToggle: (color: SelectableColor) => void;
  onRename?: (color: SelectableColor, newName: string) => boolean;
};

export function ColorSelectionRow({
  color,
  displayName,
  selected,
  activeAssignment = false,
  onToggle,
  onRename,
}: ColorSelectionRowProps) {
  const textColor = pickReadableTextColor(color.hex);
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      // Keep the draft in sync with external renames while the row is idle.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftName(displayName);
    }
  }, [displayName, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitRename() {
    const trimmed = draftName.trim();

    if (!trimmed || trimmed === displayName) {
      setIsEditing(false);
      setDraftName(displayName);
      return;
    }

    const saved = onRename?.(color, trimmed) ?? false;

    if (saved) {
      setIsEditing(false);
      return;
    }

    setDraftName(displayName);
    setIsEditing(false);
  }

  function cancelRename() {
    setDraftName(displayName);
    setIsEditing(false);
  }

  function handleNameDoubleClick(event: React.MouseEvent) {
    if (!onRename) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setDraftName(displayName);
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <div
        className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
          selected ? 'border-primary ring-2 ring-primary/25' : 'border-border bg-bg'
        }`}
        style={selected ? { backgroundColor: color.hex, color: textColor } : undefined}
      >
        <ColorSwatch hex={color.hex} selected={selected} />
        <label className="min-w-0 flex-1">
          <span className="sr-only">Nombre del color</span>
          <input
            ref={inputRef}
            type="text"
            value={draftName}
            maxLength={40}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                commitRename();
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                cancelRename();
              }
            }}
            className="w-full rounded-md border border-border bg-bg px-2 py-1 text-[0.8125rem] font-semibold text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          />
        </label>
        <span className="shrink-0 font-mono text-[0.6875rem] opacity-85">{color.hex.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${selected ? 'Quitar' : 'Asignar'} ${displayName}, ${color.hex}`}
      onClick={() => onToggle(color)}
      style={
        selected
          ? { backgroundColor: color.hex, color: textColor }
          : undefined
      }
      className={`flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        activeAssignment
          ? 'border-primary ring-2 ring-primary/40'
          : selected
            ? 'border-primary ring-2 ring-primary/25'
            : 'border-border bg-bg hover:bg-surface-raised'
      }`}
    >
      <ColorSwatch hex={color.hex} selected={selected} />
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[0.8125rem] font-semibold ${onRename ? 'cursor-text' : ''}`}
          onDoubleClick={handleNameDoubleClick}
          title={onRename ? 'Doble clic para renombrar' : undefined}
        >
          {displayName}
        </span>
        <span className="block font-mono text-[0.6875rem] opacity-85">{color.hex.toUpperCase()}</span>
        {activeAssignment ? (
          <span
            className={`mt-0.5 block text-[0.625rem] font-semibold uppercase tracking-wide ${
              selected ? 'opacity-90' : 'text-primary'
            }`}
          >
            Rol activo
          </span>
        ) : null}
      </span>
    </button>
  );
}

function ColorSwatch({ hex, selected }: { hex: string; selected: boolean }) {
  const checkColor = pickReadableTextColor(hex);

  return (
    <span
      className={`relative flex size-7 shrink-0 items-center justify-center rounded-md ${
        selected ? 'ring-2 ring-primary ring-offset-1 ring-offset-bg' : ''
      }`}
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    >
      {selected ? (
        <svg viewBox="0 0 12 12" className="size-3.5 drop-shadow-sm" fill="none">
          <path
            d="M2.5 6.2 5 8.7 9.5 3.8"
            stroke={checkColor}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}
