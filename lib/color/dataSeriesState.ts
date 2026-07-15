export type DataSeriesState = {
  slots: (string | null)[];
  activeSlot: number;
};

export function createDataSeriesState(
  slots: (string | null)[],
  activeSlot = firstEmptySlot(slots),
): DataSeriesState {
  return {
    slots: [...slots],
    activeSlot: normalizeActiveSlot(activeSlot, slots.length),
  };
}

export function assignDataSeriesColor(
  state: DataSeriesState,
  hex: string,
): DataSeriesState {
  const slots = [...state.slots];
  slots[state.activeSlot] = hex;
  const nextEmpty = firstEmptySlot(slots);

  return {
    slots,
    activeSlot: nextEmpty === -1 ? state.activeSlot : nextEmpty,
  };
}

export function clearDataSeriesSlot(
  state: DataSeriesState,
  slot: number,
): DataSeriesState {
  const activeSlot = normalizeActiveSlot(slot, state.slots.length);
  const slots = [...state.slots];
  slots[activeSlot] = null;

  return { slots, activeSlot };
}

export function selectDataSeriesSlot(
  state: DataSeriesState,
  slot: number,
): DataSeriesState {
  return {
    ...state,
    activeSlot: normalizeActiveSlot(slot, state.slots.length),
  };
}

export function countDataSeriesColors(slots: (string | null)[]): number {
  return slots.filter(Boolean).length;
}

export function firstEmptySlot(slots: (string | null)[]): number {
  return slots.findIndex((slot) => slot === null);
}

function normalizeActiveSlot(activeSlot: number, slotCount: number): number {
  if (slotCount === 0) return 0;
  return Math.min(Math.max(activeSlot, 0), slotCount - 1);
}
