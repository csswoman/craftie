'use client';

import { useId } from 'react';
import { Search, X } from 'lucide-react';

export type PairingSearchControlProps = {
  query: string;
  onQueryChange: (value: string) => void;
  disabled?: boolean;
  isTools?: boolean;
};

export function PairingSearchControl({
  query,
  onQueryChange,
  disabled = false,
  isTools = false,
}: PairingSearchControlProps) {
  const inputId = useId();

  return (
    <div
      role="search"
      className="flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-border bg-bg px-2 focus-within:ring-[3px] focus-within:ring-primary/25"
    >
      <Search size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-muted" />
      <label className="sr-only" htmlFor={inputId}>
        Buscar pares tipográficos
      </label>
      <input
        id={inputId}
        type="text"
        role="searchbox"
        value={query}
        placeholder="Buscar pares…"
        autoComplete="off"
        disabled={disabled}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && query) {
            event.preventDefault();
            onQueryChange('');
          }
        }}
        className={`min-w-0 flex-1 bg-transparent py-1 text-ink placeholder:text-muted outline-none disabled:cursor-not-allowed ${
          isTools ? 'text-tools-body' : 'text-[0.9375rem]'
        }`}
      />
      {query ? (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          disabled={disabled}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          className="grid size-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed"
        >
          <X size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
