export type StudioFlowStepId = 'inspire' | 'adjust' | 'generate' | 'review';

export type StudioFlowStep = {
  id: StudioFlowStepId;
  label: string;
  hint: string;
};

export const STUDIO_FLOW_STEPS: StudioFlowStep[] = [
  {
    id: 'inspire',
    label: 'Elegir inspiración',
    hint: 'Sube una imagen o elige un estilo curado.',
  },
  {
    id: 'adjust',
    label: 'Ajustar roles',
    hint: 'Toca un rol en la paleta para editar su color y contraste.',
  },
  {
    id: 'generate',
    label: 'Generar guía',
    hint: 'Crea la guía de marca para desbloquear la exportación.',
  },
  {
    id: 'review',
    label: 'Revisar y exportar',
    hint: 'Revisa contraste y tipografía, luego exporta.',
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
