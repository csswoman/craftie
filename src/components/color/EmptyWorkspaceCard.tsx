'use client';

import { CaseStudyIntro } from '@/components/layout/CaseStudyIntro';
import { ImageUploader } from '@/components/color-engine/ImageUploader';
import { ImagePlus, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StartOptionIcon } from '@/components/color/StartOptionIcon';
import { HeroPaletteStrip } from '@/components/color/HeroPaletteStrip';
import { RecentProjects } from '@/components/color/RecentProjects';
import { StartFromColorForm } from '@/components/color/StartFromColorForm';
import type { LocalProject } from '@lib/studio/projectModel';
import { useT } from '@/context/I18nContext';

export type EmptyWorkspaceCardProps = {
  fileName: string | null;
  hasPreview: boolean;
  imagePreviewUrl: string | null;
  isImageBusy: boolean;
  onImageFileSelected: (file: File) => void;
  onImageRegenerate: () => void;
  onOpenInspiration: () => void;
  onStartFromHex: (hex: string) => string | null;
  onLoadExample: () => void;
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
  onLoadExample,
  recentProjects,
  onOpenProject,
}: EmptyWorkspaceCardProps) {
  const t = useT();
  return (
    <section
      aria-labelledby="workspace-empty-title"
      className="m-auto grid w-full max-w-5xl items-start gap-x-12 gap-y-8 lg:grid-cols-[1.1fr_minmax(0,24rem)] lg:gap-y-10"
    >
      {/* Left: dog illustration + portfolio case-study framing. */}
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static public SVG illustration. */}
        <img
          src="/craftie-img.svg"
          alt=""
          width={400}
          height={400}
          className="mascot-in h-auto w-full max-w-[11rem] select-none sm:max-w-[12rem] lg:-ml-5 lg:max-w-[13rem]"
          draggable={false}
        />
        <div className="-mt-3 w-full lg:-mt-5">
          {recentProjects.length > 0 ? (
            <RecentProjects projects={recentProjects} onOpen={onOpenProject} />
          ) : (
            <CaseStudyIntro />
          )}
        </div>
      </div>

      {/* Right: the inspiration action card. */}
      <div className="w-full max-w-md justify-self-center rounded-xl bg-surface-raised p-6 lg:justify-self-end lg:p-8">
        <h2
          id="workspace-empty-title"
          className="text-balance font-display text-[1.75rem] font-medium leading-[1.15] text-ink"
        >
          {t('start.title')}
        </h2>
        <p className="mt-2 text-pretty text-[0.9375rem] leading-snug text-muted">
          {t('start.lead')}
        </p>

        <Button
          type="button"
          variant="primary"
          className="mt-5 min-h-11 w-full rounded-lg"
          onClick={onOpenInspiration}
        >
          <Palette aria-hidden="true" className="mr-2 size-[18px]" />
          {t('start.exploreStyles')}
        </Button>

        <div className="mt-7">
          <p className="mb-3 flex items-center gap-2.5 text-[0.9375rem] font-bold text-ink">
            <StartOptionIcon>
              <ImagePlus />
            </StartOptionIcon>
            {t('start.uploadImage')}
          </p>
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
        <div className="mt-8">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full rounded-lg font-semibold text-primary"
            onClick={onLoadExample}
          >
            <Sparkles aria-hidden="true" className="mr-2 size-[18px]" />
            {t('start.loadExample')}
          </Button>
          <p className="mt-1 text-center text-[0.8125rem] text-muted">{t('start.loadExampleHint')}</p>
        </div>
      </div>

      {/* Bottom: sample palette, the only saturated colour on the page. */}
      <div className="lg:col-span-2">
        <HeroPaletteStrip />
      </div>
    </section>
  );
}
