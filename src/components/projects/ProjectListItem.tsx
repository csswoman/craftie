'use client';

import { useState } from 'react';

import { Copy, Trash2 } from 'lucide-react';

import type { LocalProject } from '@lib/studio/projectModel';

export type ProjectListItemProps = {
  project: LocalProject;
  isCurrent: boolean;
  onOpen: (project: LocalProject) => void;
  onDuplicate: (project: LocalProject) => void;
  onDelete: (project: LocalProject) => void;
};

const DATE_FORMAT = new Intl.DateTimeFormat('es', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const ICON_BUTTON =
  'flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25';

export function ProjectListItem({
  project,
  isCurrent,
  onOpen,
  onDuplicate,
  onDelete,
}: ProjectListItemProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const swatchCount = project.snapshot.extractedColors.length;

  if (confirmingDelete) {
    return (
      <li className="rounded-xl border border-fail/40 bg-bg p-3">
        <p className="text-chrome-label text-ink">
          ¿Eliminar «{project.name}»? Esta acción no se puede deshacer.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="rounded-lg bg-fail px-3 py-1.5 text-chrome-label font-semibold text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-chrome-label font-semibold text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Cancelar
          </button>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex items-center gap-2 rounded-xl border bg-bg p-2.5 transition-colors hover:border-border ${
        isCurrent ? 'border-primary/50' : 'border-border/60'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-current={isCurrent ? 'true' : undefined}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <span className="shrink-0 overflow-hidden rounded-md border border-border/50">
          {project.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnail} alt="" width={80} height={24} className="block h-6 w-20 object-cover" />
          ) : (
            <span className="block h-6 w-20 bg-surface-raised" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-chrome-body font-medium text-ink">
            {project.name}
            {isCurrent ? <span className="ml-2 text-chrome-caption font-semibold text-primary">Abierto</span> : null}
          </span>
          <span className="block text-chrome-caption text-muted">
            {swatchCount} {swatchCount === 1 ? 'color' : 'colores'} · {DATE_FORMAT.format(project.updatedAt)}
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onDuplicate(project)} aria-label={`Duplicar ${project.name}`} className={ICON_BUTTON}>
        <Copy className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label={`Eliminar ${project.name}`}
        className={`${ICON_BUTTON} hover:text-fail`}
      >
        <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
    </li>
  );
}
