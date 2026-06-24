import { describe, expect, it } from 'vitest';

import { getActiveStudioFlowStep } from './studioFlow';

describe('getActiveStudioFlowStep', () => {
  it('starts at inspire with no selection', () => {
    expect(
      getActiveStudioFlowStep({
        hasGeneratedPalette: false,
        hasSelection: false,
        selectionReady: false,
      }),
    ).toBe('inspire');
  });

  it('moves to adjust when colors are selected', () => {
    expect(
      getActiveStudioFlowStep({
        hasGeneratedPalette: false,
        hasSelection: true,
        selectionReady: false,
      }),
    ).toBe('adjust');
  });

  it('moves to generate when selection is valid', () => {
    expect(
      getActiveStudioFlowStep({
        hasGeneratedPalette: false,
        hasSelection: true,
        selectionReady: true,
      }),
    ).toBe('generate');
  });

  it('ends at review after palette generation', () => {
    expect(
      getActiveStudioFlowStep({
        hasGeneratedPalette: true,
        hasSelection: true,
        selectionReady: true,
      }),
    ).toBe('review');
  });
});
