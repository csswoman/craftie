'use client';

import { useEffect, useRef, useState } from 'react';

import type { SelectableColor } from '@lib/color/selectableColors';

export type PaletteAddGapProps = {
  insertIndex: number;
  options: SelectableColor[];
  onInsert: (index: number, color: SelectableColor) => void;
  className?: string;
};

export function PaletteAddGap({ insertIndex, options, onInsert, className = '' }: PaletteAddGapProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`group/add z-20 ${className}`}
      aria-label="Insertar color"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <button
          type="button"
          aria-label="Añadir color"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="pointer-events-auto flex size-8 items-center justify-center rounded-full border-2 border-white bg-surface-raised text-lg font-light text-ink opacity-0 shadow-md transition-opacity hover:bg-bg focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 group-hover/add:opacity-100 group-hover/column-wrap:opacity-100"
        >
          +
        </button>

        {open ? (
          <div className="pointer-events-auto absolute bottom-[calc(100%+10px)] left-1/2 w-56 -translate-x-1/2 rounded-xl border border-border bg-ink px-3 py-2 text-white shadow-lg">
            <p className="text-[0.8125rem] font-semibold">Añadir color</p>
            <p className="mt-0.5 text-[0.6875rem] text-white/70">Mantén pulsado para elegir</p>
            {options.length === 0 ? (
              <p className="mt-2 text-[0.75rem] text-white/70">No hay más colores disponibles.</p>
            ) : (
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                {options.map((color) => (
                  <li key={color.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onInsert(insertIndex, color);
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      <span
                        className="size-4 shrink-0 rounded-sm border border-white/20"
                        style={{ backgroundColor: color.hex }}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-[0.75rem]">{color.name}</span>
                      <span className="font-mono text-[0.6875rem] text-white/70">{color.hex}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
