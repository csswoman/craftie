'use client';

import { PALETTE_ROLE_ORDER, ROLE_LABELS } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

export function RoleActiveSelector() {
  const { rolePalette, activeRole, setActiveRole } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2">
      <p className="text-[0.6875rem] font-semibold text-muted">Rol activo</p>
      <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-muted">
        Sincronizado con la paleta central.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {PALETTE_ROLE_ORDER.map((role) => {
          const slot = rolePalette[role];
          const isActive = activeRole === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`rounded-md border px-2 py-1 text-[0.6875rem] font-medium transition-colors ${
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-bg text-ink hover:bg-surface-raised'
              }`}
              title={`${ROLE_LABELS[role]} · ${slot.name} · ${slot.hex}`}
            >
              <span
                className="mr-1.5 inline-block size-2.5 rounded-full align-middle ring-1 ring-inset ring-ink/10"
                style={{ backgroundColor: slot.hex }}
              />
              {ROLE_LABELS[role]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
