import type { ReactNode } from 'react';

export function UiColorSectionHeader({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="shrink-0 font-sans text-tools-meta font-medium text-muted">
        {title}
      </h2>
      <span className="h-px min-w-3 flex-1 bg-border" aria-hidden="true" />
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}
