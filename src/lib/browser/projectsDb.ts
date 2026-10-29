/**
 * IndexedDB adapter for locally saved projects ("Mis proyectos"). This is the
 * only module that touches IndexedDB; the pure model and validation live in
 * `@lib/studio/projectModel`. Every operation fails gracefully — a missing or
 * blocked IndexedDB resolves to an empty list / no-op rather than throwing —
 * mirroring the try/catch posture of the other browser adapters.
 */

import {
  validateProject,
  type LocalProject,
} from '@lib/studio/projectModel';

const DB_NAME = 'craftie';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

function hasIndexedDb(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (!hasIndexedDb()) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Persist (insert or replace) a project. Resolves `true` on success. */
export async function putProject(project: LocalProject): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(project);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
      tx.onabort = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
}

/** Read every stored project, skipping any record that fails validation. */
export async function getAllProjects(): Promise<LocalProject[]> {
  const db = await openDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => {
        const raw = Array.isArray(request.result) ? request.result : [];
        const valid = raw
          .map((entry) => validateProject(entry))
          .filter((entry): entry is LocalProject => entry !== null);
        db.close();
        resolve(valid);
      };
      request.onerror = () => {
        db.close();
        resolve([]);
      };
    } catch {
      db.close();
      resolve([]);
    }
  });
}

/** Read a single project by id, or `null` when absent/invalid. */
export async function getProject(id: string): Promise<LocalProject | null> {
  const db = await openDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        db.close();
        resolve(validateProject(request.result));
      };
      request.onerror = () => {
        db.close();
        resolve(null);
      };
    } catch {
      db.close();
      resolve(null);
    }
  });
}

/** Delete a project by id. Resolves `true` when the delete completes. */
export async function deleteProject(id: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => {
        db.close();
        resolve(true);
      };
      tx.onerror = () => {
        db.close();
        resolve(false);
      };
      tx.onabort = () => {
        db.close();
        resolve(false);
      };
    } catch {
      db.close();
      resolve(false);
    }
  });
}
