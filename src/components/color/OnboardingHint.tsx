'use client';

import { Sparkles } from 'lucide-react';

export type OnboardingHintProps = {
  onDismiss: () => void;
};

/**
 * First-load hint shown alongside the preloaded example palette. Neutral, flat,
 * and WCAG-AA per the Quiet Gallery aesthetic — it points newcomers at the flow
 * without a decorative card grid or color-heavy chrome. Dismissal persists via
 * the controller's onboarding adapter.
 */
export function OnboardingHint({ onDismiss }: OnboardingHintProps) {
  return (
    <section
      aria-label="Bienvenida a Craftie"
      className="relative mx-4 mt-3 shrink-0 rounded-xl border border-border bg-bg px-3 py-3 lg:mx-7 lg:mt-4 lg:px-4"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-label="Ocultar bienvenida"
        title="Ocultar"
      >
        <CloseIcon />
      </button>

      <div className="flex min-w-0 items-start gap-2.5 pr-10 sm:pr-12">
        <span
          className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-surface-raised text-primary"
          aria-hidden="true"
        >
          <Sparkles className="size-4" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-chrome-label font-semibold text-ink">
            Empezamos con una paleta de ejemplo
          </p>
          <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">
            Explora el sistema de color y la tipografía de inmediato. Cuando quieras la tuya, abre
            Inspiración para elegir un estilo o extraer colores de una imagen.
          </p>
        </div>
      </div>
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
