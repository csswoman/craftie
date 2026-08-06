'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { resolveActiveThemeFromUi } from '@lib/color/themePalette';

type ThemeToggleProps = {
  variant?: 'icon' | 'menu';
};

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // next-themes resolves the active theme on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Before mount the resolved theme is unknown; render a stable placeholder.
  const activeTheme = mounted ? resolveActiveThemeFromUi(resolvedTheme) : 'light';
  const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
  const NextIcon = nextTheme === 'dark' ? Moon : Sun;
  const nextThemeLabel = nextTheme === 'dark' ? 'oscuro' : 'claro';

  function handleToggle() {
    // next-themes is the source of truth; RolePaletteContext derives activeTheme from it.
    setTheme(nextTheme);
  }

  return (
    <button
      type="button"
      aria-label={`Cambiar a tema ${nextThemeLabel}`}
      title={`Cambiar a tema ${nextThemeLabel}`}
      disabled={!mounted}
      onClick={handleToggle}
      className={
        variant === 'menu'
          ? 'flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-chrome-body font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-default'
          : 'inline-grid min-h-11 min-w-11 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-default'
      }
    >
      <NextIcon size={variant === 'menu' ? 18 : 16} strokeWidth={1.75} aria-hidden="true" className={variant === 'menu' ? 'text-muted' : undefined} />
      {variant === 'menu' ? <span>Cambiar a tema {nextThemeLabel}</span> : null}
    </button>
  );
}
