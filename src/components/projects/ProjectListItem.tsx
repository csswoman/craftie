'use client';

import { Trash2 } from 'lucide-react';

import type { LocalProject } from '@lib/studio/projectModel';

export type ProjectListItemProps = {
  project: LocalProject;
  onOpen: (project: LocalProject) => void;
  onDelete: (project: LocalProject) => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export function ProjectListItem({ project, onOpen, onDelete }: ProjectListItemProps) {
  const swatchCount = project.snapshot.extractedColors.length;

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg p-2.5 transition-colors hover:border-border">
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <span className="shrink-0 overflow-hidden rounded-md border border-border/50">
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.thumbnail}
              alt=""
              width={80}
              height={24}
              className="block h-6 w-20 object-cover"
            />
          ) : (
            <span className="block h-6 w-20 bg-surface-raised" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-chrome-body font-medium text-ink">
            {project.name}
          </span>
          <span className="block text-chrome-caption text-muted">
            {swatchCount} {swatchCount === 1 ? 'color' : 'colores'} ·{' '}
            {DATE_FORMAT.format(project.updatedAt)}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onDelete(project)}
        aria-label={`Eliminar ${project.name}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-fail focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
    </li>
  );
}
