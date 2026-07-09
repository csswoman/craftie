'use client';

import type { ReactNode } from 'react';

export type ImageUploadPreviewProps = {
  previewUrl: string;
  fileName: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
  variant?: 'default' | 'compact';
  trailingControl?: ReactNode;
};

export function ImageUploadPreview({
  previewUrl,
  fileName,
  isLoading,
  onRegenerate,
  variant = 'default',
  trailingControl,
}: ImageUploadPreviewProps) {
  if (variant === 'compact') {
    return (
      <figure className="flex min-w-0 items-center gap-[var(--chrome-space-2)] rounded-[var(--chrome-radius-card)] border border-border bg-bg p-[var(--chrome-space-2)]">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-[var(--chrome-radius-control)] border border-border bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a local blob URL from the selected file. */}
          <img
            src={previewUrl}
            alt={fileName ? `Vista previa de ${fileName}` : 'Vista previa de la imagen subida'}
            width={44}
            height={44}
            className="h-full w-full object-cover"
          />
        </div>
        <figcaption className="min-w-0 flex-1">
          <p className="truncate font-sans text-tools-name font-medium text-ink">
            {fileName ?? 'Imagen de referencia'}
          </p>
          <p className="font-sans text-tools-meta font-normal text-muted">Colores extraídos de la imagen</p>
        </figcaption>
        <div className="flex shrink-0 items-center gap-[var(--chrome-space-1)]">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isLoading}
            aria-label="Volver a extraer colores de la imagen"
            title="Volver a extraer colores"
            className="flex size-11 shrink-0 items-center justify-center rounded-[var(--chrome-radius-control)] border border-border bg-surface text-ink transition-colors hover:bg-surface-raised hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RegenerateIcon spinning={isLoading} />
          </button>
          {trailingControl}
        </div>
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-md border border-border bg-bg">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a local blob URL from the selected file. */}
        <img
          src={previewUrl}
          alt={fileName ? `Vista previa de ${fileName}` : 'Vista previa de la imagen subida'}
          width={640}
          height={360}
          className="max-h-56 w-full object-contain"
        />
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          aria-label="Volver a extraer colores de la imagen"
          title="Volver a extraer colores"
          className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full border border-border bg-bg text-ink transition-colors hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RegenerateIcon spinning={isLoading} />
        </button>
      </div>
      {fileName ? (
        <figcaption className="truncate border-t border-border px-3 py-2 text-[0.75rem] text-muted">
          {fileName}
        </figcaption>
      ) : null}
    </figure>
  );
}

function RegenerateIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`size-[0.95rem] ${spinning ? 'animate-spin motion-reduce:animate-none' : ''}`}
    >
      <path
        d="M13 3v3H10M3 13V10H6M13 8a5 5 0 0 0-8.5-3.5L3 6M3 8a5 5 0 0 0 8.5 3.5L13 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
