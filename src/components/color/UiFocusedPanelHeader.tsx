import { ChevronLeft } from 'lucide-react';
import { useT, useTx } from '@/context/I18nContext';

export function UiFocusedPanelHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  const tx = useTx();
  const t = useT();
  return (
    <header className="border-b border-line-soft pb-4">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={t('ui.UiFocusedPanelHeader.volver-al-panel-de-color')}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
        >
          <ChevronLeft aria-hidden="true" size={22} strokeWidth={2.25} absoluteStrokeWidth />
        </button>
        <div className="min-w-0 pt-2">
          <h2 className="font-sans text-[1.125rem] font-semibold leading-tight text-ink">{tx(title)}</h2>
          <p className="mt-1 text-tools-meta-scale leading-relaxed text-muted">{tx(subtitle)}</p>
        </div>
      </div>
    </header>
  );
}
