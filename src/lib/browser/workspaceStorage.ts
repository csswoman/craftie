export const WORKSPACE_SNAPSHOT_KEY = 'craftie:workspace-snapshot';
// Set in sessionStorage whenever this tab autosaves. Its presence means the stored
// snapshot belongs to the current browsing session (e.g. a reload), not a past visit.
export const WORKSPACE_SESSION_KEY = 'craftie:workspace-session';

/**
 * Returns the autosaved snapshot only when it was written during the current
 * browser session. A fresh visit starts on the welcome screen instead of
 * silently reopening the last palette.
 */
export function readWorkspaceSnapshot(): string | null {
  try {
    if (window.sessionStorage.getItem(WORKSPACE_SESSION_KEY) === null) {
      return null;
    }
    return window.localStorage.getItem(WORKSPACE_SNAPSHOT_KEY);
  } catch {
    return null;
  }
}

export function writeWorkspaceSnapshot(serialized: string): void {
  try {
    window.localStorage.setItem(WORKSPACE_SNAPSHOT_KEY, serialized);
    window.sessionStorage.setItem(WORKSPACE_SESSION_KEY, '1');
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

export function clearWorkspaceSnapshot(): void {
  try {
    window.localStorage.removeItem(WORKSPACE_SNAPSHOT_KEY);
    window.sessionStorage.removeItem(WORKSPACE_SESSION_KEY);
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
