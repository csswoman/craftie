import {
  deserializeWorkspace,
  type WorkspaceSnapshot,
} from './workspaceSnapshot';

/**
 * Pure model for locally saved projects ("Mis proyectos"). A project pairs a
 * human name with a {@link WorkspaceSnapshot} plus an optional thumbnail data
 * URL, so a visitor can keep several palettes side by side and reopen any of
 * them without an account. Kept framework- and browser-agnostic: persistence
 * (IndexedDB) lives in `src/lib/browser/projectsDb.ts` and thumbnail drawing in
 * `src/lib/browser/paletteThumbnail.ts`.
 */

const PROJECT_VERSION = 1 as const;

export type LocalProject = {
  version: typeof PROJECT_VERSION;
  id: string;
  name: string;
  /** Epoch milliseconds. */
  createdAt: number;
  updatedAt: number;
  snapshot: WorkspaceSnapshot;
  /** Data URL for a small preview, or `null` when none could be rendered. */
  thumbnail: string | null;
};

const MAX_NAME_LENGTH = 80;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Collapse whitespace and clamp a candidate project name to a safe length. */
export function normalizeProjectName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

type CreateProjectOptions = {
  id: string;
  now: number;
  thumbnail?: string | null;
};

/**
 * Build a new {@link LocalProject}. `id` and `now` are injected so the module
 * stays deterministic and testable (no `crypto`/`Date.now` reached for here).
 * Returns `null` when the name is empty after normalization.
 */
export function createProject(
  name: string,
  snapshot: WorkspaceSnapshot,
  { id, now, thumbnail = null }: CreateProjectOptions,
): LocalProject | null {
  const normalizedName = normalizeProjectName(name);
  if (normalizedName.length === 0) return null;

  return {
    version: PROJECT_VERSION,
    id,
    name: normalizedName,
    createdAt: now,
    updatedAt: now,
    snapshot,
    thumbnail,
  };
}

/**
 * Validate and normalize a raw value read back from storage. Returns a
 * well-formed {@link LocalProject} or `null` for anything that is not a
 * current-version project with a valid snapshot, so a stale or corrupt record
 * is skipped rather than crashing the drawer.
 */
export function validateProject(raw: unknown): LocalProject | null {
  if (!isObject(raw)) return null;
  if (raw.version !== PROJECT_VERSION) return null;
  if (typeof raw.id !== 'string' || raw.id.length === 0) return null;
  if (typeof raw.name !== 'string') return null;
  if (typeof raw.createdAt !== 'number' || !Number.isFinite(raw.createdAt)) return null;
  if (typeof raw.updatedAt !== 'number' || !Number.isFinite(raw.updatedAt)) return null;
  if (raw.thumbnail !== null && typeof raw.thumbnail !== 'string') return null;

  const name = normalizeProjectName(raw.name);
  if (name.length === 0) return null;

  const snapshot = deserializeWorkspace(raw.snapshot);
  if (snapshot === null) return null;

  return {
    version: PROJECT_VERSION,
    id: raw.id,
    name,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    snapshot,
    thumbnail: raw.thumbnail,
  };
}

/**
 * Return a new array sorted newest-first by `updatedAt`. Ties fall back to
 * `id` so the order is fully deterministic. Does not mutate the input.
 */
export function sortProjectsByUpdatedAt(projects: LocalProject[]): LocalProject[] {
  return [...projects].sort((a, b) => {
    if (b.updatedAt !== a.updatedAt) return b.updatedAt - a.updatedAt;
    return a.id.localeCompare(b.id);
  });
}

/** Produce an updated copy stamped with a fresh `updatedAt`. */
export function touchProject(project: LocalProject, now: number): LocalProject {
  return { ...project, updatedAt: now };
}
