'use client';

import { Button } from '@/components/ui/Button';
import { useT } from '@/context/I18nContext';

export type ReviewPhaseControlsProps = {
  onEditSelection: () => void;
};

export function ReviewPhaseControls({ onEditSelection }: ReviewPhaseControlsProps) {
  const t = useT();
  return (
    <Button
      type="button"
      variant="ghost"
      className="w-full border border-border/50 px-3 py-2 text-[0.8125rem]"
      onClick={onEditSelection}
    >{t('ui.ReviewPhaseControls.editar-colores-fuente')}</Button>
  );
}
