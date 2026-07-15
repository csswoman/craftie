'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { StudioToolDockIcon } from '@/components/color/studioToolDockIcons';
import type { StudioToolSection, StudioToolSectionId } from '@/components/color/studioToolSections';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import {
  STUDIO_TOOL_FOCUS_EVENT,
  type StudioToolSectionFocusId,
} from '@/lib/browser/studioToolFocus';

export type StudioToolsMobileDockProps = {
  sections: StudioToolSection[];
};

export function StudioToolsMobileDock({ sections }: StudioToolsMobileDockProps) {
  const [activeSectionId, setActiveSectionId] = useState<StudioToolSectionId | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const activeSection = sections.find((section) => section.id === activeSectionId) ?? null;
  const sheetOpen = activeSection !== null;

  const closeSheet = useCallback(() => {
    setActiveSectionId(null);
  }, []);

  useDialogAccessibility({
    open: sheetOpen,
    dialogRef: sheetRef,
    onClose: closeSheet,
    initialFocusSelector: '[data-tools-sheet-close]',
    lockScroll: false,
  });

  useEffect(() => {
    function handleToolFocus(event: Event) {
      const sectionId = (event as CustomEvent<{ sectionId: StudioToolSectionFocusId }>).detail
        ?.sectionId;

      if (!sectionId || !sections.some((section) => section.id === sectionId)) {
        return;
      }

      setActiveSectionId(sectionId);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-tools-sheet-close]')?.focus();
      });
    }

    window.addEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
    return () => window.removeEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
  }, [sections]);

  function handleSectionPress(sectionId: StudioToolSectionId) {
    setActiveSectionId((current) => (current === sectionId ? null : sectionId));
  }

  return (
    <>
      {sheetOpen ? (
        <button
          type="button"
          aria-label="Cerrar herramientas"
          className="fixed inset-0 z-[25] bg-ink/20 motion-reduce:transition-none xl:hidden"
          onClick={closeSheet}
        />
      ) : null}

      <div
        className="fixed inset-x-0 bottom-0 z-[26] flex flex-col xl:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {sheetOpen && activeSection ? (
          <section
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={activeSection.label}
            className="flex max-h-[min(58vh,28rem)] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-bg shadow-[var(--shadow-float)] motion-reduce:transition-none"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
              <p className="min-w-0 truncate text-tools-section font-semibold text-ink">
                {activeSection.label}
              </p>
              <button
                type="button"
                data-tools-sheet-close=""
                aria-label="Cerrar panel"
                onClick={closeSheet}
                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="studio-tools-panel scrollbar-chrome min-h-0 flex-1 overflow-y-auto p-[var(--chrome-space-3)]">
              {activeSection.content}
            </div>
          </section>
        ) : null}

        <nav
          aria-label="Herramientas del estudio"
          className="border-t border-border bg-bg/95 backdrop-blur-sm"
        >
          <div className="flex items-stretch gap-1 px-2 py-2">
            {sections.map((section) => (
              <DockTab
                key={section.id}
                sectionId={section.id}
                label={section.label}
                active={activeSectionId === section.id}
                onPress={() => handleSectionPress(section.id)}
              />
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

function DockTab({
  sectionId,
  label,
  active,
  onPress,
}: {
  sectionId: StudioToolSectionId;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onPress}
      className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
        active
          ? 'bg-[var(--chrome-green-soft)] text-ink'
          : 'text-muted hover:bg-surface-raised hover:text-ink'
      }`}
    >
      <StudioToolDockIcon id={sectionId} />
      <span className="truncate text-[0.6875rem] font-semibold leading-tight">{label}</span>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <path
        d="M4 4l8 8M12 4l-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
