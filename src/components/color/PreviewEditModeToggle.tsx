'use client';

import { Lock, Palette, Type, type LucideIcon } from 'lucide-react';
import { useT, useTx } from '@/context/I18nContext';

export type PreviewEditMode = 'locked' | 'color' | 'text';

const OPTIONS: { id: PreviewEditMode; label: string; icon: LucideIcon }[] = [
  { id: 'locked', label: 'Bloqueado', icon: Lock },
  { id: 'color', label: 'Color', icon: Palette },
  { id: 'text', label: 'Texto', icon: Type },
];

/** Chooses what a click on the mockup edits: nothing (locked), the color slot or the text role. */
export function PreviewEditModeToggle({
  value,
  onChange,
}: {
  value: PreviewEditMode;
  onChange: (mode: PreviewEditMode) => void;
}) {
  const tx = useTx();
  const t = useT();
  return (
    <div
      role="group"
      aria-label={t('ui.PreviewEditModeToggle.que-editar-al-hacer-clic')}
      className="inline-flex h-11 shrink-0 items-center gap-0.5 rounded-lg border border-line bg-bg p-1"
    >
      {OPTIONS.map((option) => {
        const active = option.id === value;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            aria-label={t('ui.PreviewEditModeToggle.clic-edita', { label: tx(option.label) })}
            title={t('ui.PreviewEditModeToggle.clic-edita', { label: tx(option.label) })}
            onClick={() => onChange(option.id)}
            className={`inline-flex h-full items-center gap-1.5 rounded-md px-2.5 text-chrome-label font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${active ? 'bg-surface-raised text-ink' : 'text-muted hover:text-ink'
              }`}
          >
            <Icon className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            {active ? <span>{tx(option.label)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
