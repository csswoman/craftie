'use client';

import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { normalizeHex } from '@lib/color/normalizeHex';
import { resolvePaletteDisplayNames } from '@lib/color/paletteDisplay';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { SemanticTokenName, SemanticTokens } from '@lib/color/semanticTokens';
import { rolesBySourceHex, UI_SYSTEM_ROLES } from '@lib/color/uiColorPanel';
import {
  STATUS_COLOR_DEFINITIONS,
  statusAcceptsSource,
  type UiStatusColorSet,
  type UiStatusRole,
} from '@lib/color/uiStatusColors';

import { UiColorSectionHeader } from './UiColorSectionHeader';
import {
  UiSourceDestinationButton,
  UiSourceDestinationList,
} from './UiSourceDestinationList';
import { UiSourceTypeMenu } from './UiSourceTypeMenu';

type MenuStep = 'type' | 'role' | 'status';

const DATA_TOKENS = [
  'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-6',
] as const satisfies readonly SemanticTokenName[];

export function UiSourceColorsSection({
  colors,
  tokens,
  statusColors = null,
  onAssignRole,
  onAssignData,
  onAssignStatus,
  showHeader = true,
}: {
  colors: SelectableColor[];
  tokens: SemanticTokens;
  statusColors?: UiStatusColorSet | null;
  onAssignRole: (token: SemanticTokenName, hex: string) => void;
  onAssignData: (hex: string) => string;
  onAssignStatus: (role: UiStatusRole, hex: string) => void;
  showHeader?: boolean;
}) {
  const [openHex, setOpenHex] = useState<string | null>(null);
  const [step, setStep] = useState<MenuStep>('type');
  const [message, setMessage] = useState<string | null>(null);
  const uniqueColors = useMemo(() => uniqueByHex(colors), [colors]);
  const names = useMemo(() => resolvePaletteDisplayNames(uniqueColors), [uniqueColors]);
  const roleIndex = useMemo(() => rolesBySourceHex(tokens), [tokens]);
  const statusIndex = useMemo(() => statusesBySourceHex(statusColors), [statusColors]);
  const dataIndex = useMemo(() => dataLabelsBySourceHex(tokens), [tokens]);

  function toggleRow(hex: string) {
    setOpenHex((current) => (current === hex ? null : hex));
    setStep('type');
    setMessage(null);
  }

  function finishAssign(nextMessage: string) {
    setMessage(nextMessage);
    setOpenHex(null);
    setStep('type');
  }

  return (
    <section aria-labelledby="ui-source-title">
      {showHeader ? <UiColorSectionHeader title={`Colores fuente · ${uniqueColors.length}`} /> : null}
      <h2 id="ui-source-title" className="sr-only">Colores fuente</h2>
      {message ? (
        <p role="status" className="mb-2 text-tools-meta-scale text-muted">{message}</p>
      ) : null}
      <ul className="mt-2 space-y-1.5">
        {uniqueColors.map((color) => {
          const hex = normalizeHex(color.hex);
          const roles = roleIndex.get(hex) ?? [];
          const statuses = statusIndex.get(hex) ?? [];
          const dataLabels = dataIndex.get(hex) ?? [];
          const chips = [...roles, ...statuses, ...dataLabels];
          const name = names.get(color.id) ?? color.name;
          const open = openHex === hex;
          const assignLabel = chips.length === 0 ? 'Asignar' : 'Reasignar';

          return (
            <li
              key={color.id}
              className={`overflow-hidden rounded-lg border transition-colors ${
                open
                  ? 'border-forest/35 bg-bg shadow-[var(--shadow-float)]'
                  : 'border-border bg-bg'
              }`}
            >
              <div className="flex min-h-12 items-center gap-2.5 px-2.5 py-2">
                <span
                  className="size-8 shrink-0 rounded-md ring-1 ring-inset ring-ink/10"
                  style={{ backgroundColor: hex }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-tools-role text-ink">{name}</span>
                  <span className="block font-mono text-tools-meta-scale tabular-nums text-muted">
                    {hex.toUpperCase()}
                  </span>
                </span>
                {chips.length > 0 ? (
                  <span className="hidden max-w-[7.5rem] flex-wrap justify-end gap-1 sm:flex">
                    {chips.slice(0, 2).map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-[var(--chrome-green-soft)] px-1.5 py-0.5 text-tools-micro font-medium text-[var(--chrome-green)]"
                      >
                        {chip}
                      </span>
                    ))}
                    {chips.length > 2 ? (
                      <span className="rounded-full bg-line-soft px-1.5 py-0.5 text-tools-micro font-medium text-muted">
                        +{chips.length - 2}
                      </span>
                    ) : null}
                  </span>
                ) : null}
                <button
                  type="button"
                  aria-expanded={open}
                  aria-label={`${assignLabel} ${name}`}
                  onClick={() => toggleRow(hex)}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-tools-body-sm font-semibold text-forest transition-colors hover:bg-line-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-forest/25"
                >
                  {assignLabel}
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    strokeWidth={2.25}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {open ? (
                <div className="border-t border-line-soft bg-surface px-2.5 py-2.5">
                  {step === 'type' ? (
                    <UiSourceTypeMenu
                      name={name}
                      onRole={() => setStep('role')}
                      onStatus={() => setStep('status')}
                      onData={() => finishAssign(onAssignData(hex))}
                    />
                  ) : null}

                  {step === 'role' ? (
                    <UiSourceDestinationList
                      label={`Asignar ${name} a un rol`}
                      onBack={() => setStep('type')}
                    >
                      {UI_SYSTEM_ROLES.map((role) => {
                        const current = tokens[role.token];
                        return (
                          <UiSourceDestinationButton
                            key={role.token}
                            label={role.label}
                            currentHex={current.gap ? null : current.hex}
                            onClick={() => {
                              onAssignRole(role.token, hex);
                              finishAssign(`${name} asignado a ${role.label}.`);
                            }}
                          />
                        );
                      })}
                    </UiSourceDestinationList>
                  ) : null}

                  {step === 'status' ? (
                    <UiSourceDestinationList
                      label={`Usar ${name} como estado`}
                      onBack={() => setStep('type')}
                    >
                      {STATUS_COLOR_DEFINITIONS.map((status) => {
                        const current = statusColors?.[status.role];
                        const accepted = statusAcceptsSource(status.role, hex);
                        return (
                          <UiSourceDestinationButton
                            key={status.role}
                            label={status.label}
                            currentHex={current?.hex ?? null}
                            disabled={!accepted}
                            onClick={() => {
                              onAssignStatus(status.role, hex);
                              finishAssign(`${name} ofrecido como base de ${status.label}.`);
                            }}
                          />
                        );
                      })}
                    </UiSourceDestinationList>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
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

function statusesBySourceHex(statusColors: UiStatusColorSet | null | undefined): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (!statusColors) return map;
  for (const definition of STATUS_COLOR_DEFINITIONS) {
    const status = statusColors[definition.role];
    if (!status.sourceHex) continue;
    const hex = normalizeHex(status.sourceHex);
    map.set(hex, [...(map.get(hex) ?? []), definition.label]);
  }
  return map;
}

function dataLabelsBySourceHex(tokens: SemanticTokens): Map<string, string[]> {
  const map = new Map<string, string[]>();
  DATA_TOKENS.forEach((token, index) => {
    const entry = tokens[token];
    if (entry.gap || entry.source !== 'extracted') return;
    const hex = normalizeHex(entry.hex);
    map.set(hex, [...(map.get(hex) ?? []), `Datos ${index + 1}`]);
  });
  return map;
}
