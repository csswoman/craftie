'use client';

import { ROLE_LABELS, type PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleColorEditor } from './RoleColorEditor';
import { RoleLockToggle } from './RoleColorEditorControls';
import { useRoleColorEditor } from './useRoleColorEditor';

export function RoleInspector() {
  const { rolePalette, activeRole } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  if (activeRole === null) {
    return <RoleInspectorEmpty />;
  }

  return <RoleInspectorPanel role={activeRole} />;
}

function RoleInspectorPanel({ role }: { role: PaletteRoleId }) {
  const editor = useRoleColorEditor(role);

  if (!editor.ready || !editor.slot) {
    return null;
  }

  const swatchName = editor.slot.name;

  return (
    <section className="rounded-2xl border border-border bg-surface px-4 py-4" aria-label={`Inspector del rol ${ROLE_LABELS[role]}`}>
      <header className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted">
            Inspector
          </p>
          <p className="mt-1 truncate text-[0.875rem] text-muted">{swatchName} · {ROLE_LABELS[role]}</p>
        </div>
        <RoleLockToggle locked={editor.locked} onToggle={editor.toggleLock} />
      </header>

      <div className="pt-4">
        <div
          className="h-[4.5rem] w-full rounded-2xl border border-border/70 ring-1 ring-inset ring-white/50 dark:ring-white/5"
          style={{ backgroundColor: editor.slot.hex }}
          aria-hidden="true"
        />

        <div className="mt-4">
          <RoleColorEditor
            role={role}
            idPrefix={`inspector-${role}`}
            showSwatch={false}
            showLock={false}
            showContrast
          />
        </div>
      </div>
    </section>
  );
}

function RoleInspectorEmpty() {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-surface/60 px-4 py-4">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted">Inspector</p>
      <p className="mt-2 text-[0.875rem] font-medium text-ink">Ningún rol seleccionado</p>
      <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
        Elige un rol en las pastillas, en la banda central o en la vista previa para editar su color
        aquí. También puedes hacer doble clic en una banda o elemento de la vista previa.
      </p>
    </section>
  );
}
