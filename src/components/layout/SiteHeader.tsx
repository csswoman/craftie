import Link from 'next/link';

export type WorkspaceTab = 'colors' | 'typography';

interface SiteHeaderProps {
  activePath?: '/' | '/select-colors';
  compact?: boolean;
  workspaceTab?: WorkspaceTab;
  onWorkspaceTabChange?: (tab: WorkspaceTab) => void;
}

const WORKSPACE_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: 'colors', label: 'Colores' },
  { id: 'typography', label: 'Tipografía' },
];

function tabClassName(active: boolean) {
  return `rounded-md px-3 py-2 text-[0.875rem] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
    active
      ? 'text-ink underline decoration-primary decoration-2 underline-offset-4'
      : 'text-muted hover:text-ink'
  }`;
}

export function SiteHeader({
  activePath = '/',
  compact = false,
  workspaceTab,
  onWorkspaceTabChange,
}: SiteHeaderProps) {
  const isWorkspace = workspaceTab !== undefined && onWorkspaceTabChange !== undefined;

  return (
    <header className="shrink-0 border-b border-border bg-surface">
      <div
        className={`mx-auto flex max-w-none items-center justify-between gap-4 px-4 ${
          compact ? 'py-2.5' : 'px-6 py-4'
        }`}
      >
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          Palette &amp; Type
        </Link>

        <nav aria-label="Principal">
          {isWorkspace ? (
            <ul className="flex gap-1" role="tablist">
              {WORKSPACE_TABS.map((tab) => (
                <li key={tab.id} role="presentation">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceTab === tab.id}
                    onClick={() => onWorkspaceTabChange(tab.id)}
                    className={tabClassName(workspaceTab === tab.id)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Link href="/select-colors" className={tabClassName(activePath === '/select-colors')}>
              Colores
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
