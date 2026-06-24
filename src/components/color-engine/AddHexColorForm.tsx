'use client';

import { useState } from 'react';

export type AddHexColorFormProps = {
  onSubmit: (hex: string, customName?: string) => string | null;
};

export function AddHexColorForm({ onSubmit }: AddHexColorFormProps) {
  const [hexValue, setHexValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = onSubmit(hexValue.trim(), nameValue.trim() || undefined);
    setFeedback(message);

    if (!message) {
      setHexValue('');
      setNameValue('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-3">
      <p className="text-[0.8125rem] font-semibold text-ink">Añadir color personalizado</p>
      <p className="mt-0.5 text-[0.75rem] text-muted">
        Introduce un código HEX y, si quieres, un nombre propio.
      </p>
      <div className="mt-3 space-y-2">
        <input
          type="text"
          value={hexValue}
          onChange={(event) => {
            setHexValue(event.target.value);
            setFeedback(null);
          }}
          placeholder="#6986B8"
          spellCheck={false}
          aria-label="Código HEX"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-[0.8125rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <input
          type="text"
          value={nameValue}
          onChange={(event) => {
            setNameValue(event.target.value);
            setFeedback(null);
          }}
          placeholder="Nombre opcional, p. ej. Azul acero"
          spellCheck={false}
          aria-label="Nombre del color"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[0.8125rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
      </div>
      <button
        type="submit"
        className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        Añadir color
      </button>
      {feedback ? (
        <p className="mt-2 text-[0.75rem] font-medium text-muted" role="status">
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
