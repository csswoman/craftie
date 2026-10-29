'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  createProject,
  sortProjectsByUpdatedAt,
  type LocalProject,
} from '@lib/studio/projectModel';
import type { WorkspaceSnapshot } from '@lib/studio/workspaceSnapshot';

import {
  deleteProject as deleteProjectFromDb,
  getAllProjects,
  putProject,
} from '@/lib/browser/projectsDb';
import { createProjectId } from '@/lib/browser/projectId';
import { renderPaletteThumbnail } from '@/lib/browser/paletteThumbnail';

type SaveResult = { ok: true } | { ok: false; error: string };

export type LocalProjectsController = {
  projects: LocalProject[];
  loading: boolean;
  saveCurrent: (name: string, snapshot: WorkspaceSnapshot) => Promise<SaveResult>;
  deleteProject: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

/**
 * Loads saved projects from IndexedDB and exposes save/delete handlers. All
 * persistence goes through the browser adapter; this hook only holds the
 * in-memory list (sorted newest-first) and keeps it in sync after writes.
 */
export function useLocalProjects(): LocalProjectsController {
  const [projects, setProjects] = useState<LocalProject[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = await getAllProjects();
    setProjects(sortProjectsByUpdatedAt(stored));
  }, []);

  useEffect(() => {
    let active = true;
    void getAllProjects().then((stored) => {
      if (!active) return;
      setProjects(sortProjectsByUpdatedAt(stored));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const saveCurrent = useCallback(
    async (name: string, snapshot: WorkspaceSnapshot): Promise<SaveResult> => {
      const thumbnail = renderPaletteThumbnail(
        snapshot.extractedColors.map((color) => color.hex),
      );
      const project = createProject(name, snapshot, {
        id: createProjectId(),
        now: Date.now(),
        thumbnail,
      });

      if (!project) {
        return { ok: false, error: 'Escribe un nombre para el proyecto.' };
      }

      const persisted = await putProject(project);
      if (!persisted) {
        return {
          ok: false,
          error: 'No se pudo guardar el proyecto en este navegador.',
        };
      }

      setProjects((current) =>
        sortProjectsByUpdatedAt([
          project,
          ...current.filter((entry) => entry.id !== project.id),
        ]),
      );
      return { ok: true };
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    await deleteProjectFromDb(id);
    setProjects((current) => current.filter((entry) => entry.id !== id));
  }, []);

  return { projects, loading, saveCurrent, deleteProject, refresh };
}
