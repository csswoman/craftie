'use client';

import { useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import { resolvePaletteDisplayNames } from '@lib/color/paletteDisplay';
import {
  PALETTE_ROLE_ORDER,
  ROLE_LABELS,
  type PaletteRoleId,
} from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import { pickReadableTextColor } from '@lib/color/readableText';

import { CollapsibleSection } from '@/components/layout/CollapsibleSection';
import { useRolePalette } from '@/context/RolePaletteContext';

export type SourceColorsSectionProps = {
  colors: SelectableColor[];
};

export function SourceColorsSection({ colors }: SourceColorsSectionProps) {
  const { rolePalette, activeRole, lockedRoles, replaceRole } = useRolePalette();
  const [pendingHex, setPendingHex] = useState<string | null>(null);

  const uniqueColors = useMemo(() => {
    const seen = new Set<string>();

    return colors.filter((color) => {
      const hex = normalizeHex(color.hex);

      if (seen.has(hex)) {
        return false;
      }

      seen.add(hex);
      return true;
    });
  }, [colors]);

  const displayNames = useMemo(() => resolvePaletteDisplayNames(uniqueColors), [uniqueColors]);
  const usedHexes = useMemo(
    () =>
      rolePalette
        ? new Set(Object.values(rolePalette).map((slot) => normalizeHex(slot.hex)))
        : new Set<string>(),
    [rolePalette],
  );
  const lockedSet = useMemo(() => new Set(lockedRoles), [lockedRoles]);
  const activeRoleLocked = activeRole !== null && lockedSet.has(activeRole);

  if (uniqueColors.length === 0 || !rolePalette) {
    return null;
  }

  function assignToRole(role: PaletteRoleId, hex: string) {
    if (lockedSet.has(role)) {
      return;
    }

    replaceRole(role, normalizeHex(hex));
    setPendingHex(null);
  }

  function handleColorClick(hex: string) {
    if (activeRole !== null && !activeRoleLocked) {
      assignToRole(activeRole, hex);
      return;
    }

    setPendingHex((current) => (current === hex ? null : hex));
  }

  return (
    <CollapsibleSection
      title="Colores fuente"
      defaultOpen
      trailing={
        <span className="text-[0.6875rem] font-medium text-muted">
          {uniqueColors.length} colores extraídos
        </span>
      }
    >
      <div className="space-y-3">
        <ul className="grid grid-cols-2 gap-2" aria-label="Colores crudos extraídos">
          {uniqueColors.map((color) => {
            const hex = normalizeHex(color.hex);
            const used = usedHexes.has(hex);
            const activePending = pendingHex === hex;
            const swatchText = pickReadableTextColor(hex);
            const name = displayNames.get(color.id) ?? color.name;

            return (
              <li key={color.id}>
                <button
                  type="button"
                  aria-pressed={used}
                  aria-label={`Asignar ${name}, ${hex}`}
                  onClick={() => handleColorClick(hex)}
                  className={`flex w-full items-center gap-2 rounded-lg border bg-bg px-2 py-2 text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                    activePending
                      ? 'border-primary ring-2 ring-primary/30'
                      : used
                        ? 'border-primary'
                        : 'border-border'
                  }`}
                >
                  <span
                    className={`relative flex size-7 shrink-0 items-center justify-center rounded-md ${
                      used ? 'ring-2 ring-primary ring-offset-1 ring-offset-bg' : ''
                    }`}
                    style={{ backgroundColor: hex }}
                    aria-hidden="true"
                  >
                    {used ? (
                      <svg viewBox="0 0 12 12" className="size-3.5" fill="none">
                        <path
                          d="M2.5 6.2 5 8.7 9.5 3.8"
                          stroke={swatchText}
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[0.75rem] font-semibold text-ink">
                      {name}
                    </span>
                    <span className="block font-mono text-[0.625rem] text-muted">
                      {hex.toUpperCase()}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {pendingHex ? (
          <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
            <p className="text-[0.75rem] font-semibold text-ink">Asignar a rol</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PALETTE_ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={lockedSet.has(role)}
                  onClick={() => assignToRole(role, pendingHex)}
                  className="rounded-md border border-border bg-bg px-2 py-1 text-[0.6875rem] font-semibold text-ink transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </CollapsibleSection>
  );
}
