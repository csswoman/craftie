'use client';

import { Check } from 'lucide-react';
import {
  useEffect,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import {
  CANVAS_VIEWS,
  CANVAS_VIEW_GROUP_LABEL,
  type CanvasViewGroup,
  type CanvasViewId,
} from '@lib/color/canvasViews';

import { ViewThumbnail } from './ViewThumbnail';

const GROUPS: CanvasViewGroup[] = ['mode', 'system', 'layout', 'preview'];

export function CanvasViewPickerList({
  activeId,
  palette,
  onSelect,
  autoFocusActive = false,
}: {
  activeId: CanvasViewId;
  palette: string[];
  onSelect: (id: CanvasViewId) => void;
  autoFocusActive?: boolean;
}) {
  const itemRefs = useRef<Record<CanvasViewId, HTMLButtonElement | null>>(
    {} as Record<CanvasViewId, HTMLButtonElement | null>,
  );

  useEffect(() => {
    if (autoFocusActive) itemRefs.current[activeId]?.focus();
  }, [autoFocusActive, activeId]);

  function handleItemKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, id: CanvasViewId) {
    const index = CANVAS_VIEWS.findIndex((view) => view.id === id);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex =
        (index + (event.key === 'ArrowDown' ? 1 : -1) + CANVAS_VIEWS.length) % CANVAS_VIEWS.length;
      itemRefs.current[CANVAS_VIEWS[nextIndex]!.id]?.focus();
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = event.key === 'Home' ? 0 : CANVAS_VIEWS.length - 1;
      itemRefs.current[CANVAS_VIEWS[nextIndex]!.id]?.focus();
    }
  }

  return (
    <div role="menu" aria-label="Vistas del lienzo">
      {GROUPS.map((group) => (
        <div key={group} className={group === 'layout' ? 'mt-1.5' : undefined}>
          <p className="px-2.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-muted">
            {CANVAS_VIEW_GROUP_LABEL[group]}
          </p>
          {CANVAS_VIEWS.filter((view) => view.group === group).map((view) => {
            const selected = activeId === view.id;
            return (
              <button
                key={view.id}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                ref={(element) => {
                  itemRefs.current[view.id] = element;
                }}
                tabIndex={selected ? 0 : -1}
                onKeyDown={(event) => handleItemKeyDown(event, view.id)}
                onClick={() => onSelect(view.id)}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  selected ? 'bg-primary/10 text-primary' : 'text-ink hover:bg-surface-raised'
                }`}
              >
                <ViewThumbnail id={view.id} palette={palette} />
                <span className="min-w-0 flex-1">
                  <span className="block text-chrome-label font-semibold leading-tight">
                    {view.id === 'colors' ? 'UI' : view.name}
                  </span>
                  <span className="mt-0.5 block truncate text-chrome-caption text-muted">
                    {view.description}
                  </span>
                </span>
                {selected ? (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
