'use client';

import { useId, useState } from 'react';

import { Button } from '@/components/ui/Button';

export function StartFromColorForm({ onStart }: { onStart: (hex: string) => string | null }) {
  const inputId = useId();
  const errorId = useId();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (value.trim().length === 0) {
      setError('Escribe un color, por ejemplo #1F6F54.');
      return;
    }
    setError(onStart(value));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="block text-chrome-label font-semibold text-ink">
          Partir de un color (HEX)
        </label>
        <button
          type="button"
          onClick={() => {
            setValue('#1F6F54');
            setError(null);
          }}
          className="text-chrome-caption font-medium text-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:underline"
        >
          Ejemplo: <span className="font-mono text-primary">#1F6F54</span>
        </button>
      </div>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={value}
          placeholder="#1F6F54"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            setError(null);
          }}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-chrome-body text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <Button type="submit" variant="ghost" className="min-h-11 shrink-0 rounded-lg">
          Crear paleta
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-chrome-caption font-medium text-fail">
          {error}
        </p>
      ) : null}
    </form>
  );
}
