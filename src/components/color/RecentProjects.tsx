'use client';

import type { LocalProject } from '@lib/studio/projectModel';

const MAX_RECENT = 3;

export function RecentProjects({
  projects,
  onOpen,
}: {
  projects: LocalProject[];
  onOpen: (project: LocalProject) => void;
}) {
  const recent = projects.slice(0, MAX_RECENT);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-projects-title" className="w-full">
      <h2
        id="recent-projects-title"
        className="text-balance font-display text-[2rem] font-medium leading-[1.1] text-ink"
      >
        Sigue donde lo dejaste
      </h2>
      <ul className="mt-5 space-y-2">
        {recent.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              onClick={() => onOpen(project)}
              className="flex w-full items-center gap-3 rounded-xl border border-border bg-bg p-3 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              {project.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={project.thumbnail} alt="" width={80} height={24} className="h-6 w-20 rounded-md border border-border/50 object-cover" />
              ) : (
                <span className="block h-6 w-20 rounded-md bg-surface-raised" aria-hidden="true" />
              )}
              <span className="truncate text-chrome-body font-medium text-ink">{project.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
