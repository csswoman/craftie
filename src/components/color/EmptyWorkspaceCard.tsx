'use client';

import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { Button } from '@/components/ui/Button';

export type EmptyWorkspaceCardProps = {
  fileName: string | null;
  hasPreview: boolean;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
};

export function EmptyWorkspaceCard({
  fileName,
  hasPreview,
  imagePreviewUrl,
  isImageBusy,
  onImageFileSelected,
  onImageRegenerate,
  onOpenInspiration,
}: EmptyWorkspaceCardProps) {
  return (
    <section aria-labelledby="workspace-empty-title" className="w-full max-w-lg">
      {/* eslint-disable-next-line @next/next/no-img-element -- Static public SVG illustration. */}
      <img
        src="/craftie-img.svg"
        alt=""
        width={400}
        height={400}
        className="mx-auto h-auto w-full max-w-[14rem] select-none sm:max-w-xs"
        draggable={false}
      />

      <h2
        id="workspace-empty-title"
        className="mt-5 text-balance font-display text-[1.375rem] font-medium leading-snug text-ink"
      >
        Empieza con una inspiración
      </h2>
      <p className="prose-measure mt-2 text-pretty text-chrome-label leading-relaxed text-muted">
        Elige un estilo o sube una imagen. Craftie carga colores semilla al instante para tu marca.
      </p>

      <Button
        type="button"
        variant="primary"
        className="mt-5 min-h-11 w-full rounded-lg"
        onClick={onOpenInspiration}
      >
        Elegir estilo curado
      </Button>

      <div className="mt-6 border-t border-border pt-5">
        <p className="mb-3 text-chrome-label font-semibold text-ink">O sube una imagen</p>
        <ImageUploader
          fileName={fileName}
          hasPreview={hasPreview}
          isLoading={isImageBusy}
          previewUrl={imagePreviewUrl}
          onFileSelected={onImageFileSelected}
          onRegenerate={onImageRegenerate}
          variant="embedded"
          showHeader={false}
          showDropzone={!hasPreview}
          showChangeImageControl={false}
        />
      </div>

      <p className="mt-5 text-chrome-caption leading-relaxed text-muted">
        Después: toca cualquier rol para ajustar su color y revisar el contraste en contexto.
      </p>
    </section>
  );
}
