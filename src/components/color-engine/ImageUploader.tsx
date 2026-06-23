'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { buildImagePalette } from '@lib/color/imagePalette';
import { extractPaletteColorsFromImage, validateImageFile } from '@lib/color/imageExtractor';
import type { ImagePaletteBuildResult } from '@lib/color/imagePalette';

export type ImageUploaderProps = {
  onExtractionStart?: () => void;
  onPaletteExtracted: (palette: ImagePaletteBuildResult) => void;
  onExtractionError?: (message: string) => void;
  variant?: 'default' | 'embedded';
  showHeader?: boolean;
};

const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp';
const MAX_FILE_SIZE_MB = 5;

export function ImageUploader({
  onExtractionStart,
  onPaletteExtracted,
  onExtractionError,
  variant = 'default',
  showHeader = true,
}: ImageUploaderProps) {
  const isEmbedded = variant === 'embedded';
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl !== null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function processFile(file: File) {
    setError(null);

    try {
      validateImageFile(file, MAX_FILE_SIZE_MB);
    } catch (validationError) {
      const message =
        validationError instanceof Error
          ? validationError.message
          : 'No se pudo validar la imagen.';
      setError(message);
      onExtractionError?.(message);
      return;
    }

    if (previewUrl !== null) {
      URL.revokeObjectURL(previewUrl);
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setFileName(file.name);
    setIsLoading(true);
    onExtractionStart?.();

    try {
      const extracted = await extractPaletteColorsFromImage(file);
      onPaletteExtracted(buildImagePalette(extracted));
    } catch (extractionError) {
      const message =
        extractionError instanceof Error
          ? extractionError.message
          : 'No se pudieron extraer colores de la imagen.';
      setError(message);
      onExtractionError?.(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void processFile(file);
    }

    event.target.value = '';
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      void processFile(file);
    }
  }

  return (
    <section
      aria-label="Subir imagen de inspiración"
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
          <h2 className={`font-semibold text-ink ${isEmbedded ? 'text-[0.9375rem]' : 'text-base'}`}>
            Inspiración desde imagen
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
            Sube una imagen local para extraer neutros claros, colores intensos y neutros oscuros. El
            archivo no sale de tu navegador.
          </p>
        </div>
      ) : null}

      <div
        className={`${showHeader ? 'mt-4' : ''} rounded-md border border-dashed px-4 py-6 transition-colors ${
          isDragging ? 'border-primary bg-surface-raised' : 'border-border bg-bg'
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileChange}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-[0.9375rem] text-ink">
            Arrastra una imagen aquí o{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              selecciona un archivo
            </button>
          </p>
          <p className="text-[0.8125rem] text-muted">JPG, PNG o WebP · máximo 5 MB</p>
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-[0.8125rem] font-medium text-fail">
          {error}
        </p>
      ) : null}

      {previewUrl !== null ? (
        <figure className="mt-4 overflow-hidden rounded-md border border-border bg-bg">
          <img
            src={previewUrl}
            alt={fileName ? `Vista previa de ${fileName}` : 'Vista previa de la imagen subida'}
            className="max-h-56 w-full object-contain"
          />
          {fileName ? (
            <figcaption className="border-t border-border px-3 py-2 text-[0.75rem] text-muted">
              {fileName}
            </figcaption>
          ) : null}
        </figure>
      ) : null}
    </section>
  );
}
