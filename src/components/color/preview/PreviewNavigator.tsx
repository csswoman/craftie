'use client';

import type { UiLayoutModeId } from '@lib/color/layoutModes';
import {
  getPreviewFamily,
  PREVIEW_FAMILIES,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';

import { PreviewNavigatorMenu } from './PreviewNavigatorMenu';
import { ChevronDown, PreviewItemIcon } from './previewNavigatorIcons';
import { usePreviewNavigatorMenu } from './usePreviewNavigatorMenu';

export type PreviewNavigatorProps = {
  activeFamily: PreviewFamilyId;
  activeMode: UiLayoutModeId;
  onSelectUi: (mode: UiLayoutModeId) => void;
  onSelectIllustration: () => void;
};

export function PreviewNavigator({
  activeFamily,
  activeMode,
  onSelectUi,
  onSelectIllustration,
}: PreviewNavigatorProps) {
  const { open, setOpen, menuId, triggerRef, menuRef, menuPosition } = usePreviewNavigatorMenu();

  const uiFamily = getPreviewFamily('ui');
  const illustrationFamily = getPreviewFamily('illustration');

  const activeLabel =
    activeFamily === 'illustration'
      ? illustrationFamily.label
      : (uiFamily.modes.find((mode) => mode.id === activeMode)?.label ?? 'Dashboard');

  if (PREVIEW_FAMILIES.filter((family) => family.id === 'ui' || family.id === 'illustration').length <= 1) {
    return null;
  }

  return (
    <div className="relative z-dropdown w-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-border bg-bg px-3 py-2 text-left shadow-sm transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
      >
        <PreviewItemIcon
          kind={activeFamily === 'illustration' ? 'illustration' : 'ui'}
          mode={activeMode}
        />
        <span className="min-w-0 flex-1 truncate text-chrome-label font-semibold text-ink">
          {activeLabel}
        </span>
        <ChevronDown open={open} />
      </button>

      {open && menuPosition ? (
        <PreviewNavigatorMenu
          menuId={menuId}
          menuRef={menuRef}
          menuPosition={menuPosition}
          activeFamily={activeFamily}
          activeMode={activeMode}
          onSelectUi={onSelectUi}
          onSelectIllustration={onSelectIllustration}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
