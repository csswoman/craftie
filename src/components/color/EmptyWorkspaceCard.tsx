'use client';

import { CaseStudyIntro } from '@/components/layout/CaseStudyIntro';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { Button } from '@/components/ui/Button';
import { RecentProjects } from '@/components/color/RecentProjects';
import { StartFromColorForm } from '@/components/color/StartFromColorForm';
import type { LocalProject } from '@lib/studio/projectModel';

export type EmptyWorkspaceCardProps = {
  fileName: string | null;
  hasPreview: boolean;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
  onStartFromHex: (hex: string) => string | null;
  recentProjects: LocalProject[];
  onOpenProject: (project: LocalProject) => void;
};

export function EmptyWorkspaceCard({
  fileName,
  hasPreview,
  imagePreviewUrl,
  isImageBusy,
  onImageFileSelected,
  onImageRegenerate,
  onOpenInspiration,
  onStartFromHex,
  recentProjects,
  onOpenProject,
}: EmptyWorkspaceCardProps) {
  return (
    <section
      aria-labelledby="workspace-empty-title"
      className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-[1.1fr_minmax(0,22rem)] lg:gap-12"
    >
      {/* Left: dog illustration + portfolio case-study framing. */}
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static public SVG illustration. */}
        <img
          src="/craftie-img.svg"
          alt=""
          width={400}
          height={400}
          className="h-auto w-full max-w-[12rem] select-none sm:max-w-[14rem]"
          draggable={false}
        />
        <div className="mt-6 w-full lg:mt-8">
          {recentProjects.length > 0 ? (
            <RecentProjects projects={recentProjects} onOpen={onOpenProject} />
          ) : (
            <CaseStudyIntro />
          )}
        </div>
      </div>

      {/* Right: the inspiration action card. */}
      <div className="w-full max-w-md justify-self-center rounded-xl border border-border bg-bg p-6 lg:justify-self-end lg:p-7">
        <h2
          id="workspace-empty-title"
          className="text-balance font-display text-[1.375rem] font-medium leading-snug text-ink"
        >
          Empieza por aquí
        </h2>
        <p className="mt-2 text-pretty text-chrome-body leading-relaxed text-muted">
          Elige un estilo, sube una imagen o escribe un color.
        </p>

        <Button
          type="button"
          variant="primary"
          className="mt-5 min-h-11 w-full rounded-lg"
          onClick={onOpenInspiration}
        >
          Explorar estilos
        </Button>

        <div className="mt-7">
          <p className="mb-2 text-chrome-label font-semibold text-ink">Subir una imagen</p>
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

        <div className="mt-7">
          <StartFromColorForm onStart={onStartFromHex} />
        </div>
      </div>
    </section>
  );
}
