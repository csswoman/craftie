'use client';

import { useEffect, useRef } from 'react';

import {
  resolveTabListKeyAction,
  resolveTabListSelection,
} from '@lib/a11y/tabListKeyboard';

export function useTabListKeyboard<T extends string>({
  items,
  activeId,
  onActivate,
  orientation = 'horizontal',
}: {
  items: readonly T[];
  activeId: T;
  onActivate: (id: T) => void;
  orientation?: 'horizontal' | 'vertical';
}) {
  const tabRefs = useRef<Partial<Record<T, HTMLButtonElement | null>>>({});
  const previousActiveId = useRef(activeId);

  useEffect(() => {
    const previous = previousActiveId.current;
    previousActiveId.current = activeId;

    if (previous === activeId) {
      return;
    }

    const node = tabRefs.current[activeId];

    if (!node) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      if (!node.isConnected) {
        return;
      }

      node.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeId]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, id: T) {
    const action = resolveTabListKeyAction(event.key, orientation);

    if (!action) {
      return;
    }

    event.preventDefault();

    if (action === 'activate') {
      onActivate(id);
      return;
    }

    const nextId = resolveTabListSelection(items, id, action);

    if (nextId) {
      onActivate(nextId);
    }
  }

  function getTabProps(id: T) {
    return {
      ref: (node: HTMLButtonElement | null) => {
        tabRefs.current[id] = node;
      },
      tabIndex: id === activeId ? 0 : -1,
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => handleKeyDown(event, id),
    };
  }

  return { getTabProps };
}
