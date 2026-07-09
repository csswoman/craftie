const STORAGE_KEY = 'craftie:selected-font-pair-id';

export function readSelectedFontPairId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeSelectedFontPairId(pairId: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, pairId);
  } catch {
    // Persisting the selected type pair is best-effort only.
  }
}
