'use client';

import { useEffect, useState } from 'react';

import { formatShortcutKeys } from '@lib/studio/studioShortcuts';

import { Button } from '@/components/ui/Button';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function GenerateButton({ onClick, disabled = false, busy = false }: GenerateButtonProps) {
  const [shortcutLabel, setShortcutLabel] = useState('Ctrl + Enter');

  useEffect(() => {
    setShortcutLabel(formatShortcutKeys('mod+Enter'));
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={onClick} disabled={disabled || busy} aria-busy={busy}>
        {busy ? 'Generando…' : 'Generar paleta'}
      </Button>
      <p className="max-w-[28ch] text-[0.8125rem] leading-relaxed text-muted">
        También con{' '}
        <kbd className="whitespace-nowrap rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[0.6875rem] text-ink">
          {shortcutLabel}
        </kbd>
        .
      </p>
    </div>
  );
}
