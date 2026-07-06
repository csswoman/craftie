'use client';

import { useEffect, useState } from 'react';

import {
  getActiveStudioFlowStep,
  getStudioFlowStepIndex,
  STUDIO_FLOW_STEPS,
  type StudioFlowStepId,
} from '@lib/studio/studioFlow';
import { readFlowGuideDismissed, writeFlowGuideDismissed } from '@/lib/browser/flowGuideDismiss';

export type StudioFlowGuideProps = {
  hasGeneratedPalette: boolean;
  hasSelection: boolean;
  selectionReady: boolean;
  onStepFocus?: (stepId: StudioFlowStepId) => void;
};

export function StudioFlowGuide({
  hasGeneratedPalette,
  hasSelection,
  selectionReady,
  onStepFocus,
}: StudioFlowGuideProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // The dismissed flag lives in localStorage, so it is only known after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(readFlowGuideDismissed());
  }, []);

  if (dismissed) {
    return null;
  }

  const activeStep = getActiveStudioFlowStep({
    hasGeneratedPalette,
    hasSelection,
    selectionReady,
  });
  const activeIndex = getStudioFlowStepIndex(activeStep);
  const current = STUDIO_FLOW_STEPS[activeIndex];

  function handleDismiss() {
    writeFlowGuideDismissed(true);
    setDismissed(true);
  }

  return (
    <section
      aria-label="Progreso del flujo de paleta"
      className="relative shrink-0 border-b border-border bg-surface/60 px-4 py-2.5 lg:px-6"
    >
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Ocultar guía del flujo"
        title="Ocultar guía"
        className="absolute right-3 top-2 flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 lg:right-5"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
          <path
            d="M4 4l8 8M12 4l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-8">
        <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-3">
          {STUDIO_FLOW_STEPS.map((step, index) => {
            const status = getStepStatus(index, activeIndex);
            const canFocus = index <= activeIndex && onStepFocus !== undefined;

            return (
              <li key={step.id} className="flex items-center gap-2 sm:gap-3">
                <StepBadge
                  step={step}
                  status={status}
                  canFocus={canFocus}
                  onFocus={onStepFocus ? () => onStepFocus(step.id) : undefined}
                />
                {index < STUDIO_FLOW_STEPS.length - 1 ? (
                  <span className="hidden text-muted sm:inline" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
        {current ? (
          <p className="mt-1.5 text-center text-[0.8125rem] text-muted">
            <span className="font-semibold text-ink">Paso {activeIndex + 1}:</span> {current.hint}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function getStepStatus(index: number, activeIndex: number): 'complete' | 'current' | 'upcoming' {
  if (index < activeIndex) {
    return 'complete';
  }

  if (index === activeIndex) {
    return 'current';
  }

  return 'upcoming';
}

function StepBadge({
  step,
  status,
  canFocus,
  onFocus,
}: {
  step: { id: StudioFlowStepId; label: string };
  status: 'complete' | 'current' | 'upcoming';
  canFocus: boolean;
  onFocus?: () => void;
}) {
  const styles = {
    complete: 'border-primary/30 bg-primary/10 text-primary hover:border-primary/45',
    current: 'border-primary bg-primary text-white hover:bg-primary-hover',
    upcoming: 'border-border bg-bg text-muted',
  }[status];

  const className = `inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[0.75rem] font-semibold sm:px-3 sm:text-[0.8125rem] ${styles} ${
    canFocus ? 'cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25' : ''
  }`;

  if (canFocus && onFocus) {
    return (
      <button
        type="button"
        onClick={onFocus}
        className={className}
        aria-current={status === 'current' ? 'step' : undefined}
      >
        <span className="sr-only">
          {status === 'complete' ? 'Completado: ' : status === 'current' ? 'Actual: ' : 'Pendiente: '}
        </span>
        {step.label}
      </button>
    );
  }

  return (
    <span
      className={className}
      aria-current={status === 'current' ? 'step' : undefined}
    >
      <span className="sr-only">
        {status === 'complete' ? 'Completado: ' : status === 'current' ? 'Actual: ' : 'Pendiente: '}
      </span>
      {step.label}
    </span>
  );
}
