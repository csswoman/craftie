'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createProject,
  duplicateProject as duplicateProjectModel,
  renameProject as renameProjectModel,
  sortProjectsByUpdatedAt,
  updateProjectSnapshot,
  type LocalProject,
} from '@lib/studio/projectModel';
import { serializeWorkspace, type WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';

import { readCurrentProjectId, writeCurrentProjectId } from '@/lib/browser/currentProject';
import {
  deleteProject as deleteProjectFromDb,
  getAllProjects,
  putProject,
} from '@/lib/browser/projectsDb';
import { createProjectId } from '@/lib/browser/projectId';
import { renderPaletteThumbnail } from '@/lib/browser/paletteThumbnail';

const AUTOSAVE_DELAY_MS = 800;

export type SaveResult = { ok: true } | { ok: false; error: string };
export type ProjectSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type LocalProjectsController = {
  projects: LocalProject[];
  loading: boolean;
  currentProject: LocalProject | null;
  saveStatus: ProjectSaveStatus;
  /** Create a new project from the live workspace and bind the workspace to it. */
  saveAsNew: (name: string) => Promise<SaveResult>;
  /** Bind the workspace to an existing project (after reopening it). */
  setCurrent: (id: string) => void;
  /** Unbind the workspace (back to a free draft). */
  closeCurrent: () => void;
  rename: (id: string, name: string) => Promise<SaveResult>;
  duplicate: (id: string) => Promise<SaveResult>;
  deleteProject: (id: string) => Promise<void>;
};

function thumbnailFor(snapshot: WorkspaceSnapshot): string | null {
  return renderPaletteThumbnail(snapshot.extractedColors.map((color) => color.hex));
}

/**
 * Loads saved projects from IndexedDB, tracks which one the workspace is bound
 * to, and autosaves the live snapshot into it. All persistence goes through the
 * browser adapters; this hook only owns in-memory state and orchestration.
 * A free draft (no current project) is still autosaved by the palette context.
 */
export function useLocalProjects(
  getSnapshot: () => WorkspaceSnapshot,
  hasWorkspace: boolean,
): LocalProjectsController {
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<ProjectSaveStatus>('idle');
  const projectsRef = useRef<LocalProject[]>([]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  useEffect(() => {
    let active = true;
    void getAllProjects().then((stored) => {
      if (!active) return;
      const sorted = sortProjectsByUpdatedAt(stored);
      projectsRef.current = sorted;
      setProjects(sorted);
      const persistedId = readCurrentProjectId();
      if (persistedId && sorted.some((entry) => entry.id === persistedId)) {
        setCurrentId(persistedId);
        setSaveStatus('saved');
      } else if (persistedId) {
        writeCurrentProjectId(null);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const upsertLocal = useCallback((project: LocalProject) => {
    setProjects((current) =>
      sortProjectsByUpdatedAt([project, ...current.filter((entry) => entry.id !== project.id)]),
    );
  }, []);

  // Debounced autosave into the bound project. Skips writes that would not
  // change the stored snapshot so reopening a project never bumps its date.
  useEffect(() => {
    if (loading || currentId === null) return;

    const timer = window.setTimeout(() => {
      const project = projectsRef.current.find((entry) => entry.id === currentId);
      if (!project) return;

      const snapshot = getSnapshot();
      if (serializeWorkspace(snapshot) === serializeWorkspace(project.snapshot)) return;

      const updated = updateProjectSnapshot(project, snapshot, Date.now(), thumbnailFor(snapshot));
      setSaveStatus('saving');
      void putProject(updated).then((persisted) => {
        if (persisted) {
          projectsRef.current = [updated, ...projectsRef.current.filter((e) => e.id !== updated.id)];
          upsertLocal(updated);
          setSaveStatus('saved');
        } else {
          setSaveStatus('error');
        }
      });
    }, AUTOSAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [getSnapshot, currentId, loading, upsertLocal]);

  const bind = useCallback((id: string | null) => {
    setCurrentId(id);
    writeCurrentProjectId(id);
    setSaveStatus(id === null ? 'idle' : 'saved');
  }, []);

  // Going back to the empty state means a free draft again: unbind the project.
  const hadWorkspaceRef = useRef(false);
  useEffect(() => {
    if (hasWorkspace) {
      hadWorkspaceRef.current = true;
    } else if (hadWorkspaceRef.current) {
      hadWorkspaceRef.current = false;
      bind(null);
    }
  }, [hasWorkspace, bind]);

  const saveAsNew = useCallback(
    async (name: string): Promise<SaveResult> => {
      const snapshot = getSnapshot();
      const project = createProject(name, snapshot, {
        id: createProjectId(),
        now: Date.now(),
        thumbnail: thumbnailFor(snapshot),
      });

      if (!project) {
        return { ok: false, error: 'Escribe un nombre para el proyecto.' };
      }

      if (!(await putProject(project))) {
        return { ok: false, error: 'No se pudo guardar el proyecto en este navegador.' };
      }

      projectsRef.current = [project, ...projectsRef.current];
      upsertLocal(project);
      bind(project.id);
      return { ok: true };
    },
    [bind, getSnapshot, upsertLocal],
  );

  const rename = useCallback(
    async (id: string, name: string): Promise<SaveResult> => {
      const project = projectsRef.current.find((entry) => entry.id === id);
      const renamed = project ? renameProjectModel(project, name, Date.now()) : null;
      if (!renamed) return { ok: false, error: 'Escribe un nombre para el proyecto.' };
      if (!(await putProject(renamed))) {
        return { ok: false, error: 'No se pudo renombrar el proyecto.' };
      }
      projectsRef.current = projectsRef.current.map((entry) => (entry.id === id ? renamed : entry));
      upsertLocal(renamed);
      return { ok: true };
    },
    [upsertLocal],
  );

  const duplicate = useCallback(
    async (id: string): Promise<SaveResult> => {
      const project = projectsRef.current.find((entry) => entry.id === id);
      if (!project) return { ok: false, error: 'No se encontró el proyecto.' };
      const copy = duplicateProjectModel(project, { id: createProjectId(), now: Date.now() });
      if (!(await putProject(copy))) {
        return { ok: false, error: 'No se pudo duplicar el proyecto.' };
      }
      projectsRef.current = [copy, ...projectsRef.current];
      upsertLocal(copy);
      return { ok: true };
    },
    [upsertLocal],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await deleteProjectFromDb(id);
      projectsRef.current = projectsRef.current.filter((entry) => entry.id !== id);
      setProjects((current) => current.filter((entry) => entry.id !== id));
      if (currentId === id) bind(null);
    },
    [bind, currentId],
  );

  const currentProject = useMemo(
    () => projects.find((entry) => entry.id === currentId) ?? null,
    [projects, currentId],
  );

  return {
    projects,
    loading,
    currentProject,
    saveStatus,
    saveAsNew,
    setCurrent: bind,
    closeCurrent: useCallback(() => bind(null), [bind]),
    rename,
    duplicate,
    deleteProject,
  };
}
