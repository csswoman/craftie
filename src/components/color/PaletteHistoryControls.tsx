'use client';

import { Redo2, Undo2 } from 'lucide-react';

import { useRolePalette } from '@/context/RolePaletteContext';
import { useUndoRedoShortcuts } from '@/lib/browser/useUndoRedoShortcuts';
import { useT, useTx } from '@/context/I18nContext';

export function PaletteHistoryControls() {
  const t = useT();
  const { canUndoEdit, canRedoEdit, undoEdit, redoEdit } = useRolePalette();

  useUndoRedoShortcuts({ onUndo: undoEdit, onRedo: redoEdit });

  return (
    <div className="flex items-center" role="group" aria-label={t('ui.PaletteHistoryControls.historial-de-ediciones')}>
      <HistoryButton
        label={t('ui.PaletteHistoryControls.deshacer')}
        shortcut="Ctrl+Z"
        disabled={!canUndoEdit}
        onClick={undoEdit}
      >
        <Undo2 aria-hidden="true" size={18} strokeWidth={2} />
      </HistoryButton>
      <HistoryButton
        label={t('ui.PaletteHistoryControls.rehacer')}
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
  const tx = useTx();
  return (
    <button
      type="button"
      title={`${label} (${shortcut})`}
      aria-label={tx(label)}
      aria-keyshortcuts={shortcut}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
    >
      {children}
    </button>
  );
}
