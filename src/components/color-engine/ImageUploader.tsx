'use client';

import { useId } from 'react';

import { ImageUploadPreview } from '@/components/color-engine/ImageUploadPreview';

export type ImageUploaderProps = {
  fileName: string | null;
  hasPreview: boolean;
  isLoading: boolean;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onRegenerate: () => void;
  variant?: 'default' | 'embedded';
  showHeader?: boolean;
  showDropzone?: boolean;
  showChangeImageControl?: boolean;
  previewVariant?: 'default' | 'compact';
};

export function ImageUploader({
  fileName,
  hasPreview,
  isLoading,
  previewUrl,
  onFileSelected,
  onRegenerate,
  variant = 'default',
  showHeader = true,
  showDropzone = true,
  showChangeImageControl = true,
  previewVariant = 'default',
}: ImageUploaderProps) {
  const isEmbedded = variant === 'embedded';
  const inputId = useId();
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      onFileSelected(file);
    }

    event.target.value = '';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      onFileSelected(file);
    }
  }

  return (
    <section
      aria-label="Subir imagen de inspiración"
      aria-busy={isLoading}
      className={
        isEmbedded
          ? showHeader
            ? 'mt-6 space-y-3'
            : 'space-y-3'
          : 'rounded-lg border border-border bg-surface p-5'
      }
    >
      {showHeader ? (
        <div>
          <h2 className={`font-semibold text-ink ${isEmbedded ? 'text-[0.9375rem]' : 'text-base'}`}>Inspiración desde imagen</h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Sube una imagen local para extraer colores y armar automáticamente una paleta por roles. El archivo no sale de tu navegador.
          </p>
        </div>
      ) : null}

      {hasPreview ? (
        <ImageUploadPreview
          previewUrl={previewUrl ?? ''}
          fileName={fileName}
          isLoading={isLoading}
          onRegenerate={onRegenerate}
          variant={previewVariant}
          trailingControl={
            showChangeImageControl && previewVariant === 'compact' ? (
              <label
                htmlFor={inputId}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-[var(--chrome-radius-control)] border border-border bg-surface px-[var(--chrome-space-2)] font-sans text-tools-body font-medium text-[var(--chrome-green)] transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                Cambiar
              </label>
            ) : null
          }
        />
      ) : null}

      <input
        id={inputId}
        type="file"
        name="inspiration-image"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className="sr-only"
      />

      {showDropzone ? (
        <div
          className={`rounded-md border border-dashed px-4 py-6 transition-colors ${
            hasPreview ? 'mt-3 border-border bg-bg' : `${showHeader ? 'mt-4' : ''} border-border bg-bg`
          }`}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-[0.9375rem] text-ink">
              {hasPreview ? 'Arrastra otra imagen o ' : 'Arrastra una imagen aquí o '}
              <label
                htmlFor={inputId}
                className="cursor-pointer font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                {hasPreview ? 'cambia la imagen' : 'selecciona un archivo'}
              </label>
            </p>
            {!hasPreview ? <p className="text-[0.8125rem] text-muted">JPG, PNG o WebP · máximo 5 MB</p> : null}
          </div>
        </div>
      ) : null}

      {hasPreview && showChangeImageControl && previewVariant !== 'compact' ? (
        <div className="pt-2">
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] font-medium text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <ChangeImageIcon />
            Cambiar imagen
          </label>
        </div>
      ) : null}

    </section>
  );
}

function ChangeImageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5">
      <path
        d="M3 8h10M8 3l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
