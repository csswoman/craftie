export type TabListKeyAction = 'next' | 'previous' | 'first' | 'last' | 'activate';

export function resolveTabListKeyAction(
  key: string,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): TabListKeyAction | null {
  if (key === 'Home') {
    return 'first';
  }

  if (key === 'End') {
    return 'last';
  }

  if (key === 'Enter' || key === ' ') {
    return 'activate';
  }

  if (orientation === 'horizontal') {
    if (key === 'ArrowRight') {
      return 'next';
    }

    if (key === 'ArrowLeft') {
      return 'previous';
    }
  } else {
    if (key === 'ArrowDown') {
      return 'next';
    }

    if (key === 'ArrowUp') {
      return 'previous';
    }
  }

  return null;
}

export function wrapTabIndex(
  index: number,
  length: number,
  direction: 'next' | 'previous',
): number {
  if (length <= 0) {
    return 0;
  }

  if (direction === 'next') {
    return (index + 1) % length;
  }

  return (index - 1 + length) % length;
}

export function resolveTabListSelection<T>(
  items: readonly T[],
  currentId: T,
  action: Exclude<TabListKeyAction, 'activate'>,
): T | null {
  const currentIndex = items.indexOf(currentId);

  if (currentIndex < 0 || items.length === 0) {
    return null;
  }

  switch (action) {
    case 'first':
      return items[0] ?? null;
    case 'last':
      return items[items.length - 1] ?? null;
    case 'next':
      return items[wrapTabIndex(currentIndex, items.length, 'next')] ?? null;
    case 'previous':
      return items[wrapTabIndex(currentIndex, items.length, 'previous')] ?? null;
    default:
      return null;
  }
}
