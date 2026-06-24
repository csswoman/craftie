export type StudioFlowStepId = 'inspire' | 'adjust' | 'generate' | 'review';

export type StudioFlowStep = {
  id: StudioFlowStepId;
  label: string;
  hint: string;
};

export const STUDIO_FLOW_STEPS: StudioFlowStep[] = [
  {
    id: 'inspire',
    label: 'Inspírate',
    hint: 'Elige un estilo curado o sube una imagen.',
  },
  {
    id: 'adjust',
    label: 'Ajusta',
    hint: 'Refina la selección por grupo en el panel derecho.',
  },
  {
    id: 'generate',
    label: 'Genera',
    hint: 'Calcula roles semánticos y abre la guía.',
  },
  {
    id: 'review',
    label: 'Revisa',
    hint: 'Explora contraste, tipografía y mockups.',
  },
];

export function getActiveStudioFlowStep(input: {
  hasGeneratedPalette: boolean;
  hasSelection: boolean;
  selectionReady: boolean;
}): StudioFlowStepId {
  if (input.hasGeneratedPalette) {
    return 'review';
  }

  if (input.selectionReady) {
    return 'generate';
  }

  if (input.hasSelection) {
    return 'adjust';
  }

  return 'inspire';
}

export function getStudioFlowStepIndex(stepId: StudioFlowStepId): number {
  return STUDIO_FLOW_STEPS.findIndex((step) => step.id === stepId);
}
