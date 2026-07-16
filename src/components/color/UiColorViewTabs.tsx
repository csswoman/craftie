'use client';

export const UI_COLOR_VIEWS = ['system', 'data'] as const;
export type UiColorView = (typeof UI_COLOR_VIEWS)[number];

export function UiColorViewTabs({
  activeView,
  getTabProps,
  onChange,
}: {
  activeView: UiColorView;
  getTabProps: (id: UiColorView) => React.ButtonHTMLAttributes<HTMLButtonElement>;
  onChange: (view: UiColorView) => void;
}) {
  return (
    <div className="flex items-center gap-5 border-b border-line-soft" role="tablist" aria-label="Vistas de color">
      {UI_COLOR_VIEWS.map((view) => {
        const selected = activeView === view;
        return (
          <button
            key={view}
            type="button"
            role="tab"
            id={`ui-color-tab-${view}`}
            aria-controls={`ui-color-panel-${view}`}
            aria-selected={selected}
            onClick={() => onChange(view)}
            {...getTabProps(view)}
            className={`relative min-h-10 px-0 pb-2.5 pt-0.5 text-tools-tab font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 ${selected ? 'text-ink after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-sm after:bg-forest after:content-[""]' : 'text-muted hover:text-ink'}`}
          >
            {view === 'system' ? 'Sistema' : 'Acentos'}
          </button>
        );
      })}
    </div>
  );
}
