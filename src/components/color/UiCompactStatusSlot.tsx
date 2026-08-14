import { ChevronRight } from 'lucide-react';

import type { UiStatusColor, UiStatusRole } from '@lib/color/uiStatusColors';

import { UiCompactSwatch } from './UiCompactSwatch';

const STATUS_LABELS: Record<UiStatusRole, string> = {
  success: 'Éxito',
  warning: 'Advertencia',
  danger: 'Peligro',
};

export function UiCompactStatusSlot({
  role,
  status,
  onOpen,
}: {
  role: UiStatusRole;
  status: UiStatusColor | null;
  onOpen: () => void;
}) {
  const generated = status !== null;

  return (
    <li className={`group flex min-h-12 items-center gap-3 rounded-lg border px-2.5 ${generated ? 'border-line' : 'border-dashed border-line bg-surface'}`}>
      <UiCompactSwatch hex={status?.hex} pending={!generated} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-tools-body-sm font-semibold text-ink">
          {STATUS_LABELS[role]}
        </span>
        {generated && status ? (
          <span className="block font-mono text-tools-meta-scale font-medium tabular-nums text-ink/80">
            {status.hex.toUpperCase()}
          </span>
        ) : null}
      </span>
      {generated ? (
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex min-h-8 shrink-0 items-center gap-0.5 rounded-md px-2 text-tools-meta-scale font-semibold text-muted opacity-0 transition-all duration-200 hover:bg-line-soft hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Editar
          <ChevronRight size={14} strokeWidth={2.25} aria-hidden="true" />
        </button>
      ) : null}
    </li>
  );
}
