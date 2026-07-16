'use client';

import { RefreshCw, Upload } from 'lucide-react';
import { useId } from 'react';

export type PaletteImageBlockProps = {
  previewUrl: string;
  fileName: string | null;
  imageFingerprint: string | null;
  isRegenerating: boolean;
  onFileSelected: (file: File) => void;
  onRegenerate: () => void;
};

export function PaletteImageBlock({
  previewUrl,
  fileName,
  imageFingerprint,
  isRegenerating,
  onFileSelected,
  onRegenerate,
}: PaletteImageBlockProps) {
  const inputId = useId();
  const imageIdentity = imageFingerprint ? `${imageFingerprint.slice(0, 9)}…` : fileName ?? 'Imagen fuente';

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    event.target.value = '';
  }

  return (
    <div className="flex items-center gap-2 rounded-[11px] border border-line bg-surface-raised px-2 py-1.5">
      <div
        title={imageIdentity}
        className="size-[30px] shrink-0 overflow-hidden rounded-[7px] border border-line bg-surface"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a local blob URL from the selected file. */}
        <img
          src={previewUrl}
          alt={fileName ? `Imagen fuente: ${fileName}` : 'Imagen fuente'}
          width={30}
          height={30}
          className="h-full w-full object-cover"
        />
      </div>

      <button
        type="button"
        title="Regenerar paleta"
        aria-label="Regenerar paleta"
        disabled={isRegenerating}
        onClick={onRegenerate}
        className="flex size-[30px] shrink-0 items-center justify-center rounded-[7px] bg-transparent text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          aria-hidden="true"
          className={`size-4 ${isRegenerating ? 'animate-spin motion-reduce:animate-none' : ''}`}
          strokeWidth={2}
        />
      </button>

      <label
        htmlFor={inputId}
        title="Cambiar imagen"
        aria-label="Cambiar imagen"
        className="flex size-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[7px] bg-transparent text-muted transition-colors hover:bg-surface hover:text-ink focus-within:outline-none focus-within:ring-[3px] focus-within:ring-primary/25"
      >
        <Upload aria-hidden="true" className="size-4" strokeWidth={2} />
      </label>
      <input
        id={inputId}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="sr-only"
      />
    </div>
  );
}
