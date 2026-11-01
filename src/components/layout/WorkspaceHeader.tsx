'use client';

import { BookOpen, FolderOpen } from 'lucide-react';

import Link from 'next/link';

import { ExportMenu } from '@/components/layout/ExportMenu';
import { WorkspaceMobileMenu } from '@/components/layout/WorkspaceMobileMenu';
import { HELP_ITEMS, HintIcon } from '@/components/layout/workspaceHelp';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageToggle } from '@/components/layout/LanguageToggle';
import type { ProjectSaveStatus } from '@/components/projects/useLocalProjects';
import { useT } from '@/context/I18nContext';
import type { MessageKey } from '@lib/i18n/translate';

const SAVE_STATUS_KEY: Record<ProjectSaveStatus, MessageKey> = {
  idle: 'header.draft',
  saving: 'header.saving',
  saved: 'header.saved',
  error: 'header.saveError',
};

export type WorkspaceHeaderProps = {
  canExport: boolean;
  projectName: string | null;
  saveStatus: ProjectSaveStatus;
  onCraftieHome: () => void;
  onOpenMyProjects: () => void;
  onExportCss: () => void;
  onCopyCss: () => void;
  onExportTokensJson: () => void;
  onExportFigmaTokens: () => void;
  onExportTailwind: () => void;
  onExportShadcn: () => void;
  onExportDesignMd: () => void;
  onExportBrandKit: () => void;
  onExportImage: () => void;
  onCopyShareLink: () => void;
};

export function WorkspaceHeader({
  canExport,
  projectName,
  saveStatus,
  onCraftieHome,
  onOpenMyProjects,
  onExportCss,
  onCopyCss,
  onExportTokensJson,
  onExportFigmaTokens,
  onExportTailwind,
  onExportShadcn,
  onExportDesignMd,
  onExportBrandKit,
  onExportImage,
  onCopyShareLink,
}: WorkspaceHeaderProps) {
  const t = useT();
  const exportMenu = (
    <ExportMenu
      canExport={canExport}
      onExportCss={onExportCss}
      onCopyCss={onCopyCss}
      onExportTokensJson={onExportTokensJson}
      onExportFigmaTokens={onExportFigmaTokens}
      onExportTailwind={onExportTailwind}
      onExportShadcn={onExportShadcn}
      onExportDesignMd={onExportDesignMd}
      onExportBrandKit={onExportBrandKit}
      onExportImage={onExportImage}
      onCopyShareLink={onCopyShareLink}
    />
  );

  return (
    <header className="relative z-sticky shrink-0 border-b border-border bg-bg">
      <div className="flex min-h-14 items-center justify-between gap-3 px-4 py-2 xl:px-5">
        <button
          type="button"
          onClick={onCraftieHome}
          aria-label={t('header.home')}
          className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <h1 className="font-display text-(--chrome-text-display) font-medium leading-none">{t('ui.WorkspaceHeader.craftie')}</h1>
        </button>

        <button
          type="button"
          onClick={onOpenMyProjects}
          title={projectName ? t('header.openProjects') : t('header.saveAsProject')}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-chrome-label text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:flex-none sm:justify-start"
        >
          <span className="truncate font-semibold text-ink">{projectName ?? t('header.untitled')}</span>
          <span role="status" className={`shrink-0 ${saveStatus === 'error' ? 'font-semibold text-fail' : ''}`}>
            · {projectName ? t(SAVE_STATUS_KEY[saveStatus]) : t('header.draft')}
          </span>
        </button>

        <div className="flex min-w-0 items-center justify-end gap-1">
          <nav aria-label={t('header.actionsAria')} className="hidden min-w-0 items-center justify-end gap-1 sm:flex">
            <LanguageToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={onOpenMyProjects}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
            >
              <FolderOpen className="size-4" aria-hidden="true" strokeWidth={1.8} />
              <span>{t('header.myProjects')}</span>
            </button>
            <Link
              href="/docs"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
            >
              <BookOpen className="size-4" aria-hidden="true" strokeWidth={1.8} />
              <span>{t('header.docs')}</span>
            </Link>
            <WorkspaceHelpTooltip />
            {canExport ? (
              <>
                <div className="ml-1 hidden h-7 w-px bg-border sm:block" aria-hidden="true" />
                <div className="ml-1">{exportMenu}</div>
              </>
            ) : null}
          </nav>
          {canExport ? <div className="sm:hidden">{exportMenu}</div> : null}
          <WorkspaceMobileMenu onOpenMyProjects={onOpenMyProjects} />
        </div>
      </div>
    </header>
  );
}

function WorkspaceHelpTooltip() {
  const t = useT();
  return (
    <div className="group relative">
      <button
        type="button"
        title={t('header.helpTitle')}
        aria-label={t('header.helpAria')}
        aria-describedby="workspace-help"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
      >
        <HintIcon />
        <span className="hidden sm:inline">{t('header.help')}</span>
      </button>
      <div className="invisible pointer-events-none absolute right-0 top-full z-dropdown w-[min(100vw-2rem,360px)] pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <div
          id="workspace-help"
          role="tooltip"
          className="rounded-xl border border-border bg-bg p-3"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <p className="text-chrome-label font-semibold text-ink">{t('header.quickGuide')}</p>
          <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">
            {t('header.quickGuideLead')}
          </p>
          <ul className="mt-3 space-y-1.5" aria-label={t('header.featuresAria')}>
            {HELP_ITEMS.map(({ icon: Icon, labelKey, descriptionKey }) => (
              <li key={labelKey} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-raised">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={1.8} />
                <span className="min-w-0 text-chrome-caption leading-snug">
                  <span className="font-semibold text-ink">{t(labelKey)}:</span>{' '}
                  <span className="text-muted">{t(descriptionKey)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
