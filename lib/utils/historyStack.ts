export type HistoryStack<T> = {
  past: T[];
  present: T;
  future: T[];
};

export const HISTORY_LIMIT = 50;

export function createHistory<T>(present: T): HistoryStack<T> {
  return { past: [], present, future: [] };
}

export function pushHistory<T>(
  history: HistoryStack<T>,
  next: T,
  limit: number = HISTORY_LIMIT,
): HistoryStack<T> {
  if (next === history.present) return history;

  const past = [...history.past, history.present];
  return {
    past: past.length > limit ? past.slice(past.length - limit) : past,
    present: next,
    future: [],
  };
}

export function canUndo<T>(history: HistoryStack<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: HistoryStack<T>): boolean {
  return history.future.length > 0;
}

export function undoHistory<T>(history: HistoryStack<T>): HistoryStack<T> {
  if (!canUndo(history)) return history;

  return {
    past: history.past.slice(0, -1),
    present: history.past[history.past.length - 1]!,
    future: [history.present, ...history.future],
  };
}

export function redoHistory<T>(history: HistoryStack<T>): HistoryStack<T> {
  if (!canRedo(history)) return history;

  return {
    past: [...history.past, history.present],
    present: history.future[0]!,
    future: history.future.slice(1),
  };
}
