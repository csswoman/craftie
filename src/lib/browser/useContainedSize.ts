'use client';

import { useEffect, useRef, useState } from 'react';

export type BoxSize = { width: number; height: number };

/**
 * Largest box of the given aspect ratio (width / height) that fits inside the
 * observed element, like `object-fit: contain`, kept in sync on resize.
 */
export function useContainedSize<T extends HTMLElement>(aspect: number | null) {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<BoxSize | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !aspect) {
      return;
    }

    // ResizeObserver also reports the initial size right after observe().
    const observer = new ResizeObserver(() => {
      const width = Math.min(element.clientWidth, element.clientHeight * aspect);
      setBox(width > 0 ? { width, height: width / aspect } : null);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [aspect]);

  return { ref, box };
}
