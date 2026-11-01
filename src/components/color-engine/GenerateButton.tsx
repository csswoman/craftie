'use client';

import { Button } from '@/components/ui/Button';
import { useT } from '@/context/I18nContext';

interface GenerateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}

export function GenerateButton({ onClick, disabled = false, busy = false }: GenerateButtonProps) {
  const t = useT();
  return (
    <div className="space-y-1.5">
      <Button
        id="generate-brand-guide"
        type="button"
        onClick={onClick}
        disabled={disabled || busy}
        aria-busy={busy}
        className="w-full"
      >
        {busy ? t('ui.GenerateButton.abriendo-guia') : t('ui.GenerateButton.ver-guia-de-marca')}
      </Button>
      <p className="text-center text-chrome-caption leading-relaxed text-muted">{t('ui.GenerateButton.completa-los-7-roles-para')}</p>
    </div>
  );
}
