'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

const toggleClassName =
  'inline-flex size-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves the active theme on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button type="button" className={toggleClassName} aria-label="Cambiar tema" disabled>
        <MoonIcon />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      className={toggleClassName}
      aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <path
        d="M15.5 11.5a6.5 6.5 0 01-8.8-8.8 7 7 0 108.8 8.8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
      <circle cx="10" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v1.75M10 15.75V17.5M4.5 10H2.75M17.25 10H15.5M5.4 5.4l1.24 1.24M13.36 13.36l1.24 1.24M5.4 14.6l1.24-1.24M13.36 6.64l1.24-1.24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
