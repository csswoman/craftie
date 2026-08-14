'use client';

import { useId } from 'react';

const ACTION_CLASS =
  'inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-bg px-3 text-chrome-label font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25';

export function CuratedSourceActions({
  onOpenInspiration,
  onImageFileSelected,
}: {
  onOpenInspiration: () => void;
  onImageFileSelected: (file: File) => void;
}) {
  const inputId = useId();

  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={onOpenInspiration} className={ACTION_CLASS}>
        Cambiar estilo
      </button>
      <label htmlFor={inputId} className={`cursor-pointer ${ACTION_CLASS}`}>
        Usar imagen
      </label>
      <input
        id={inputId}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImageFileSelected(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
