'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { formatShortcutKeys, STUDIO_SHORTCUTS } from '@lib/studio/studioShortcuts';

export type StudioShortcutsHelpHandle = {
  open: () => void;
};

export const StudioShortcutsHelp = forwardRef<StudioShortcutsHelpHandle>(function StudioShortcutsHelp(
  _props,
  ref,
) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    open() {
      const details = detailsRef.current;

      if (!details) {
        return;
      }

      details.open = true;
      details.scrollIntoView({ block: 'nearest' });
    },
  }));

  useEffect(() => {
    const details = detailsRef.current;

    if (!details) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!details?.open) {
        return;
      }

      const target = event.target as Node;

      if (details.contains(target)) {
        return;
      }

      details.open = false;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && details?.open) {
        details.open = false;
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <details
      ref={detailsRef}
      className="group relative hidden sm:block"
      aria-label="Atajos de teclado del estudio"
    >
      <summary className="inline-flex min-h-9 min-w-9 cursor-pointer list-none items-center justify-center rounded-md px-2.5 text-[0.8125rem] font-semibold text-muted transition-colors hover:bg-surface hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 [&::-webkit-details-marker]:hidden">
        Atajos
      </summary>
      <div
        ref={panelRef}
        className="absolute right-0 top-full z-dropdown mt-2 w-[min(100vw-2rem,320px)] rounded-xl border border-border bg-bg p-3"
        style={{ boxShadow: 'var(--shadow-float)' }}
      >
        <p className="text-[0.8125rem] font-semibold text-ink">Atajos de teclado</p>
        <dl className="mt-3 space-y-3">
          {STUDIO_SHORTCUTS.map((shortcut) => (
            <div key={shortcut.keys}>
              <dt className="font-mono text-[0.75rem] font-semibold text-ink">
                {formatShortcutKeys(shortcut.keys)}
              </dt>
              <dd className="mt-0.5 text-[0.8125rem] text-ink">{shortcut.label}</dd>
              <dd className="text-[0.75rem] leading-relaxed text-muted">{shortcut.when}</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
});
