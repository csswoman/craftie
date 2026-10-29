const CURRENT_PROJECT_KEY = 'craftie:current-project-id';

/** Id of the project the workspace is bound to, or `null` for a free draft. */
export function readCurrentProjectId(): string | null {
  try {
    return window.localStorage.getItem(CURRENT_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function writeCurrentProjectId(id: string | null): void {
  try {
    if (id === null) {
      window.localStorage.removeItem(CURRENT_PROJECT_KEY);
    } else {
      window.localStorage.setItem(CURRENT_PROJECT_KEY, id);
    }
  } catch {
    // Best-effort only.
  }
}
