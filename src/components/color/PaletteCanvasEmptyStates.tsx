
import { useT } from '@/context/I18nContext';export function EmptyCanvas() {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-surface-raised/40 px-6 py-8">
      <p className="prose-measure max-w-xs text-center text-chrome-label leading-relaxed text-muted">{t('ui.PaletteCanvasEmptyStates.elige-una-inspiracion-para-crear')}</p>
    </div>
  );
}

export function PaletteCanvasSkeleton() {
  const t = useT();
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-busy="true" aria-label={t('ui.PaletteCanvasEmptyStates.generando-paleta')}>
      <p className="sr-only">{t('ui.PaletteCanvasEmptyStates.generando-paleta-a-partir-de')}</p>
      <div className="flex-1 animate-pulse bg-surface-raised" />
    </div>
  );
}
