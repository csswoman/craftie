'use client';

import { useEffect, useId, useRef, useState } from 'react';

export type AddColorMenuProps = {
  onSubmit: (hex: string) => string | null;
};

export function AddColorMenu({ onSubmit }: AddColorMenuProps) {
  const [open, setOpen] = useState(false);
  const [hexValue, setHexValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    inputRef.current?.focus();

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = onSubmit(hexValue.trim());
    setFeedback(message);

    if (!message) {
      setHexValue('');
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Añadir color por HEX"
        title="Añadir color"
        onClick={() => {
          setOpen((value) => !value);
          setFeedback(null);
        }}
        className="flex size-7 items-center justify-center rounded-md border border-border bg-surface text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <PlusIcon />
      </button>

      {open ? (
        <form
          id={panelId}
          onSubmit={handleSubmit}
          className="absolute right-0 top-[calc(100%+6px)] z-dropdown w-52 rounded-lg border border-border bg-bg p-2.5 shadow-[var(--shadow-float)]"
        >
          <label className="sr-only" htmlFor={`${panelId}-hex`}>
            Código HEX
          </label>
          <input
            ref={inputRef}
            id={`${panelId}-hex`}
            type="text"
            value={hexValue}
            onChange={(event) => {
              setHexValue(event.target.value);
              setFeedback(null);
            }}
            placeholder="#FFFFFF"
            spellCheck={false}
            maxLength={7}
            className="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 font-mono text-[0.8125rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          />
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-primary px-2.5 py-1.5 text-[0.75rem] font-semibold text-white hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Añadir
          </button>
          {feedback ? (
            <p className="mt-1.5 text-[0.6875rem] font-medium text-fail" role="alert">
              {feedback}
            </p>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <path
        d="M8 3v10M3 8h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
