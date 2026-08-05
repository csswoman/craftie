'use client';

import { useState } from 'react';

type RoleId = 'primario' | 'superficie' | 'texto' | 'acento';

type DemoRole = {
  id: RoleId;
  token: string;
  visualName: string;
  label: string;
  note: string;
};

const ROLES: DemoRole[] = [
  {
    id: 'primario',
    token: 'primary',
    visualName: 'verde bosque',
    label: 'Acción principal',
    note: 'La acción que quieres que encuentren primero. Si cambias el tono, el token sigue siendo primary.',
  },
  {
    id: 'superficie',
    token: 'surface',
    visualName: 'gris menta',
    label: 'Superficie',
    note: 'Una capa sobre el fondo. El texto encima usa otro token (on-surface), no el color de la superficie.',
  },
  {
    id: 'texto',
    token: 'on-background',
    visualName: 'casi negro',
    label: 'Texto sobre fondo',
    note: 'Es el color del texto, no del relleno. Ponerlo como fondo de un botón rompe el contraste.',
  },
  {
    id: 'acento',
    token: 'accent',
    visualName: 'azul pizarra',
    label: 'Acento',
    note: 'Enlaces y destacados secundarios. Apoya la jerarquía sin competir con el primario.',
  },
];

const PALETTE = {
  background: '#ffffff',
  surface: '#f0f3f1',
  onBackground: '#1a2420',
  onSurfaceMuted: '#5c6561',
  primary: '#2f5644',
  onPrimary: '#ffffff',
  accent: '#3d6a8a',
} as const;

function roleLabel(role: DemoRole, mode: 'role' | 'visual') {
  return mode === 'role' ? role.id : role.visualName;
}

export function DocsInteractiveDemo() {
  const [mode, setMode] = useState<'role' | 'visual'>('role');
  const [activeRoleId, setActiveRoleId] = useState<RoleId>('primario');
  const activeRole = ROLES.find((r) => r.id === activeRoleId) ?? ROLES[0];

  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-surface"
      aria-label="Demo de roles semánticos"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">La misma interfaz, dos formas de nombrar</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            El layout no cambia. Solo cambia si el nombre describe función o apariencia.
          </p>
        </div>
        <div
          className="flex shrink-0 rounded-lg border border-border bg-bg p-1"
          role="tablist"
          aria-label="Modelo de nombre"
        >
          {(['role', 'visual'] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              role="tab"
              id={`demo-tab-${nextMode}`}
              aria-selected={mode === nextMode}
              aria-controls="demo-panel"
              onClick={() => setMode(nextMode)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                mode === nextMode ? 'bg-surface-raised text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {nextMode === 'role' ? 'Por función' : 'Por apariencia'}
            </button>
          ))}
        </div>
      </div>

      <div
        id="demo-panel"
        role="tabpanel"
        aria-labelledby={`demo-tab-${mode}`}
        className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(200px,0.9fr)] sm:items-start sm:p-6"
      >
        <div className="min-w-0">
          <p className="mb-3 text-xs font-semibold text-muted">Miniatura de producto</p>
          <div
            className="rounded-lg border border-border p-4 motion-reduce:transition-none transition-[box-shadow] duration-200"
            style={{ backgroundColor: PALETTE.background }}
          >
            <div
              className={`rounded-lg border border-border p-4 motion-reduce:transition-none transition-[box-shadow] duration-200 ${
                activeRoleId === 'superficie' ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg' : ''
              }`}
              style={{ backgroundColor: PALETTE.surface }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold motion-reduce:transition-none transition-[box-shadow] duration-200 ${
                      activeRoleId === 'texto' ? 'rounded-sm ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ color: PALETTE.onBackground }}
                  >
                    Título de sección
                  </p>
                  <p className="mt-1 font-mono text-[0.6875rem] text-muted">
                    {mode === 'role' ? 'texto → on-background' : 'casi negro'}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-md px-2 py-1 font-mono text-[0.6875rem] font-semibold motion-reduce:transition-none transition-[box-shadow] duration-200 ${
                    activeRoleId === 'primario' ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: PALETTE.primary, color: PALETTE.onPrimary }}
                >
                  {roleLabel(ROLES[0], mode)}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: PALETTE.onSurfaceMuted }}>
                Texto secundario en la superficie. El contraste se comprueba sobre el fondo real del
                componente.
              </p>
              <p className="mt-3 text-sm">
                <span className="text-muted">¿Dudas? </span>
                <span
                  className={`font-semibold underline-offset-2 hover:underline motion-reduce:transition-none transition-[box-shadow] duration-200 ${
                    activeRoleId === 'acento' ? 'rounded-sm ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ color: PALETTE.accent }}
                >
                  {roleLabel(ROLES[3], mode)}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Resaltar rol en la miniatura">
            {ROLES.map((entry) => {
              const selected = entry.id === activeRoleId;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setActiveRoleId(entry.id)}
                  aria-pressed={selected}
                  className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${
                    selected
                      ? 'border-ink bg-surface-raised text-ink'
                      : 'border-border text-muted hover:bg-surface hover:text-ink'
                  }`}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-full border border-border"
                    style={{
                      backgroundColor:
                        entry.id === 'primario'
                          ? PALETTE.primary
                          : entry.id === 'superficie'
                            ? PALETTE.surface
                            : entry.id === 'texto'
                              ? PALETTE.onBackground
                              : PALETTE.accent,
                    }}
                    aria-hidden="true"
                  />
                  {entry.id}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-bg p-4">
          <p className="font-mono text-xs font-semibold text-primary">
            {mode === 'role' ? `${activeRole.id} → ${activeRole.token}` : activeRole.visualName}
          </p>
          <p className="mt-1 text-base font-semibold text-ink">{activeRole.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{activeRole.note}</p>
          {mode === 'visual' ? (
            <p className="mt-3 rounded-md bg-surface px-3 py-2 text-xs leading-relaxed text-muted">
              Con nombres visuales, si el verde pasa a azul hay que renombrar todo. Con tokens, solo
              cambias el valor.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
