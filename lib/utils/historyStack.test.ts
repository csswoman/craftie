import { describe, expect, it } from 'vitest';

import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from './historyStack';

describe('historyStack', () => {
  it('starts without undo or redo', () => {
    const history = createHistory('a');
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });

  it('pushes and undoes in order', () => {
    let history = createHistory('a');
    history = pushHistory(history, 'b');
    history = pushHistory(history, 'c');

    expect(history.present).toBe('c');
    history = undoHistory(history);
    expect(history.present).toBe('b');
    history = undoHistory(history);
    expect(history.present).toBe('a');
    expect(canUndo(history)).toBe(false);
  });

  it('redoes after undo', () => {
    let history = pushHistory(createHistory('a'), 'b');
    history = undoHistory(history);
    expect(canRedo(history)).toBe(true);
    history = redoHistory(history);
    expect(history.present).toBe('b');
    expect(canRedo(history)).toBe(false);
  });

  it('clears redo branch on new push', () => {
    let history = pushHistory(createHistory('a'), 'b');
    history = undoHistory(history);
    history = pushHistory(history, 'c');
    expect(canRedo(history)).toBe(false);
    expect(history.present).toBe('c');
  });

  it('ignores pushes of the same reference', () => {
    const history = createHistory('a');
    expect(pushHistory(history, 'a')).toBe(history);
  });

  it('drops oldest entries beyond the limit', () => {
    let history = createHistory(0);
    for (let step = 1; step <= 60; step += 1) {
      history = pushHistory(history, step, 50);
    }

    expect(history.past.length).toBe(50);
    expect(history.past[0]).toBe(10);
    expect(history.present).toBe(60);
  });

  it('is a no-op to undo/redo at the edges', () => {
    const history = createHistory('a');
    expect(undoHistory(history)).toBe(history);
    expect(redoHistory(history)).toBe(history);
  });
});
