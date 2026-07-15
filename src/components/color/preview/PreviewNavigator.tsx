'use client';

import type { UiLayoutModeId } from '@lib/color/layoutModes';
import { getPreviewFamily, type PreviewFamilyId } from '@lib/color/previewFamilies';

import { PreviewItemIcon } from './previewNavigatorIcons';

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
  const uiFamily = getPreviewFamily('ui');
  const illustrationFamily = getPreviewFamily('illustration');
  const illustrationSelectable =
    illustrationFamily.id === 'illustration' && illustrationFamily.styles.length > 0;

  return (
    <nav aria-label="Elegir maqueta" className="w-full">
      <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {uiFamily.modes.map((mode) => {
          const selected = activeFamily === 'ui' && activeMode === mode.id;

          return (
            <li key={mode.id} className="min-w-[8.5rem] flex-1">
              <button
                type="button"
                aria-current={selected ? 'page' : undefined}
                onClick={() => onSelectUi(mode.id)}
                className={`flex min-h-14 w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  selected
                    ? 'border-primary bg-bg text-ink'
                    : 'border-border bg-surface text-muted hover:bg-bg hover:text-ink'
                }`}
              >
                <PreviewItemIcon kind="ui" mode={mode.id} />
                <span className="truncate text-chrome-caption font-semibold">{mode.label}</span>
              </button>
            </li>
          );
        })}

        {illustrationSelectable ? (
          <li className="min-w-[8.5rem] flex-1">
            <button
              type="button"
              aria-current={activeFamily === 'illustration' ? 'page' : undefined}
              onClick={onSelectIllustration}
              className={`flex min-h-14 w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                activeFamily === 'illustration'
                  ? 'border-primary bg-bg text-ink'
                  : 'border-border bg-surface text-muted hover:bg-bg hover:text-ink'
              }`}
            >
              <PreviewItemIcon kind="illustration" />
              <span className="truncate text-chrome-caption font-semibold">
                {illustrationFamily.label}
              </span>
            </button>
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
