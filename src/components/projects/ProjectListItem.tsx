'use client';

import { useState } from 'react';

import { Copy, Trash2 } from 'lucide-react';

import type { LocalProject } from '@lib/studio/projectModel';
import { useT, useTx } from '@/context/I18nContext';

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
  const tx = useTx();
  const t = useT();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const swatchCount = project.snapshot.extractedColors.length;

  if (confirmingDelete) {
    return (
      <li className="rounded-xl border border-fail/40 bg-bg p-3">
        <p className="text-chrome-label text-ink">{t('ui.ProjectListItem.eliminar-esta-accion-no-se', { name: tx(project.name) })}</p>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onDelete(project)}
            className="rounded-lg bg-fail px-3 py-1.5 text-chrome-label font-semibold text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >{t('ui.ProjectListItem.eliminar')}</button>
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-lg border border-border px-3 py-1.5 text-chrome-label font-semibold text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >{t('ui.ProjectListItem.cancelar')}</button>
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
            {tx(project.name)}
            {isCurrent ? <span className="ml-2 text-chrome-caption font-semibold text-primary">{t('ui.ProjectListItem.abierto')}</span> : null}
          </span>
          <span className="block text-chrome-caption text-muted">
            {swatchCount} {tx(swatchCount === 1 ? 'color' : 'colores')} · {tx(DATE_FORMAT.format(project.updatedAt))}
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onDuplicate(project)} aria-label={t('ui.ProjectListItem.duplicar', { name: tx(project.name) })} className={ICON_BUTTON}>
        <Copy className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => setConfirmingDelete(true)}
        aria-label={t('ui.ProjectListItem.eliminar-2', { name: tx(project.name) })}
        className={`${ICON_BUTTON} hover:text-fail`}
      >
        <Trash2 className="size-4" aria-hidden="true" strokeWidth={1.8} />
      </button>
    </li>
  );
}
