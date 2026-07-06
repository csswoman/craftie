'use client';

import { Button } from '@/components/ui/Button';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function GenerateButton({ onClick, disabled = false, busy = false }: GenerateButtonProps) {
  return (
    <div className="space-y-1.5">
      <Button type="button" onClick={onClick} disabled={disabled || busy} aria-busy={busy} className="w-full">
        {busy ? 'Creando guía…' : 'Crear guía de marca'}
      </Button>
      <p className="text-center text-[0.6875rem] leading-relaxed text-muted">
        Finaliza los roles y abre la vista de marca con exportación.
      </p>
    </div>
  );
}
