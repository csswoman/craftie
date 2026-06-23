'use client';

import type { ReactNode } from 'react';

export type InspectorSection = 'accessibility' | 'layouts';

const SECTIONS: { id: InspectorSection; label: string }[] = [
  { id: 'accessibility', label: 'Contraste' },
  { id: 'layouts', label: 'Maquetas' },
];

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
  const panels: Record<InspectorSection, ReactNode> = {
    accessibility: accessibilityPanel,
    layouts: layoutsPanel,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav aria-label="Revisión de paleta" className="shrink-0 border-b border-border px-3 pt-3">
        <ul className="flex flex-wrap gap-1" role="tablist">
          {SECTIONS.map((section) => (
            <li key={section.id} role="presentation">
              <button
                type="button"
                role="tab"
                id={`inspector-tab-${section.id}`}
                aria-selected={activeSection === section.id}
                aria-controls={`inspector-panel-${section.id}`}
                onClick={() => onSectionChange(section.id)}
                className={`rounded-t-md px-2.5 py-2 text-[0.75rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
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
            className="p-4"
          >
            {panels[section.id]}
          </section>
        ))}
      </div>
    </div>
  );
}

function LayoutsPlaceholder() {
  return (
    <div className="rounded-md border border-dashed border-border bg-bg px-4 py-10 text-center">
      <p className="text-[0.9375rem] font-semibold text-ink">Maquetas en tiempo real</p>
      <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
        Próximamente: vistas previas básicas (dashboard, marca, ilustración) con tu paleta y
        tipografía aplicadas al instante.
      </p>
    </div>
  );
}

export { LayoutsPlaceholder };
