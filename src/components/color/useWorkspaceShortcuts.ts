'use client';

import { useEffect } from 'react';

import {
  isGenerateShortcut,
  shouldIgnoreStudioShortcut,
} from '@lib/studio/studioShortcuts';

export function useWorkspaceShortcuts({
  handleGenerate,
  isReviewPhase,
  selectionReady,
}: {
  handleGenerate: () => void;
  isReviewPhase: boolean;
  selectionReady: boolean;
}) {
  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
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
  }, [handleGenerate, isReviewPhase, selectionReady]);
}
