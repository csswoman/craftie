'use client';

import { useEffect, useState } from 'react';

export function useMinWidthQuery(minWidthPx: number, defaultMatches = false) {
  const query = `(min-width: ${minWidthPx}px)`;
  const [matches, setMatches] = useState(defaultMatches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    function handleChange() {
      setMatches(mediaQuery.matches);
    }

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}
