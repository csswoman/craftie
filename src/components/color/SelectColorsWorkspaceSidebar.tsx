'use client';

import { useEffect, useState } from 'react';

import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import {
  buildStudioToolSections,
  type StudioToolsInput,
} from '@/components/color/studioToolSections';
import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';
import {
  STUDIO_TOOL_FOCUS_EVENT,
  type StudioToolSectionFocusId,
} from '@/lib/browser/studioToolFocus';

export type SelectColorsWorkspaceSidebarProps = StudioToolsInput;

type ToolsTab = 'colors' | 'typography';

const TOOLS_TABS: { id: ToolsTab; label: string }[] = [
  { id: 'colors', label: 'Colores' },
  { id: 'typography', label: 'Tipografía' },
];

const TOOLS_TAB_IDS = TOOLS_TABS.map((tab) => tab.id);

export function SelectColorsWorkspaceSidebar(props: SelectColorsWorkspaceSidebarProps) {
  const sections = buildStudioToolSections(props, 'sidebar');
  const [activeTab, setActiveTab] = useState<ToolsTab>('colors');
  const { getTabProps } = useTabListKeyboard({
    items: TOOLS_TAB_IDS,
    activeId: activeTab,
    onActivate: setActiveTab,
  });

  const sectionById = Object.fromEntries(sections.map((section) => [section.id, section.content]));

  useEffect(() => {
    function handleToolFocus(event: Event) {
      const sectionId = (event as CustomEvent<{ sectionId: StudioToolSectionFocusId }>).detail
        ?.sectionId;

      if (!sectionId) {
        return;
      }

      setActiveTab(sectionId === 'typography' ? 'typography' : 'colors');
      window.requestAnimationFrame(() => {
        const target = sectionId === 'source'
          ? document.getElementById('generate-brand-guide')
          : document.getElementById(`tools-panel-${sectionId === 'typography' ? 'typography' : 'colors'}`);
        target?.focus();
      });
    }

    window.addEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
    return () => window.removeEventListener(STUDIO_TOOL_FOCUS_EVENT, handleToolFocus);
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <StudioToolsPanel>
        <nav
          aria-label="Secciones de herramientas"
          className="shrink-0 pb-3"
        >
          <ul
            className="flex gap-0.5 rounded-xl bg-surface-raised p-1"
            role="tablist"
          >
            {TOOLS_TABS.map((tab) => {
              const selected = activeTab === tab.id;

              return (
                <li key={tab.id} className="min-w-0 flex-1" role="presentation">
                  <button
                    type="button"
                    role="tab"
                    id={`tools-tab-${tab.id}`}
                    aria-selected={selected}
                    aria-controls={`tools-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    {...getTabProps(tab.id)}
                    className={`flex min-h-11 w-full items-center justify-center rounded-lg px-3 py-2 text-tools-body-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                      selected
                        ? 'bg-bg text-ink shadow-sm'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section
          id="tools-panel-colors"
          role="tabpanel"
          aria-labelledby="tools-tab-colors"
          hidden={activeTab !== 'colors'}
          tabIndex={activeTab === 'colors' ? 0 : undefined}
          className={
            activeTab === 'colors'
              ? 'scrollbar-chrome flex min-h-0 flex-1 flex-col gap-[var(--chrome-space-3)] overflow-y-auto'
              : 'hidden'
          }
        >
          <div className="shrink-0">{sectionById.source}</div>
          <div className="shrink-0">{sectionById.adjustments}</div>
        </section>

        <section
          id="tools-panel-typography"
          role="tabpanel"
          aria-labelledby="tools-tab-typography"
          hidden={activeTab !== 'typography'}
          tabIndex={activeTab === 'typography' ? 0 : undefined}
          className={
            activeTab === 'typography'
              ? 'scrollbar-chrome min-h-0 flex-1 overflow-x-hidden overflow-y-auto'
              : 'hidden'
          }
        >
          <div className="min-w-0 max-w-full">{sectionById.typography}</div>
        </section>
      </StudioToolsPanel>
    </div>
  );
}

export function useSelectColorsWorkspaceToolSections(
  props: SelectColorsWorkspaceSidebarProps,
  target: 'sidebar' | 'mobile' = 'sidebar',
) {
  return buildStudioToolSections(props, target);
}
