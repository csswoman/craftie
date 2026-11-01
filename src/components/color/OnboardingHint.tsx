'use client';

import { Sparkles } from 'lucide-react';
import { useT } from '@/context/I18nContext';

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
  const t = useT();
  return (
    <section
      aria-label={t('ui.OnboardingHint.bienvenida-a-craftie')}
      className="relative shrink-0 border-b border-border bg-surface px-4 py-2.5 xl:px-5"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-label={t('ui.OnboardingHint.ocultar-bienvenida')}
        title={t('ui.OnboardingHint.ocultar')}
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
          <p className="text-chrome-label font-semibold text-ink">{t('ui.OnboardingHint.empezamos-con-una-paleta-de')}</p>
          <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">{t('ui.OnboardingHint.explora-el-sistema-de-color')}</p>
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
