'use client';

import { useRef, useState } from 'react';

import { X } from 'lucide-react';

import type { LocalProject } from '@lib/studio/projectModel';
import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';

import { ProjectListItem } from '@/components/projects/ProjectListItem';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

export type MyProjectsDrawerProps = {
  open: boolean;
  onClose: () => void;
  projects: LocalProject[];
  loading: boolean;
  canSave: boolean;
  getSnapshot: () => WorkspaceSnapshot;
  onSave: (name: string, snapshot: WorkspaceSnapshot) => Promise<{ ok: true } | { ok: false; error: string }>;
  onOpenProject: (project: LocalProject) => void;
  onDeleteProject: (project: LocalProject) => void;
};

export function MyProjectsDrawer({
  open,
  onClose,
  projects,
  loading,
  canSave,
  getSnapshot,
  onSave,
  onOpenProject,
  onDeleteProject,
}: MyProjectsDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useDialogAccessibility({
    open,
    dialogRef,
    onClose,
    initialFocusSelector: '[data-project-name-input]',
    lockScroll: true,
  });

  if (!open) {
    return null;
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setFeedback(null);
    const result = await onSave(name, getSnapshot());
    setSaving(false);

    if (result.ok) {
      setName('');
      setFeedback('Proyecto guardado.');
    } else {
      setFeedback(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-dropdown flex justify-end overscroll-contain bg-ink/20">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="my-projects-title"
        className="relative z-10 flex h-full w-full max-w-sm flex-col overflow-hidden border-l border-border bg-surface"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border/40 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            <h2 id="my-projects-title" className="text-chrome-title">
              Mis proyectos
            </h2>
            <p className="prose-measure mt-1 text-chrome-label leading-relaxed text-muted">
              Guarda paletas con nombre en este navegador y vuelve a abrirlas
              cuando quieras. No se envía nada a ningún servidor.
            </p>
          </div>
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="Cerrar"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        <div className="shrink-0 border-b border-border/40 px-4 py-4 sm:px-5">
          <label
            htmlFor="project-name"
            className="block text-chrome-label font-medium text-ink"
          >
            Guardar paleta actual
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="project-name"
              data-project-name-input
              type="text"
              value={name}
              maxLength={80}
              disabled={!canSave}
              placeholder="Nombre del proyecto"
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              className="min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-chrome-body text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={!canSave || saving || name.trim().length === 0}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-chrome-label font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
          {!canSave ? (
            <p className="mt-2 text-chrome-caption text-muted">
              Genera una paleta primero para poder guardarla.
            </p>
          ) : null}
          {feedback ? (
            <p role="status" className="mt-2 text-chrome-caption text-muted">
              {feedback}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {loading ? (
            <p className="text-chrome-label text-muted">Cargando proyectos…</p>
          ) : projects.length === 0 ? (
            <p className="text-chrome-label leading-relaxed text-muted">
              Aún no has guardado proyectos. Guarda tu paleta actual para
              empezar tu colección.
            </p>
          ) : (
            <ul className="space-y-2">
              {projects.map((project) => (
                <ProjectListItem
                  key={project.id}
                  project={project}
                  onOpen={(selected) => {
                    onOpenProject(selected);
                    onClose();
                  }}
                  onDelete={onDeleteProject}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
