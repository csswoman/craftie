
import { useT } from '@/context/I18nContext';export function EmptyCanvas() {
  const t = useT();
  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-surface-raised/40 px-6 py-8">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- Static public SVG illustration. */}
        <img src="/craftie-img.svg" alt="" width={96} height={96} className="size-24 select-none opacity-90" draggable={false} />
      <p className="prose-measure max-w-xs text-center text-chrome-label leading-relaxed text-muted">{t('ui.PaletteCanvasEmptyStates.elige-una-inspiracion-para-crear')}</p>
      </div>
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
