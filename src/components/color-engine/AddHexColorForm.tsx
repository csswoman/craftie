'use client';

import { useState } from 'react';

import { CUSTOM_COLOR_NAME_MAX_LENGTH } from '@lib/color/paletteOrder';

export type AddHexColorFormProps = {
  onSubmit: (hex: string, customName?: string) => string | null;
  compact?: boolean;
};

export function AddHexColorForm({ onSubmit, compact = false }: AddHexColorFormProps) {
  const [hexValue, setHexValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = onSubmit(hexValue.trim(), nameValue.trim() || undefined);
    setFeedback(message);
    setIsError(message !== null);

    if (!message) {
      setHexValue('');
      setNameValue('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-surface p-2.5">
      <p className="text-[0.8125rem] font-semibold text-ink">Añadir color</p>
      {!compact ? (
        <p className="mt-0.5 text-[0.75rem] text-muted">
          Introduce un código HEX y, si quieres, un nombre propio.
        </p>
      ) : null}
      <div className="mt-2 space-y-2">
        <input
          type="text"
          name="hex"
          value={hexValue}
          onChange={(event) => {
            setHexValue(event.target.value);
            setFeedback(null);
            setIsError(false);
          }}
          placeholder="#6986B8"
          autoComplete="off"
          spellCheck={false}
          maxLength={7}
          aria-label="Código HEX"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-[0.8125rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        />
        <div>
          <input
            type="text"
            name="customName"
            value={nameValue}
            onChange={(event) => {
              setNameValue(event.target.value);
              setFeedback(null);
              setIsError(false);
            }}
            placeholder="Nombre opcional, p. ej. Azul acero"
            autoComplete="off"
            spellCheck={false}
            maxLength={CUSTOM_COLOR_NAME_MAX_LENGTH}
            aria-describedby="custom-color-name-hint"
            aria-label="Nombre del color"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-[0.8125rem] text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          />
          <p id="custom-color-name-hint" className="mt-1 text-chrome-caption text-muted">
            {compact ? 'Nombre opcional' : `Máximo ${CUSTOM_COLOR_NAME_MAX_LENGTH} caracteres. Acepta emoji y acentos.`}
          </p>
        </div>
      </div>
      <button
        type="submit"
        className="mt-3 w-full rounded-md bg-primary px-3 py-2 text-[0.8125rem] font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        Añadir color
      </button>
      {feedback ? (
        <p
          className={`mt-2 text-[0.75rem] font-medium ${isError ? 'text-fail' : 'text-muted'}`}
          role={isError ? 'alert' : 'status'}
        >
          {feedback}
        </p>
      ) : null}
    </form>
  );
}
