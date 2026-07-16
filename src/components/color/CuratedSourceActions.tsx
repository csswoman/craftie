'use client';

import { useId } from 'react';

export function CuratedSourceActions({
  onOpenInspiration,
  onImageFileSelected,
}: {
  onOpenInspiration: () => void;
  onImageFileSelected: (file: File) => void;
}) {
  const inputId = useId();

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-line-soft pb-3">
      <button
        type="button"
        onClick={onOpenInspiration}
        className="min-h-10 rounded-md border border-line bg-bg px-2 text-[0.71875rem] font-semibold text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
        Cambiar estilo
      </button>
      <label
        htmlFor={inputId}
        className="flex min-h-10 cursor-pointer items-center justify-center rounded-md border border-line bg-bg px-2 text-[0.71875rem] font-semibold text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
      >
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
