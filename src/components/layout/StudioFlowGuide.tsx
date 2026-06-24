'use client';

import {
  getActiveStudioFlowStep,
  getStudioFlowStepIndex,
  STUDIO_FLOW_STEPS,
  type StudioFlowStepId,
} from '@lib/studio/studioFlow';

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
  const activeStep = getActiveStudioFlowStep({
    hasGeneratedPalette,
    hasSelection,
    selectionReady,
  });
  const activeIndex = getStudioFlowStepIndex(activeStep);
  const current = STUDIO_FLOW_STEPS[activeIndex];

  return (
    <section
      aria-label="Progreso del flujo de paleta"
      className="border-b border-border bg-surface/60 px-4 py-3 lg:px-5"
    >
      <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 sm:gap-x-3">
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
        <p className="mx-auto mt-2 max-w-5xl text-[0.8125rem] text-muted">
          <span className="font-semibold text-ink">Paso {activeIndex + 1}:</span> {current.hint}
        </p>
      ) : null}
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
