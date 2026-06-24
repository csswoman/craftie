import {
  validateSelection,
  type ColorGroupId,
  type SelectableColor,
} from './selectableColors';

const BOLD_MAX = 4;

export function countSelectedInGroup(
  selected: SelectableColor[],
  group: ColorGroupId,
): number {
  return selected.filter((color) => color.group === group).length;
}

export function formatGroupSelectionLabel(group: ColorGroupId, count: number): string {
  const word = count === 1 ? 'seleccionado' : 'seleccionados';

  if (group === 'bold') {
    return `${count} de ${BOLD_MAX} ${word}`;
  }

  if (count === 1 && (group === 'light-neutral' || group === 'dark-neutral')) {
    return `${count} de 1 ${word}`;
  }

  return `${count} ${word}`;
}

export type SelectionPanelStatus = {
  ready: boolean;
  message: string;
};

export function getSelectionPanelStatus(selected: SelectableColor[]): SelectionPanelStatus {
  const validation = validateSelection(selected);

  if (validation.ok) {
    return { ready: true, message: 'Paleta lista para generar.' };
  }

  return { ready: false, message: validation.error };
}

export function formatExtractedColorCount(count: number): string {
  return `${count} color${count === 1 ? '' : 'es'} extraído${count === 1 ? '' : 's'}`;
}
