'use client';

import type { ReactNode } from 'react';

import { InspirationDrawer } from '@/components/color/InspirationDrawer';

export type ToolSection = 'colors' | 'generate';

const SECTIONS: { id: ToolSection; label: string }[] = [
  { id: 'colors', label: 'Selección' },
  { id: 'generate', label: 'Generar paleta' },
];

export type ToolsSidebarProps = {
  activeSection: ToolSection;
  onSectionChange: (section: ToolSection) => void;
  colorsPanel: ReactNode;
  generatePanel: ReactNode;
  inspirationPanel: ReactNode;
  inspirationDefaultOpen?: boolean;
};

export function ToolsSidebar({
  activeSection,
  onSectionChange,
  colorsPanel,
  generatePanel,
  inspirationPanel,
  inspirationDefaultOpen = false,
}: ToolsSidebarProps) {
  const panels: Record<ToolSection, ReactNode> = {
    colors: colorsPanel,
    generate: generatePanel,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Pasos para crear la paleta" className="shrink-0 border-b border-border px-3 pt-3">
        <ul className="flex gap-1" role="tablist">
          {SECTIONS.map((section) => (
            <li key={section.id} role="presentation">
              <button
                type="button"
                role="tab"
                id={`tool-tab-${section.id}`}
                aria-selected={activeSection === section.id}
                aria-controls={`tool-panel-${section.id}`}
                onClick={() => onSectionChange(section.id)}
                className={`rounded-t-md px-3 py-2 text-[0.8125rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
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
            id={`tool-panel-${section.id}`}
            role="tabpanel"
            aria-labelledby={`tool-tab-${section.id}`}
            hidden={activeSection !== section.id}
            className="p-4"
          >
            {panels[section.id]}
          </section>
        ))}
      </div>

      <InspirationDrawer
        key={inspirationDefaultOpen ? 'inspire-open' : 'inspire-closed'}
        defaultOpen={inspirationDefaultOpen}
      >
        {inspirationPanel}
      </InspirationDrawer>
    </div>
  );
}
