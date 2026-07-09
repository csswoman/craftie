'use client';

import type { ReactNode } from 'react';

import { useTabListKeyboard } from '@/lib/browser/useTabListKeyboard';

export type InspectorSection = 'accessibility' | 'layouts';

const SECTIONS: { id: InspectorSection; label: string }[] = [
  { id: 'accessibility', label: 'Contraste' },
  { id: 'layouts', label: 'Vistas previas' },
];

const SECTION_IDS = SECTIONS.map((section) => section.id);

export type InspectorPanelProps = {
  activeSection: InspectorSection;
  onSectionChange: (section: InspectorSection) => void;
  accessibilityPanel: ReactNode;
  layoutsPanel: ReactNode;
};

export function InspectorPanel({
  activeSection,
  onSectionChange,
  accessibilityPanel,
  layoutsPanel,
}: InspectorPanelProps) {
  const { getTabProps } = useTabListKeyboard({
    items: SECTION_IDS,
    activeId: activeSection,
    onActivate: onSectionChange,
  });

  const panels: Record<InspectorSection, ReactNode> = {
    accessibility: accessibilityPanel,
    layouts: layoutsPanel,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Revisión de paleta" className="shrink-0 border-b border-border px-4 pt-3">
        <ul className="flex flex-wrap gap-1.5" role="tablist">
          {SECTIONS.map((section) => (
            <li key={section.id} role="presentation">
              <button
                type="button"
                role="tab"
                id={`inspector-tab-${section.id}`}
                aria-selected={activeSection === section.id}
                aria-controls={`inspector-panel-${section.id}`}
                onClick={() => onSectionChange(section.id)}
                {...getTabProps(section.id)}
                className={`rounded-t-md px-3 py-2 text-chrome-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  activeSection === section.id
                    ? 'bg-bg text-ink'
                    : 'text-muted hover:bg-surface-raised hover:text-ink'
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={`inspector-panel-${section.id}`}
            role="tabpanel"
            aria-labelledby={`inspector-tab-${section.id}`}
            hidden={activeSection !== section.id}
            tabIndex={activeSection === section.id ? 0 : undefined}
            className="p-4"
          >
            {panels[section.id]}
          </section>
        ))}
      </div>
    </div>
  );
}
