import type { UiStatusColor, UiStatusRole } from '@lib/color/uiStatusColors';

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
    <li className={`group flex min-h-11 items-center gap-2 rounded-lg border px-2 ${generated ? 'border-line' : 'border-dashed border-line'}`}>
      <span
        className="size-[22px] shrink-0 rounded-full ring-1 ring-inset ring-ink/10"
        style={generated ? { backgroundColor: status.hex } : {
          backgroundColor: 'var(--color-surface)',
          backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,var(--color-line) 4px,var(--color-line) 6px)',
        }}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8125rem] font-semibold text-ink">
          {STATUS_LABELS[role]}
        </span>
        <span className={`block text-[0.6875rem] ${generated ? 'font-mono tabular-nums text-faint' : 'text-muted'}`}>
          {generated ? status.hex.toUpperCase() : 'Sin generar'}
        </span>
      </span>
      <button
        type="button"
        onClick={onOpen}
        className={`min-h-8 shrink-0 rounded-md px-2 text-[0.6875rem] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25 ${generated ? 'text-forest opacity-0 hover:bg-line-soft group-hover:opacity-100 group-focus-within:opacity-100' : 'border border-line bg-bg text-forest hover:bg-line-soft'}`}
      >
        {generated ? 'Editar' : 'Generar'}
      </button>
    </li>
  );
}
