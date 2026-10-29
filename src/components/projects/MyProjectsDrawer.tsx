'use client';

import { useRef, useState } from 'react';

import { X } from 'lucide-react';

import type { LocalProject } from '@lib/studio/projectModel';

import { ProjectListItem } from '@/components/projects/ProjectListItem';
import type { SaveResult } from '@/components/projects/useLocalProjects';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';

export type MyProjectsDrawerProps = {
  open: boolean;
  onClose: () => void;
  projects: LocalProject[];
  loading: boolean;
  canSave: boolean;
  currentProject: LocalProject | null;
  onSaveAsNew: (name: string) => Promise<SaveResult>;
  onRename: (id: string, name: string) => Promise<SaveResult>;
  onDuplicate: (id: string) => Promise<SaveResult>;
  onOpenProject: (project: LocalProject) => void;
  onDeleteProject: (project: LocalProject) => void;
};

const INPUT_CLASS =
  'min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-chrome-body text-ink placeholder:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:opacity-60';
const PRIMARY_BUTTON =
  'shrink-0 rounded-lg bg-primary px-4 py-2 text-chrome-label font-semibold text-white transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50';

export function MyProjectsDrawer({
  open,
  onClose,
  projects,
  loading,
  canSave,
  currentProject,
  onSaveAsNew,
  onRename,
  onDuplicate,
  onOpenProject,
  onDeleteProject,
}: MyProjectsDrawerProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [renameDraft, setRenameDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  async function run(action: () => Promise<SaveResult>, success: string, onOk?: () => void) {
    if (busy) return;
    setBusy(true);
    setFeedback(null);
    const result = await action();
    setBusy(false);
    if (result.ok) {
      onOk?.();
      setFeedback(success);
    } else {
      setFeedback(result.error);
    }
  }

  const renameValue = renameDraft ?? currentProject?.name ?? '';

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
              Un proyecto se guarda solo mientras trabajas. Todo queda en este
              navegador; no se envía nada a ningún servidor.
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

        <div className="shrink-0 space-y-4 border-b border-border/40 px-4 py-4 sm:px-5">
          {currentProject ? (
            <div>
              <label htmlFor="project-rename" className="block text-chrome-label font-medium text-ink">
                Proyecto abierto
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="project-rename"
                  type="text"
                  value={renameValue}
                  maxLength={80}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  className={INPUT_CLASS}
                />
                <button
                  type="button"
                  className={PRIMARY_BUTTON}
                  disabled={busy || renameValue.trim().length === 0 || renameValue.trim() === currentProject.name}
                  onClick={() =>
                    void run(() => onRename(currentProject.id, renameValue), 'Nombre actualizado.', () =>
                      setRenameDraft(null),
                    )
                  }
                >
                  Renombrar
                </button>
              </div>
            </div>
          ) : null}

          <div>
            <label htmlFor="project-name" className="block text-chrome-label font-medium text-ink">
              {currentProject ? 'Guardar como proyecto nuevo' : 'Guardar paleta actual como proyecto'}
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
                    void run(() => onSaveAsNew(name), 'Proyecto guardado.', () => setName(''));
                  }
                }}
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => void run(() => onSaveAsNew(name), 'Proyecto guardado.', () => setName(''))}
                disabled={!canSave || busy || name.trim().length === 0}
                className={PRIMARY_BUTTON}
              >
                {busy ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
            {!canSave ? (
              <p className="mt-2 text-chrome-caption text-muted">
                Elige una paleta primero para poder guardarla.
              </p>
            ) : null}
          </div>

          {feedback ? (
            <p role="status" className="text-chrome-caption text-muted">
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
                  isCurrent={project.id === currentProject?.id}
                  onOpen={(selected) => {
                    onOpenProject(selected);
                    onClose();
                  }}
                  onDuplicate={(selected) => void run(() => onDuplicate(selected.id), 'Proyecto duplicado.')}
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
