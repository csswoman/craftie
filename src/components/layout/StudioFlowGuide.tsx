'use client';

import {
  getActiveStudioFlowStep,
  getStudioFlowStepIndex,
  STUDIO_FLOW_STEPS,
  type StudioFlowStepId,
} from '@lib/studio/studioFlow';
import { Accessibility, Download, Image, Palette, Type } from 'lucide-react';
import { useT, useTx } from '@/context/I18nContext';

export type StudioFlowGuideProps = {
  hasGeneratedPalette: boolean;
  hasSelection: boolean;
  selectionReady: boolean;
  onStepFocus?: (stepId: StudioFlowStepId) => void;
  onDismiss: () => void;
};

const QUICK_GUIDE_ITEMS = [
  {
    icon: Image,
    label: 'Inspiración',
    description: 'Elige un estilo curado o extrae colores de una imagen.',
  },
  {
    icon: Palette,
    label: 'Sistema de color',
    description: 'Edita roles, neutrales, acentos y temas claro/oscuro.',
  },
  {
    icon: Accessibility,
    label: 'Accesibilidad',
    description: 'Comprueba contraste WCAG y consulta la lectura APCA.',
  },
  {
    icon: Type,
    label: 'Tipografía',
    description: 'Explora parejas y aplica fuentes de Google o locales.',
  },
  {
    icon: Download,
    label: 'Exportación',
    description: 'Descarga tu brand kit JSON o una guía DESIGN.md.',
  },
] as const;

export function StudioFlowGuide({
  hasGeneratedPalette,
  hasSelection,
  selectionReady,
  onStepFocus,
  onDismiss,
}: StudioFlowGuideProps) {
  const tx = useTx();
  const t = useT();
  const activeStep = getActiveStudioFlowStep({
    hasGeneratedPalette,
    hasSelection,
    selectionReady,
  });
  const activeIndex = getStudioFlowStepIndex(activeStep);
  const current = STUDIO_FLOW_STEPS[activeIndex];

  return (
    <section
      aria-label={t('ui.StudioFlowGuide.guia-rapida-de-craftie')}
      className="relative mx-4 mt-3 shrink-0 rounded-xl border border-border bg-bg px-3 py-3 lg:mx-7 lg:mt-4 lg:px-4"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-label={t('ui.StudioFlowGuide.ocultar-guia-del-flujo')}
        title={t('ui.StudioFlowGuide.ocultar-guia')}
      >
        <CloseIcon />
      </button>

      <div className="pr-10 sm:pr-12">
        <p className="text-chrome-label font-semibold text-ink">{t('ui.StudioFlowGuide.guia-rapida')}</p>
        <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">{t('ui.StudioFlowGuide.construye-una-guia-de-marca')}</p>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label={t('ui.StudioFlowGuide.funcionalidades')}>
        {QUICK_GUIDE_ITEMS.map(({ icon: Icon, label, description }) => (
          <li key={label} className="flex min-w-0 items-start gap-2 rounded-lg bg-surface-raised px-2.5 py-2">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-bg text-primary" aria-hidden="true">
              <Icon className="size-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0">
              <span className="block text-chrome-label font-semibold text-ink">{tx(label)}</span>
              <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">{tx(description)}</span>
            </span>
          </li>
        ))}
      </ul>

      {current ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-2.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-chrome-caption leading-snug text-ink">
            <span className="font-semibold">{t('ui.StudioFlowGuide.siguiente-paso', { label: tx(current.label) })}</span> {tx(current.hint)}
          </p>
          {onStepFocus && current.id !== 'review' ? (
            <button
              type="button"
              onClick={() => onStepFocus(current.id)}
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg px-3 text-chrome-caption font-semibold text-ink transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >{t('ui.StudioFlowGuide.ir-al-paso')}</button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
