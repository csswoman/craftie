'use client';

import { BookOpen, FolderOpen } from 'lucide-react';

import Link from 'next/link';

import { ExportMenu } from '@/components/layout/ExportMenu';
import { WorkspaceMobileMenu } from '@/components/layout/WorkspaceMobileMenu';
import { HELP_ITEMS, HintIcon } from '@/components/layout/workspaceHelp';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import type { ProjectSaveStatus } from '@/components/projects/useLocalProjects';

const SAVE_STATUS_LABEL: Record<ProjectSaveStatus, string> = {
  idle: 'Borrador',
  saving: 'Guardando…',
  saved: 'Guardado',
  error: 'No se pudo guardar',
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
  onExportDesignMd,
  onExportBrandKit,
  onExportImage,
  onCopyShareLink,
}: WorkspaceHeaderProps) {
  const exportMenu = (
    <ExportMenu
      canExport={canExport}
      onExportCss={onExportCss}
      onCopyCss={onCopyCss}
      onExportTokensJson={onExportTokensJson}
      onExportFigmaTokens={onExportFigmaTokens}
      onExportDesignMd={onExportDesignMd}
      onExportBrandKit={onExportBrandKit}
      onExportImage={onExportImage}
      onCopyShareLink={onCopyShareLink}
    />
  );

  return (
    <header className="relative z-sticky shrink-0 px-2 pt-2 xl:px-4 xl:pt-4">
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-2.5 xl:px-4">
        <button
          type="button"
          onClick={onCraftieHome}
          aria-label="Volver al inicio"
          className="shrink-0 text-ink transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          <h1 className="font-display text-(--chrome-text-display) font-medium leading-none">
            Craftie
          </h1>
        </button>

        <button
          type="button"
          onClick={onOpenMyProjects}
          title={projectName ? 'Abrir Mis proyectos' : 'Guardar como proyecto'}
          className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-2 text-chrome-label text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:flex-none sm:justify-start"
        >
          <span className="truncate font-semibold text-ink">{projectName ?? 'Sin título'}</span>
          <span role="status" className={`shrink-0 ${saveStatus === 'error' ? 'font-semibold text-fail' : ''}`}>
            · {projectName ? SAVE_STATUS_LABEL[saveStatus] : 'Borrador'}
          </span>
        </button>

        <div className="flex min-w-0 items-center justify-end gap-1">
          <nav aria-label="Acciones del espacio de trabajo" className="hidden min-w-0 items-center justify-end gap-1 sm:flex">
            <ThemeToggle />
            <button
              type="button"
              onClick={onOpenMyProjects}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
            >
              <FolderOpen className="size-4" aria-hidden="true" strokeWidth={1.8} />
              <span>Mis proyectos</span>
            </button>
            <Link
              href="/docs"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
            >
              <BookOpen className="size-4" aria-hidden="true" strokeWidth={1.8} />
              <span>Docs</span>
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
  return (
    <div className="group relative">
      <button
        type="button"
        title="Ver guía rápida"
        aria-label="Ver guía rápida de Craftie"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2.5 py-2 text-chrome-label font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 sm:px-3"
      >
        <HintIcon />
        <span className="hidden sm:inline">Ayuda</span>
      </button>
      <div className="invisible pointer-events-none absolute right-0 top-full z-dropdown w-[min(100vw-2rem,360px)] pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        <div
          id="workspace-help"
          role="tooltip"
          className="rounded-xl border border-border bg-bg p-3"
          style={{ boxShadow: 'var(--shadow-float)' }}
        >
          <p className="text-chrome-label font-semibold text-ink">Guía rápida</p>
          <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">
            Todo lo que puedes hacer en Craftie.
          </p>
          <ul className="mt-3 space-y-1.5" aria-label="Funcionalidades del proyecto">
            {HELP_ITEMS.map(({ icon: Icon, label, description }) => (
              <li key={label} className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-raised">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" strokeWidth={1.8} />
                <span className="min-w-0 text-chrome-caption leading-snug">
                  <span className="font-semibold text-ink">{label}:</span>{' '}
                  <span className="text-muted">{description}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
