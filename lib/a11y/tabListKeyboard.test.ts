import { describe, expect, it } from 'vitest';

import {
  resolveTabListKeyAction,
  resolveTabListSelection,
  wrapTabIndex,
} from './tabListKeyboard';

describe('tabListKeyboard', () => {
  it('maps horizontal arrow keys', () => {
    expect(resolveTabListKeyAction('ArrowRight')).toBe('next');
    expect(resolveTabListKeyAction('ArrowLeft')).toBe('previous');
    expect(resolveTabListKeyAction('ArrowDown', 'horizontal')).toBeNull();
  });

  it('maps vertical arrow keys', () => {
    expect(resolveTabListKeyAction('ArrowDown', 'vertical')).toBe('next');
    expect(resolveTabListKeyAction('ArrowUp', 'vertical')).toBe('previous');
  });

  it('wraps tab indices', () => {
    expect(wrapTabIndex(2, 3, 'next')).toBe(0);
    expect(wrapTabIndex(0, 3, 'previous')).toBe(2);
  });

  it('resolves the next tab id', () => {
    const items = ['a', 'b', 'c'] as const;

    expect(resolveTabListSelection(items, 'b', 'next')).toBe('c');
    expect(resolveTabListSelection(items, 'c', 'next')).toBe('a');
    expect(resolveTabListSelection(items, 'a', 'previous')).toBe('c');
  });
});
