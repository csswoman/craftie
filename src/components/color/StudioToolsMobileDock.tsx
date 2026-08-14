'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { PALETTE_ROLE_ORDER } from '@lib/color/rolePalette';
import type { CanvasViewId } from '@lib/color/canvasViews';

import { CanvasViewPickerList } from '@/components/color/CanvasViewPickerList';
import { StudioToolDockIcon } from '@/components/color/studioToolDockIcons';
import type { StudioToolSection, StudioToolSectionId } from '@/components/color/studioToolSections';
import { useCanvasViewOptional } from '@/context/CanvasViewContext';
import { useRolePaletteOptional } from '@/context/RolePaletteContext';
import { useDialogAccessibility } from '@/lib/browser/useDialogAccessibility';
import {
  STUDIO_TOOL_FOCUS_EVENT,
  type StudioToolSectionFocusId,
} from '@/lib/browser/studioToolFocus';

export type StudioToolsMobileDockProps = {
  sections: StudioToolSection[];
};

export function StudioToolsMobileDock({ sections }: StudioToolsMobileDockProps) {
  const canvasView = useCanvasViewOptional();
  const rolePalette = useRolePaletteOptional();
  const [activeSectionId, setActiveSectionId] = useState<StudioToolSectionId | null>(null);
  const sheetRef = useRef<HTMLElement>(null);

  const livePalette = rolePalette?.previewRolePalette ?? rolePalette?.rolePalette;
  const hasPalette = livePalette !== null && livePalette !== undefined;

  const palettePreview = useMemo(() => {
    if (!livePalette) return [] as string[];
    return PALETTE_ROLE_ORDER.map((role) => livePalette[role].hex);
  }, [livePalette]);

  const dockSections = useMemo(() => {
    if (!canvasView || !hasPalette) return sections;
    const viewSection: StudioToolSection = {
      id: 'view',
      label: 'Vista',
      content: null,
    };
    return [...sections, viewSection];
  }, [canvasView, hasPalette, sections]);

  const activeSection = dockSections.find((section) => section.id === activeSectionId) ?? null;
  const sheetOpen = activeSection !== null;

  const closeSheet = useCallback(() => {
    setActiveSectionId(null);
  }, []);

  const handleSelectView = useCallback(
    (view: CanvasViewId) => {
      canvasView?.selectView(view);
      setActiveSectionId(null);
    },
    [canvasView],
  );

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

      if (!sectionId || !dockSections.some((section) => section.id === sectionId)) {
        return;
      }

      setActiveSectionId(sectionId);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-tools-sheet-close]')?.focus();
      });
    }

    window.addEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
    return () => window.removeEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
  }, [dockSections]);

  function handleSectionPress(sectionId: StudioToolSectionId) {
    setActiveSectionId((current) => (current === sectionId ? null : sectionId));
  }

  // Image sheet is short; the dock tab already names the section.
  const showSheetTitle = activeSection !== null && activeSection.id !== 'image';
  const sheetTitle =
    activeSection?.id === 'view' ? 'Vistas del lienzo' : (activeSection?.label ?? '');
  const sheetLabel =
    activeSection?.id === 'view' ? 'Vistas del lienzo' : (activeSection?.label ?? 'Herramientas');

  return (
    <>
      {sheetOpen ? (
        <button
          type="button"
          aria-label="Cerrar herramientas"
          className="z-modal-backdrop fixed inset-0 bg-forest-darker/45 backdrop-blur-[2px] transition-[opacity,backdrop-filter] motion-reduce:backdrop-blur-none motion-reduce:transition-none lg:hidden"
          onClick={closeSheet}
        />
      ) : null}

      <div
        className="z-modal fixed inset-x-0 bottom-0 flex flex-col lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {sheetOpen && activeSection ? (
          <section
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={sheetLabel}
            className="flex max-h-[min(58vh,28rem)] min-h-0 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-border bg-bg shadow-[0_-8px_32px_rgb(15_43_30/18%)] motion-reduce:transition-none"
          >
            <div
              className={`flex shrink-0 items-center gap-3 px-2 ${
                showSheetTitle
                  ? 'justify-between border-b border-border/70 px-4 py-2.5'
                  : 'justify-end py-1'
              }`}
            >
              {showSheetTitle ? (
                <p className="min-w-0 truncate text-tools-section font-semibold text-ink">
                  {sheetTitle}
                </p>
              ) : null}
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
            <div
              className={`studio-tools-panel scrollbar-chrome min-h-0 flex-1 overflow-y-auto px-(--chrome-space-3) ${
                activeSection.id === 'image' ? 'pb-(--chrome-space-3) pt-1' : 'p-(--chrome-space-3)'
              }`}
            >
              {activeSection.id === 'view' && canvasView ? (
                <CanvasViewPickerList
                  activeId={canvasView.activeView}
                  palette={palettePreview}
                  onSelect={handleSelectView}
                />
              ) : (
                activeSection.content
              )}
            </div>
          </section>
        ) : null}

        <nav
          aria-label="Herramientas del estudio"
          className="border-t border-border bg-bg"
        >
          <div className="flex items-stretch gap-1 px-2 py-2">
            {dockSections.map((section) => (
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
          ? 'bg-(--chrome-green-soft) text-ink'
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
