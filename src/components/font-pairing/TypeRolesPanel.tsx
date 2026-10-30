'use client';

import { AlertTriangle, ChevronDown, Type } from 'lucide-react';
import { useState } from 'react';

import { TYPE_ROLE_IDS, TYPE_ROLE_DEFINITIONS, type TypeRoleId } from '@lib/typography/typeRoles';

import { useTypeRoles } from '@/context/TypeRolesContext';
import { TypeRoleFields } from './TypeRoleFields';

type TypeRolesPanelProps = {
  headingWeight: number;
  bodyWeight: number;
};

/** Per-role weight, size, leading and tracking. Mirrors the click-to-edit popover. */
export function TypeRolesPanel({ headingWeight, bodyWeight }: TypeRolesPanelProps) {
  const { roles, warnings, weights, patchRole, resetRole, resetAll } = useTypeRoles();
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState<TypeRoleId | null>(null);
  const anyEdited = TYPE_ROLE_IDS.some((id) => Object.values(roles[id].overridden).some(Boolean));
  const defaults = { heading: headingWeight, body: bodyWeight };

  return (
    <section className="rounded-xl border border-border bg-surface-raised/70" aria-labelledby="type-roles-title">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="flex items-center gap-2 text-chrome-label font-semibold text-ink">
          <Type size={15} aria-hidden="true" />
          <span id="type-roles-title">Roles tipográficos</span>
        </span>
        <ChevronDown size={16} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {open ? (
        <div className="border-t border-border px-4 py-4">
          <p className="max-w-prose text-chrome-caption leading-relaxed text-muted">
            Cada rol parte del peso del par y de la escala. Edita uno aquí o con «Editar: Texto» sobre la maqueta.
          </p>
          <ul className="mt-3 divide-y divide-border/70">
            {TYPE_ROLE_IDS.map((id) => {
              const role = roles[id];
              const isOpen = expanded === id;
              const edited = Object.values(role.overridden).some(Boolean);

              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : id)}
                    className="flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
                  >
                    <span className="min-w-0">
                      <span className="block text-chrome-label text-ink">
                        {TYPE_ROLE_DEFINITIONS[id].label}
                        {edited ? <span className="ml-1.5 text-primary" aria-label="editado">•</span> : null}
                      </span>
                      <span className="block truncate text-chrome-caption text-muted">{TYPE_ROLE_DEFINITIONS[id].usage}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
                      {role.weight} · {role.size}px · {role.lineHeight}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="pb-4 pt-1">
                      <TypeRoleFields
                        role={role}
                        defaultWeight={defaults[role.family]}
                        onPatch={(patch) => patchRole(id, patch)}
                        onReset={() => resetRole(id)}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-chrome-caption text-muted">
            Pesos que se cargan: titular {weights.heading.join(', ')} · cuerpo {weights.body.join(', ')}.
          </p>

          {warnings.length > 0 ? (
            <ul className="mt-3 space-y-1.5 border-t border-border pt-3" aria-label="Avisos de legibilidad">
              {warnings.map((warning) => (
                <li key={`${warning.code}-${warning.roleId ?? 'all'}`} className="flex gap-1.5 text-chrome-caption leading-snug text-fail">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={resetAll}
            disabled={!anyEdited}
            className="mt-4 inline-flex min-h-9 items-center rounded-md border border-border bg-bg px-3 text-chrome-caption font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Restablecer todos los roles
          </button>
        </div>
      ) : null}
    </section>
  );
}
