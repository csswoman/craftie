import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';

import { INITIAL_EDITABLE, type EditablePaletteState } from '@lib/color/editablePalette';
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from '@lib/utils/historyStack';

/** Undo/redo history of the editable palette state. */
export function useEditHistory(onTimeTravel: (present: EditablePaletteState) => void) {
  const [editHistory, setEditHistory] = useState(() => createHistory(INITIAL_EDITABLE));

  const commitEdit = useCallback(
    (updater: (current: EditablePaletteState) => EditablePaletteState) => {
      setEditHistory((history) => pushHistory(history, updater(history.present)));
    },
    [],
  );

  const resetEditable = useCallback((next: Partial<EditablePaletteState> = {}) => {
    setEditHistory(createHistory({ ...INITIAL_EDITABLE, ...next }));
  }, []);

  const undoEdit = useCallback(() => {
    if (!canUndo(editHistory)) return;
    const next = undoHistory(editHistory);
    setEditHistory(next);
    onTimeTravel(next.present);
  }, [editHistory, onTimeTravel]);

  const redoEdit = useCallback(() => {
    if (!canRedo(editHistory)) return;
    const next = redoHistory(editHistory);
    setEditHistory(next);
    onTimeTravel(next.present);
  }, [editHistory, onTimeTravel]);

  return {
    editable: editHistory.present,
    setEditHistory: setEditHistory as Dispatch<SetStateAction<typeof editHistory>>,
    commitEdit,
    resetEditable,
    undoEdit,
    redoEdit,
    canUndoEdit: canUndo(editHistory),
    canRedoEdit: canRedo(editHistory),
  };
}
