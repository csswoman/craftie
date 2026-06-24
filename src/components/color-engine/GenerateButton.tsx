'use client';

import { Button } from '@/components/ui/Button';

interface GenerateButtonProps {
  onClick: () => void;
}

export function GenerateButton({ onClick }: GenerateButtonProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" onClick={onClick}>
        Generar paleta
      </Button>
      <p className="text-[0.8125rem] text-muted">
        La paleta se calcula al pulsar el botón o{' '}
        <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[0.6875rem] text-ink">
          Ctrl
        </kbd>
        +
        <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono text-[0.6875rem] text-ink">
          Enter
        </kbd>
        .
      </p>
    </div>
  );
}
