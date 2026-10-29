/**
 * Browser adapter for generating a project id. Prefers `crypto.randomUUID`
 * and falls back to a timestamp + random suffix when it is unavailable, so a
 * usable unique id is always returned without throwing.
 */
export function createProjectId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to the timestamp-based id.
  }

  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
