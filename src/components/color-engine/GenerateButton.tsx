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
        La paleta se calcula solo al pulsar el botón.
      </p>
    </div>
  );
}
