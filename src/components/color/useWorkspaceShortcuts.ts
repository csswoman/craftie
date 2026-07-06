'use client';

import { useEffect } from 'react';

import {
  isGenerateShortcut,
  isShortcutsHelpShortcut,
  shouldIgnoreStudioShortcut,
} from '@lib/studio/studioShortcuts';

import type { StudioShortcutsHelpHandle } from '@/components/layout/StudioShortcutsHelp';

export function useWorkspaceShortcuts({
  handleGenerate,
  isReviewPhase,
  selectionReady,
  shortcutsRef,
}: {
  handleGenerate: () => void;
  isReviewPhase: boolean;
  selectionReady: boolean;
  shortcutsRef: React.RefObject<StudioShortcutsHelpHandle | null>;
}) {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (isShortcutsHelpShortcut(event)) {
        event.preventDefault();
        shortcutsRef.current?.open();
        return;
      }

      if (isReviewPhase || !selectionReady) {
        return;
      }

      if (!isGenerateShortcut(event) || shouldIgnoreStudioShortcut(event.target)) {
        return;
      }

      event.preventDefault();
      handleGenerate();
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [handleGenerate, isReviewPhase, selectionReady, shortcutsRef]);
}
