'use client';

import { Check, ChevronDown, Eye } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { COLOR_VISION_MODES, type ColorVisionMode } from '@lib/color/colorVision';
import type { MessageKey } from '@lib/i18n/translate';

import { computeAnchoredMenuPosition } from '@/lib/browser/computeAnchoredMenuPosition';
import { useCanvasView } from '@/context/CanvasViewContext';
import { useT } from '@/context/I18nContext';

const MENU_WIDTH = 260;
const ESTIMATED_MENU_HEIGHT = 280;

/** Chooses a view-only color vision simulation for the canvas. Styled for light and dark themes. */
export function CanvasVisionSelect() {
  const t = useT();
  const { visionMode, setVisionMode } = useCanvasView();
  const active = visionMode !== 'none';

  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const measured = menuRef.current?.getBoundingClientRect();
      const height = measured?.height || ESTIMATED_MENU_HEIGHT;
      const width = Math.max(measured?.width ?? 0, MENU_WIDTH);

      setMenuPosition(
        computeAnchoredMenuPosition(trigger.getBoundingClientRect(), { width, height }),
      );
    }

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const currentLabel = active ? t(`vision.${visionMode}` as MessageKey) : t('vision.noneShort');

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={t('vision.label')}
            style={{ top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH }}
            className="fixed z-dropdown max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl border border-border bg-bg p-1.5 text-ink shadow-lg transition-colors"
          >
            <div className="space-y-0.5">
              {COLOR_VISION_MODES.map((mode) => {
                const isSelected = visionMode === mode;
                const label = mode === 'none' ? t('vision.none') : t(`vision.${mode}` as MessageKey);
                const desc = t(`vision.${mode}Desc` as MessageKey);

                return (
                  <button
                    key={mode}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setVisionMode(mode);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:bg-surface-raised ${
                      isSelected
                        ? 'bg-surface-raised font-semibold text-ink'
                        : 'text-ink hover:bg-surface-raised'
                    }`}
                  >
                    <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center text-primary">
                      {isSelected ? <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-chrome-label leading-snug">{label}</p>
                      {desc ? (
                        <p className="mt-0.5 text-chrome-caption leading-relaxed text-muted">
                          {desc}
                        </p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={t('vision.label')}
        title={t('vision.title')}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-chrome-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
          active
            ? 'border-[var(--chrome-green)] bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]'
            : 'border-line bg-transparent text-ink hover:bg-surface-raised'
        }`}
      >
        <Eye className="size-4 shrink-0" aria-hidden="true" strokeWidth={1.8} />
        <span className="max-w-[9.5rem] truncate">{currentLabel}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {menu}
    </>
  );
}
