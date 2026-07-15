'use client';

import { useMemo, useState } from 'react';

import { normalizeHex } from '@lib/color/normalizeHex';
import { resolvePaletteDisplayNames } from '@lib/color/paletteDisplay';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import { rolesBySourceHex, UI_SYSTEM_ROLES } from '@lib/color/uiColorPanel';
import {
  STATUS_COLOR_DEFINITIONS,
  statusAcceptsSource,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { UiColorSectionHeader } from './UiColorSectionHeader';

type SourceAction = 'role' | 'status' | null;

export function UiSourceColorsSection({
  colors,
  tokens,
  onAssignRole,
  onAssignData,
  onAssignStatus,
}: {
  colors: SelectableColor[];
  tokens: SemanticTokens;
  onAssignRole: (token: SemanticTokenName, hex: string) => void;
  onAssignData: (hex: string) => string;
  onAssignStatus: (role: UiStatusRole, hex: string) => void;
}) {
  const [openHex, setOpenHex] = useState<string | null>(null);
  const [action, setAction] = useState<SourceAction>(null);
  const [message, setMessage] = useState<string | null>(null);
  const uniqueColors = useMemo(() => uniqueByHex(colors), [colors]);
  const names = useMemo(() => resolvePaletteDisplayNames(uniqueColors), [uniqueColors]);
  const roleIndex = useMemo(() => rolesBySourceHex(tokens), [tokens]);

  function toggleRow(hex: string) {
    setOpenHex((current) => current === hex ? null : hex);
    setAction(null);
    setMessage(null);
  }

  function chooseAction(next: SourceAction) {
    setAction((current) => current === next ? null : next);
    setMessage(null);
  }

  return (
    <section aria-labelledby="ui-source-title">
      <UiColorSectionHeader title={`Colores fuente · ${uniqueColors.length}`} />
      <h2 id="ui-source-title" className="sr-only">Colores fuente</h2>
      <ul className="mt-2 divide-y divide-border overflow-hidden rounded-lg border border-border bg-bg">
        {uniqueColors.map((color) => {
          const hex = normalizeHex(color.hex);
          const roles = roleIndex.get(hex) ?? [];
          const name = names.get(color.id) ?? color.name;
          const open = openHex === hex;
          return (
            <li key={color.id}>
              <div className="flex min-h-11 items-center gap-2 px-2.5 py-2">
                <span className="size-[26px] shrink-0 rounded-md ring-1 ring-inset ring-ink/10" style={{ backgroundColor: hex }} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.78125rem] font-medium text-ink">{name}</span>
                  <span className="block font-mono text-[0.65625rem] tabular-nums text-muted">{hex.toUpperCase()}</span>
                </span>
                {roles.map((role) => (
                  <span key={role} className="hidden rounded-full bg-[var(--chrome-green-soft)] px-1.5 py-0.5 text-[0.625rem] font-medium text-[var(--chrome-green)] sm:inline">
                    {role}
                  </span>
                ))}
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleRow(hex)}
                  className={`min-h-11 rounded-full px-2 text-[0.625rem] font-medium focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${roles.length === 0 ? 'bg-surface-raised text-muted' : 'border border-border text-ink hover:bg-surface-raised'}`}
                >
                  {roles.length === 0 ? 'libre' : 'Usar'} {open ? '↑' : '↓'}
                </button>
              </div>

              {open ? (
                <div className="space-y-2 bg-surface px-2.5 pb-2.5 pt-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <ActionButton label="Rol" active={action === 'role'} onClick={() => chooseAction('role')} />
                    <ActionButton
                      label="Datos"
                      active={false}
                      onClick={() => {
                        setAction(null);
                        setMessage(onAssignData(hex));
                      }}
                    />
                    <ActionButton label="Estado" active={action === 'status'} onClick={() => chooseAction('status')} />
                  </div>

                  {action === 'role' ? (
                    <div className="flex flex-wrap gap-1.5" aria-label={`Asignar ${name} a un rol`}>
                      {UI_SYSTEM_ROLES.map((role) => {
                        return (
                          <button
                            key={role.token}
                            type="button"
                            onClick={() => {
                              onAssignRole(role.token, hex);
                              setMessage(`${name} asignado a ${role.label}.`);
                            }}
                            className="min-h-11 rounded-md border border-border bg-bg px-2 text-[0.625rem] font-medium text-ink hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                          >
                            {role.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {action === 'status' ? (
                    <div className="grid grid-cols-3 gap-1.5" aria-label={`Usar ${name} como estado`}>
                      {STATUS_COLOR_DEFINITIONS.map((status) => (
                        <button
                          key={status.role}
                          type="button"
                          disabled={!statusAcceptsSource(status.role, hex)}
                          onClick={() => {
                            onAssignStatus(status.role, hex);
                            setMessage(`${name} ofrecido como base de ${status.label}.`);
                          }}
                          className="min-h-11 rounded-md border border-border bg-bg px-1.5 text-[0.625rem] font-medium text-ink hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {message ? <p role="status" className="text-[0.625rem] leading-relaxed text-muted">{message}</p> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ActionButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 rounded-md border px-2 text-[0.6875rem] font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${active ? 'border-[var(--chrome-green)] bg-[var(--chrome-green-soft)] text-[var(--chrome-green)]' : 'border-border bg-bg text-ink hover:bg-surface-raised'}`}
    >
      {label}
    </button>
  );
}

function uniqueByHex(colors: SelectableColor[]): SelectableColor[] {
  const seen = new Set<string>();
  return colors.filter((color) => {
    const hex = normalizeHex(color.hex);
    if (seen.has(hex)) return false;
    seen.add(hex);
    return true;
  });
}
