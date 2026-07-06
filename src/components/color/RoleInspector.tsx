'use client';

import { ROLE_LABELS, type PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleColorEditor, RoleLockToggle } from './RoleColorEditor';
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

  return (
    <section
      className="rounded-md border border-border bg-surface px-3 py-3"
      aria-label={`Inspector del rol ${ROLE_LABELS[role]}`}
    >
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">
            Inspector
          </p>
          <h3 className="mt-0.5 text-[0.875rem] font-semibold text-ink">{ROLE_LABELS[role]}</h3>
          <p className="mt-0.5 truncate text-[0.75rem] text-muted">{editor.slot.name}</p>
        </div>
        <RoleLockToggle locked={editor.locked} onToggle={editor.toggleLock} />
      </header>

      <div
        className="mt-3 aspect-[4/3] w-full overflow-hidden rounded-lg ring-1 ring-inset ring-ink/10"
        style={{ backgroundColor: editor.slot.hex }}
        aria-hidden="true"
      />

      <div className="mt-3">
        <RoleColorEditor
          role={role}
          idPrefix={`inspector-${role}`}
          showSwatch={false}
          showLock={false}
          showContrast
        />
      </div>
    </section>
  );
}

function RoleInspectorEmpty() {
  return (
    <section className="rounded-md border border-dashed border-border bg-surface/60 px-3 py-4">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-muted">Inspector</p>
      <p className="mt-2 text-[0.8125rem] font-medium text-ink">Ningún rol seleccionado</p>
      <p className="mt-1 text-[0.75rem] leading-relaxed text-muted">
        Elige un rol en las pastillas, en la banda central o en la vista previa para editar su color
        aquí. También puedes hacer doble clic en una banda o elemento de la vista previa.
      </p>
    </section>
  );
}
