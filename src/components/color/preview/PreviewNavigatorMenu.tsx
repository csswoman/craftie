'use client';

import type { ReactNode, RefObject } from 'react';

import type { UiLayoutModeId } from '@lib/color/layoutModes';
import {
  getPreviewFamily,
  type PreviewFamilyId,
} from '@lib/color/previewFamilies';

import { PreviewItemIcon } from './previewNavigatorIcons';

type PreviewNavigatorMenuProps = {
  menuId: string;
  menuRef: RefObject<HTMLDivElement | null>;
  menuPosition: { top: string; left: string };
  activeFamily: PreviewFamilyId;
  activeMode: UiLayoutModeId;
  onSelectUi: (mode: UiLayoutModeId) => void;
  onSelectIllustration: () => void;
  onClose: () => void;
};

export function PreviewNavigatorMenu({
  menuId,
  menuRef,
  menuPosition,
  activeFamily,
  activeMode,
  onSelectUi,
  onSelectIllustration,
  onClose,
}: PreviewNavigatorMenuProps) {
  const uiFamily = getPreviewFamily('ui');
  const illustrationFamily = getPreviewFamily('illustration');
  const illustrationSelectable =
    illustrationFamily.id === 'illustration' && illustrationFamily.styles.length > 0;

  return (
    <div
      ref={menuRef}
      id={menuId}
      role="menu"
      className="fixed z-dropdown w-[min(100vw-2rem,320px)] rounded-xl border border-border bg-bg p-2"
      style={{ ...menuPosition, boxShadow: 'var(--shadow-float)' }}
    >
      <MenuSection title="Maquetas UI">
        <ul className="space-y-0.5">
          {uiFamily.modes.map((mode) => {
            const selected = activeFamily === 'ui' && activeMode === mode.id;

            return (
              <li key={mode.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelectUi(mode.id);
                    onClose();
                  }}
                  className={menuItemClass(selected)}
                >
                  <PreviewItemIcon kind="ui" mode={mode.id} />
                  <span className="min-w-0">
                    <span className="block text-chrome-label font-semibold">{mode.label}</span>
                    <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                      {mode.description}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </MenuSection>

      {illustrationSelectable ? (
        <MenuSection title="Ilustración">
          <ul className="space-y-0.5">
            {illustrationFamily.styles.map((style) => {
              const selected = activeFamily === 'illustration';

              return (
                <li key={style.id} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onSelectIllustration();
                      onClose();
                    }}
                    className={menuItemClass(selected)}
                  >
                    <PreviewItemIcon kind="illustration" />
                    <span className="min-w-0">
                      <span className="block text-chrome-label font-semibold">{style.label}</span>
                      <span className="mt-0.5 block text-chrome-caption leading-snug text-muted">
                        {style.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </MenuSection>
      ) : null}
    </div>
  );
}

function MenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-2.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-muted">
        {title}
      </p>
      {children}
    </div>
  );
}

function menuItemClass(selected: boolean) {
  return `flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
    selected ? 'bg-surface-raised text-ink' : 'text-ink hover:bg-surface'
  }`;
}
