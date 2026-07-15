import { describe, expect, it } from 'vitest';

import {
  assignDataSeriesColor,
  clearDataSeriesSlot,
  countDataSeriesColors,
  createDataSeriesState,
  selectDataSeriesSlot,
} from './dataSeriesState';

describe('data series state', () => {
  it('assigns the active slot and advances to the first empty slot', () => {
    const state = createDataSeriesState([null, null, null]);
    const assigned = assignDataSeriesColor(state, '#112233');

    expect(assigned).toEqual({
      slots: ['#112233', null, null],
      activeSlot: 1,
    });
    expect(countDataSeriesColors(assigned.slots)).toBe(1);
  });

  it('reassigns an occupied slot without changing the filled count', () => {
    const state = selectDataSeriesSlot(
      createDataSeriesState(['#111111', '#222222', null]),
      0,
    );
    const assigned = assignDataSeriesColor(state, '#333333');

    expect(assigned.slots).toEqual(['#333333', '#222222', null]);
    expect(assigned.activeSlot).toBe(2);
    expect(countDataSeriesColors(assigned.slots)).toBe(2);
  });

  it('clears a slot, lowers the count, and focuses the cleared slot', () => {
    const state = createDataSeriesState(['#111111', '#222222', '#333333'], 2);
    const cleared = clearDataSeriesSlot(state, 1);

    expect(cleared).toEqual({
      slots: ['#111111', null, '#333333'],
      activeSlot: 1,
    });
    expect(countDataSeriesColors(cleared.slots)).toBe(2);
  });
});
