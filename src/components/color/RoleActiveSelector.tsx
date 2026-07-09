'use client';

import { PALETTE_ROLE_ORDER, ROLE_LABELS } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

export function RoleActiveSelector() {
  const { rolePalette, activeRole, setActiveRole } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto px-3 py-3">
      <h2 className="text-chrome-title">Rol activo</h2>
      <p className="prose-measure mt-0.5 text-chrome-label leading-relaxed text-muted">
        Sincronizado con la paleta central.
      </p>
      <div className="mt-7 flex flex-col gap-2">
        {PALETTE_ROLE_ORDER.map((role) => {
          const slot = rolePalette[role];
          const isActive = activeRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`flex min-h-14 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-bg text-ink hover:bg-surface-raised'
              }`}
              title={`${ROLE_LABELS[role]} · ${slot.name} · ${slot.hex}`}
            >
              <span
                className="inline-block size-7 shrink-0 rounded-md ring-1 ring-inset ring-ink/10"
                style={{ backgroundColor: slot.hex }}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-chrome-body font-semibold text-ink">
                  {ROLE_LABELS[role]}
                </span>
                <span className="block truncate text-chrome-label font-medium text-muted">
                  {slot.name}
                </span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-chrome-caption font-semibold ${
                  isActive ? 'bg-bg/70 text-primary' : 'bg-surface text-primary'
                }`}
              >
                AA
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
