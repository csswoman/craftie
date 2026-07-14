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
  onDismiss: () => void;
};

export function StudioFlowGuide({
  hasGeneratedPalette,
  hasSelection,
  selectionReady,
  onStepFocus,
  onDismiss,
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
      className="relative mx-4 mt-3 shrink-0 rounded-xl border border-border bg-bg px-3 py-3 lg:mx-7 lg:mt-4 lg:px-4"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-label="Ocultar guía del flujo"
        title="Ocultar guía"
      >
        <CloseIcon />
      </button>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 pr-10 xl:pr-12">
          <p className="text-chrome-caption text-muted">Flujo</p>
          {current ? (
            <p className="mt-0.5 text-chrome-label text-ink">
              <span className="font-semibold">Ahora:</span> {current.hint}
            </p>
          ) : null}
        </div>

        <ol className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2 xl:pb-0">
          {STUDIO_FLOW_STEPS.map((step, index) => {
            const status = getStepStatus(index, activeIndex);
            const canFocus = index <= activeIndex && onStepFocus !== undefined;

            return (
              <li key={step.id} className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <StepBadge
                  step={step}
                  status={status}
                  index={index}
                  canFocus={canFocus}
                  onFocus={onStepFocus ? () => onStepFocus(step.id) : undefined}
                />
                {index < STUDIO_FLOW_STEPS.length - 1 ? (
                  <span className="text-muted" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
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
  index,
  canFocus,
  onFocus,
}: {
  step: { id: StudioFlowStepId; label: string };
  status: 'complete' | 'current' | 'upcoming';
  index: number;
  canFocus: boolean;
  onFocus?: () => void;
}) {
  const styles = {
    complete: 'border-transparent bg-transparent text-muted hover:text-ink',
    current: 'border-border bg-surface-raised text-ink',
    upcoming: 'border-transparent bg-transparent text-muted/70',
  }[status];

  const className = `inline-flex min-h-9 items-center gap-2 rounded-lg border px-2.5 py-1 text-[0.75rem] font-medium sm:px-3 sm:text-[0.8125rem] ${styles} ${
    canFocus ? 'cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25' : ''
  }`;
  const label = `${index + 1}. ${step.label}`;

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
        {label}
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
      {label}
    </span>
  );
}
