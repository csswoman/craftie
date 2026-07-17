'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { resolveActiveThemeFromUi } from '@lib/color/themePalette';

type Mode = 'light' | 'dark';

const MODES: { id: Mode; label: string }[] = [
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
];

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves the active theme on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Before mount the resolved theme is unknown; render a stable placeholder.
  const active: Mode = mounted ? resolveActiveThemeFromUi(resolvedTheme) : 'light';

  function handleSelect(mode: Mode) {
    // next-themes is the source of truth; RolePaletteContext derives activeTheme from it.
    setTheme(mode);
  }

  return (
    <div
      className="inline-flex shrink-0 gap-0.5 rounded-lg border border-line/60 bg-surface p-1"
      role="group"
      aria-label="Tema de la interfaz: claro u oscuro"
    >
      {MODES.map((mode) => {
        const selected = active === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            aria-pressed={selected}
            aria-label={`Tema ${mode.label.toLowerCase()}`}
            title={`Tema ${mode.label.toLowerCase()}`}
            disabled={!mounted}
            onClick={() => handleSelect(mode.id)}
            className={`grid min-h-11 min-w-11 place-items-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
              selected ? 'bg-surface-raised text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`}
          >
            {mode.id === 'light' ? (
              <Sun size={16} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Moon size={16} strokeWidth={1.75} aria-hidden="true" />
            )}
            <span className="sr-only">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
