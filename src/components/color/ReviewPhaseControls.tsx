'use client';

import { Button } from '@/components/ui/Button';

export type ReviewPhaseControlsProps = {
  onEditSelection: () => void;
};

export function ReviewPhaseControls({ onEditSelection }: ReviewPhaseControlsProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
      onClick={onEditSelection}
    >
      Editar colores fuente
    </Button>
  );
}
