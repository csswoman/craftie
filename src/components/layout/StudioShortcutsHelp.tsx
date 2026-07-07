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
      <summary
        className="inline-flex min-h-10 min-w-10 cursor-pointer list-none items-center justify-center rounded-lg px-2.5 text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 [&::-webkit-details-marker]:hidden"
        title="Atajos de teclado"
      >
        <KeyboardIcon />
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

function KeyboardIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5" fill="none">
      <rect
        x="3"
        y="6"
        width="14"
        height="9"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6 9h.01M8.75 9h.01M11.5 9h.01M14.25 9h.01M6 12h8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
