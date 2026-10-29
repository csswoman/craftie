export const WORKSPACE_SNAPSHOT_KEY = 'craftie:workspace-snapshot';

export function readWorkspaceSnapshot(): string | null {
  try {
    return window.localStorage.getItem(WORKSPACE_SNAPSHOT_KEY);
  } catch {
    return null;
  }
}

export function writeWorkspaceSnapshot(serialized: string): void {
  try {
    window.localStorage.setItem(WORKSPACE_SNAPSHOT_KEY, serialized);
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}

export function clearWorkspaceSnapshot(): void {
  try {
    window.localStorage.removeItem(WORKSPACE_SNAPSHOT_KEY);
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
