'use client';

import { Button } from '@/components/ui/Button';

import { ColorSeedInput } from './ColorSeedInput';

interface SeedListProps {
  seeds: string[];
  canAdd: boolean;
  canRemove: boolean;
  onSeedChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function SeedList({
  seeds,
  canAdd,
  canRemove,
  onSeedChange,
  onAdd,
  onRemove,
}: SeedListProps) {
  return (
    <section
      aria-label="Colores semilla"
      className="rounded-lg border border-border bg-surface p-5"
    >
      <h2 className="text-base font-semibold text-ink">Colores semilla</h2>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted">
        Elige de 1 a 3 colores base. El motor generará roles de paleta a partir de ellos.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        {seeds.map((seed, index) => (
          <ColorSeedInput
            key={`seed-${index}`}
            index={index}
            value={seed}
            canRemove={canRemove}
            onChange={(value) => onSeedChange(index, value)}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>

      <div className="mt-4">
        <Button type="button" variant="ghost" onClick={onAdd} disabled={!canAdd}>
          Añadir semilla
        </Button>
      </div>
    </section>
  );
}
