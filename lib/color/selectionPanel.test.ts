import { describe, expect, it } from 'vitest';

import {
  formatGroupSelectionLabel,
  getSelectionPanelStatus,
} from './selectionPanel';
import { SELECTABLE_COLORS } from './selectableColors';

describe('selectionPanel', () => {
  it('formats group selection labels', () => {
    expect(formatGroupSelectionLabel('light-neutral', 1)).toBe('1 de 1 seleccionado');
    expect(formatGroupSelectionLabel('bold', 4)).toBe('4 de 4 seleccionados');
    expect(formatGroupSelectionLabel('dark-neutral', 2)).toBe('2 seleccionados');
  });

  it('reports ready state for a valid selection', () => {
    const porcelain = SELECTABLE_COLORS.find((color) => color.id === 'porcelain')!;
    const seaspray = SELECTABLE_COLORS.find((color) => color.id === 'seaspray')!;
    const zest = SELECTABLE_COLORS.find((color) => color.id === 'zest')!;
    const twilight = SELECTABLE_COLORS.find((color) => color.id === 'twilight')!;

    const status = getSelectionPanelStatus([porcelain, seaspray, zest, twilight]);

    expect(status.ready).toBe(true);
  });
});
