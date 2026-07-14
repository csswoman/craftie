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
  embedded?: boolean;
};

export function SourceColorsSection({ colors, embedded = false }: SourceColorsSectionProps) {
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

  const content = (
    <div className="space-y-[var(--chrome-space-3)]">
      <p className="font-sans text-tools-meta font-medium text-muted">
        {uniqueColors.length} colores fuente
      </p>
      <ul className="grid grid-cols-2 gap-[var(--chrome-space-2)]" aria-label="Colores crudos extraídos">
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
                  className={`flex w-full items-center gap-[var(--chrome-space-2)] rounded-[var(--chrome-radius-control)] border bg-bg px-[var(--chrome-space-2)] py-[var(--chrome-space-2)] text-left transition-colors hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                    activePending
                      ? 'border-primary ring-2 ring-primary/30'
                      : used
                        ? 'border-primary'
                        : 'border-border'
                  }`}
                >
                  <span
                    className={`relative flex size-7 shrink-0 items-center justify-center rounded-[var(--chrome-radius-control)] ${
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
                    <span className="block truncate font-sans text-tools-name font-medium text-ink">
                      {name}
                    </span>
                    <span className="block font-mono text-tools-meta text-muted">
                      {hex.toUpperCase()}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {pendingHex ? (
          <div className="rounded-[var(--chrome-radius-card)] border border-border bg-surface px-[var(--chrome-space-2)] py-[var(--chrome-space-2)]">
            <p className="font-sans text-tools-body font-medium text-ink">Asignar a rol</p>
            <div className="mt-[var(--chrome-space-2)] flex flex-wrap gap-[var(--chrome-space-1)]">
              {PALETTE_ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  type="button"
                  disabled={lockedSet.has(role)}
                  onClick={() => assignToRole(role, pendingHex)}
                  className="rounded-[var(--chrome-radius-control)] border border-border bg-bg px-[var(--chrome-space-2)] py-[var(--chrome-space-1)] font-sans text-tools-chip font-medium text-ink transition-colors hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    );

  if (embedded) {
    return content;
  }

  return (
    <CollapsibleSection
      title="Colores fuente"
      defaultOpen
      variant="neutral"
      icon={<SourceColorsIcon />}
    >
      {content}
    </CollapsibleSection>
  );
}

function SourceColorsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
      <rect
        x="3"
        y="3"
        width="10"
        height="10"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M5 11.5 11.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
