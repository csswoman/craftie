'use client';

import { Redo2, Undo2 } from 'lucide-react';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useUndoRedoShortcuts } from '@/lib/browser/useUndoRedoShortcuts';

export function PaletteHistoryControls() {
  const { canUndoEdit, canRedoEdit, undoEdit, redoEdit } = useRolePalette();

  useUndoRedoShortcuts({ onUndo: undoEdit, onRedo: redoEdit });

  return (
    <div className="flex items-center" role="group" aria-label="Historial de ediciones">
      <HistoryButton
        label="Deshacer"
        shortcut="Ctrl+Z"
        disabled={!canUndoEdit}
        onClick={undoEdit}
      >
        <Undo2 aria-hidden="true" size={18} strokeWidth={2} />
      </HistoryButton>
      <HistoryButton
        label="Rehacer"
        shortcut="Ctrl+Shift+Z"
        disabled={!canRedoEdit}
        onClick={redoEdit}
      >
        <Redo2 aria-hidden="true" size={18} strokeWidth={2} />
      </HistoryButton>
    </div>
  );
}

function HistoryButton({
  label,
  shortcut,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={`${label} (${shortcut})`}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      {children}
    </button>
  );
}
