'use client';

import { useId, useRef, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';

import type { CustomFontRole, CustomFontSource } from '@lib/typography/customFonts';
import { normalizeFontFamilyName } from '@lib/typography/customFonts';

import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

export type CustomFontSubmitInput = {
  family: string;
  source: CustomFontSource;
  role: CustomFontRole;
  file?: File;
};

export function CustomFontModal({
  open,
  onClose,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (input: CustomFontSubmitInput) => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [source, setSource] = useState<CustomFontSource>('google');
  const [family, setFamily] = useState('');
  const [role, setRole] = useState<CustomFontRole>('heading');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useDialogAccessibility({
    open,
    dialogRef,
    onClose,
    initialFocusSelector: '[data-custom-font-family]',
    lockScroll: true,
  });

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const nextFamily =
      source === 'local' && family.trim() === '' && file
        ? normalizeFontFamilyName(file.name.replace(/\.[^.]+$/, ''))
        : normalizeFontFamilyName(family);

    if (nextFamily === '') {
      setError('Indica el nombre de la familia.');
      return;
    }

    if (source === 'local' && !file) {
      setError('Elige un archivo de fuente.');
      return;
    }

    setBusy(true);
    try {
      await onApply({
        family: nextFamily,
        source,
        role,
        ...(source === 'local' && file ? { file } : null),
      });
      setFamily('');
      setFile(null);
      onClose();
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : 'No se pudo aplicar la fuente personalizada.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-dropdown flex items-center justify-center overscroll-contain bg-ink/20 p-4">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-float)]"
      >
        <header className="flex items-start justify-between gap-3 border-b border-border/40 px-4 py-3">
          <div>
            <h2 id={titleId} className="text-chrome-title">
              Fuente personalizada
            </h2>
            <p className="prose-measure mt-0.5 text-chrome-label leading-relaxed text-muted">
              Asigna una familia a titular o cuerpo. No crea un par del catálogo.
            </p>
          </div>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <X size={16} strokeWidth={2} absoluteStrokeWidth aria-hidden="true" />
          </button>
        </header>

        <form className="space-y-4 p-4" onSubmit={handleSubmit}>
          <fieldset className="space-y-2">
            <legend className="text-tools-meta font-semibold uppercase tracking-[0.06em] text-muted">
              Origen
            </legend>
            <div className="flex gap-2">
              <ChoiceButton active={source === 'google'} label="Google Fonts" onClick={() => setSource('google')} />
              <ChoiceButton active={source === 'local'} label="Archivo local" onClick={() => setSource('local')} />
            </div>
          </fieldset>

          {source === 'local' ? (
            <div className="space-y-1.5">
              <label htmlFor="custom-font-file" className="text-tools-meta text-muted">
                Archivo (.woff2 / .ttf / .otf)
              </label>
              <input
                id="custom-font-file"
                type="file"
                accept=".woff2,.woff,.ttf,.otf,font/woff2,font/ttf,font/otf"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="block w-full text-tools-body text-ink file:mr-3 file:rounded-md file:border-0 file:bg-surface-raised file:px-3 file:py-1.5 file:text-tools-chip file:font-semibold"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="custom-font-family" className="text-tools-meta text-muted">
              Nombre de familia
            </label>
            <input
              id="custom-font-family"
              data-custom-font-family
              type="text"
              value={family}
              onChange={(event) => setFamily(event.target.value)}
              placeholder={source === 'google' ? 'p. ej. Cabin' : 'Opcional; usa el nombre del archivo'}
              autoComplete="off"
              className="w-full rounded-md border border-border bg-bg px-3 py-2 text-tools-body text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-tools-meta font-semibold uppercase tracking-[0.06em] text-muted">
              Asignar a
            </legend>
            <div className="flex gap-2">
              <ChoiceButton active={role === 'heading'} label="Titular" onClick={() => setRole('heading')} />
              <ChoiceButton active={role === 'body'} label="Cuerpo" onClick={() => setRole('body')} />
            </div>
          </fieldset>

          {error ? (
            <p
              className="rounded-md border border-amber-500/40 bg-amber-50 px-3 py-2 text-tools-body text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3 py-2 text-tools-chip font-semibold text-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-ink px-3 py-2 text-tools-chip font-semibold text-bg transition-opacity disabled:opacity-60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              {busy ? 'Aplicando…' : 'Aplicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-9 flex-1 rounded-md px-2 text-tools-chip font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'bg-ink text-bg'
          : 'bg-transparent text-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
