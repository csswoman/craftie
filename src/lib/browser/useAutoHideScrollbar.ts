'use client';

import { useEffect, useRef } from 'react';

const SCROLLING_CLEAR_MS = 700;

/**
 * Marks the scroll container with `data-scrolling` while the user scrolls,
 * so CSS can reveal an overlay scrollbar only during active scrolling.
 */
export function useAutoHideScrollbar<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    let clearTimer = 0;

    function handleScroll() {
      element!.dataset.scrolling = '';
      window.clearTimeout(clearTimer);
      clearTimer = window.setTimeout(() => {
        delete element!.dataset.scrolling;
      }, SCROLLING_CLEAR_MS);
    }

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.clearTimeout(clearTimer);
    };
  }, []);

  return ref;
}
