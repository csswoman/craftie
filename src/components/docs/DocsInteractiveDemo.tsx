'use client';

import { useState } from 'react';

const ROLES = [
  { id: 'primary', label: 'Acción principal', color: '#2f5644', text: '#ffffff', note: 'El botón que quieres que encuentren primero.' },
  { id: 'surface', label: 'Superficie', color: '#f0f3f1', text: '#1a2420', note: 'Una capa que contiene contenido sobre el fondo.' },
  { id: 'on-surface', label: 'Texto sobre superficie', color: '#f0f3f1', text: '#1a2420', note: 'El foreground que mantiene legible esa capa.' },
  { id: 'accent', label: 'Acento', color: '#3d6a8a', text: '#ffffff', note: 'Un destacado o enlace que apoya la jerarquía.' },
] as const;

export function DocsInteractiveDemo() {
  const [mode, setMode] = useState<'visual' | 'role'>('role');
  const active = mode === 'role' ? ROLES[0] : { ...ROLES[0], label: 'Verde bosque', note: 'Un nombre visual dice cómo se ve, no qué función cumple.' };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface" aria-label="Demo de roles semánticos">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">Misma muestra, dos modelos</p>
          <p className="mt-0.5 text-xs text-muted">Cambia el nombre que guía la decisión.</p>
        </div>
        <div className="flex rounded-lg border border-border bg-bg p-1" role="tablist" aria-label="Modelo de color">
          {(['role', 'visual'] as const).map((nextMode) => (
            <button
              key={nextMode}
              type="button"
              role="tab"
              aria-selected={mode === nextMode}
              onClick={() => setMode(nextMode)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25 ${mode === nextMode ? 'bg-surface-raised text-ink' : 'text-muted hover:text-ink'}`}
            >
              {nextMode === 'role' ? 'Por función' : 'Por apariencia'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(180px,0.8fr)] sm:items-center sm:p-6">
        <div className="rounded-lg border border-border bg-bg p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">Acción de marca</span>
            <span className="font-mono text-xs text-muted">{active.id}</span>
          </div>
          <button type="button" className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30">
            Continuar
          </button>
        </div>
        <div>
          <p className="font-mono text-xs font-semibold text-primary">{active.id}</p>
          <p className="mt-1 text-base font-semibold text-ink">{active.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{active.note}</p>
        </div>
      </div>
    </div>
  );
}
