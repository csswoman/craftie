'use client';

import { RotateCcw } from 'lucide-react';

import {
  TYPE_ROLE_LIMITS,
  TYPE_ROLE_WEIGHT_OPTIONS,
  type ResolvedTypeRole,
  type TypeRoleField,
} from '@lib/typography/typeRoles';

/** The fields the editor needs; satisfied by roles and by scale levels. */
export type EditableType = Pick<ResolvedTypeRole, 'weight' | 'size' | 'lineHeight' | 'letterSpacing' | 'overridden'>;

export type TypeRolePatch = Partial<Record<TypeRoleField, number | undefined>>;

type TypeRoleFieldsProps = {
  role: EditableType;
  /** Weight the family would have without a role override. */
  defaultWeight: number;
  onPatch: (patch: TypeRolePatch) => void;
  onReset: () => void;
};

type SliderRowProps = {
  label: string;
  field: Exclude<TypeRoleField, 'weight'>;
  value: number;
  suffix: string;
  digits: number;
  edited: boolean;
  onChange: (value: number) => void;
};

function SliderRow({ label, field, value, suffix, digits, edited, onChange }: SliderRowProps) {
  const limits = TYPE_ROLE_LIMITS[field];

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-3 text-chrome-caption text-ink">
        <span>
          {label}
          {edited ? <span className="ml-1.5 text-primary" aria-label="editado">•</span> : null}
        </span>
        <input
          type="number"
          min={limits.min}
          max={limits.max}
          step={limits.step}
          value={Number(value.toFixed(digits))}
          aria-label={`${label}${suffix ? ` en ${suffix}` : ''}`}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (event.target.value !== '' && Number.isFinite(next)) {
              onChange(next);
            }
          }}
          className="h-7 w-[4.5rem] rounded-md border border-border bg-bg px-1.5 text-right font-mono text-xs tabular-nums text-ink outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/25"
        />
      </span>
      <input
        type="range"
        min={limits.min}
        max={limits.max}
        step={limits.step}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-primary"
      />
    </label>
  );
}

export function TypeRoleFields({ role, defaultWeight, onPatch, onReset }: TypeRoleFieldsProps) {
  const anyEdited = Object.values(role.overridden).some(Boolean);
  const weights = TYPE_ROLE_WEIGHT_OPTIONS.includes(role.weight as (typeof TYPE_ROLE_WEIGHT_OPTIONS)[number])
    ? TYPE_ROLE_WEIGHT_OPTIONS
    : [...TYPE_ROLE_WEIGHT_OPTIONS, role.weight].sort((a, b) => a - b);

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-chrome-caption text-ink">
          Peso
          {role.overridden.weight ? <span className="ml-1.5 text-primary" aria-label="editado">•</span> : null}
        </p>
        <div role="group" aria-label="Peso" className="flex flex-wrap gap-1">
          {weights.map((weight) => {
            const active = role.weight === weight;
            return (
              <button
                key={weight}
                type="button"
                aria-pressed={active}
                title={weight === defaultWeight ? 'Peso del par' : undefined}
                onClick={() => onPatch({ weight: weight === defaultWeight ? undefined : weight })}
                className={`h-8 min-w-[2.5rem] rounded-md border px-2 font-mono text-xs tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                  active ? 'border-ink bg-ink text-bg' : 'border-border bg-bg text-ink hover:bg-surface'
                }`}
              >
                {weight}
              </button>
            );
          })}
        </div>
      </div>
      <SliderRow label="Tamaño" field="size" value={role.size} suffix="px" digits={0} edited={role.overridden.size} onChange={(size) => onPatch({ size })} />
      <SliderRow label="Interlineado" field="lineHeight" value={role.lineHeight} suffix="" digits={2} edited={role.overridden.lineHeight} onChange={(lineHeight) => onPatch({ lineHeight })} />
      <SliderRow label="Tracking" field="letterSpacing" value={role.letterSpacing} suffix="em" digits={3} edited={role.overridden.letterSpacing} onChange={(letterSpacing) => onPatch({ letterSpacing })} />
      <button
        type="button"
        onClick={onReset}
        disabled={!anyEdited}
        className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-bg px-2.5 text-chrome-caption text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RotateCcw size={13} aria-hidden="true" />
        Restablecer rol
      </button>
    </div>
  );
}
