import { Sparkles } from 'lucide-react';

const FILLED_RING =
  'ring-1 ring-ink/25 shadow-[inset_0_0_0_1px_oklch(1_0_0_/_0.28)]';

export function UiCompactSwatch({
  hex,
  pending = false,
}: {
  hex?: string;
  pending?: boolean;
}) {
  if (pending) {
    return (
      <span
        className="relative grid size-8 shrink-0 place-items-center rounded-full border border-dashed border-line bg-surface-raised"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 5px, color-mix(in oklch, var(--color-ink) 8%, transparent) 5px, color-mix(in oklch, var(--color-ink) 8%, transparent) 7px)',
        }}
        aria-hidden="true"
      >
        <Sparkles size={14} strokeWidth={1.75} className="text-muted" />
      </span>
    );
  }

  return (
    <span
      className={`size-8 shrink-0 rounded-full ${FILLED_RING}`}
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}
