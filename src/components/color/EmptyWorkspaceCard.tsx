'use client';

import { DESIGN_STYLES } from '@lib/styles/presets';

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

const PREVIEW_SWATCHES = DESIGN_STYLES.flatMap((style) => style.thumbnailColors).slice(0, 8);

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
      <div
        className="flex h-20 overflow-hidden rounded-lg border border-border"
        aria-hidden="true"
      >
        {PREVIEW_SWATCHES.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="min-w-0 flex-1"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

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
        Después: ajusta los roles en el Inspector y revisa el contraste.
      </p>
    </section>
  );
}
