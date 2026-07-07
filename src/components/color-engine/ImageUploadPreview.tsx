'use client';

export type ImageUploadPreviewProps = {
  previewUrl: string;
  fileName: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
};

export function ImageUploadPreview({
  previewUrl,
  fileName,
  isLoading,
  onRegenerate,
}: ImageUploadPreviewProps) {
  return (
    <figure className="overflow-hidden rounded-md border border-border bg-bg">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element -- Preview uses a local blob URL from the selected file. */}
        <img
          src={previewUrl}
          alt={fileName ? `Vista previa de ${fileName}` : 'Vista previa de la imagen subida'}
          className="max-h-56 w-full object-contain"
        />
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isLoading}
          aria-label="Regenerar paleta de la imagen"
          title="Regenerar paleta"
          className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full border border-white/40 bg-bg/95 text-ink shadow-[0_8px_24px_rgba(17,24,39,0.18)] backdrop-blur-sm transition-transform transition-colors hover:-translate-y-0.5 hover:bg-surface hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
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
