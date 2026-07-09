'use client';

import { ROLE_LABELS, type PaletteRoleId } from '@lib/color/rolePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import { RoleColorEditor } from './RoleColorEditor';
import { RoleLockToggle } from './RoleColorEditorControls';
import { useRoleColorEditor } from './useRoleColorEditor';

export function RoleInspector() {
  const { rolePalette, activeRole, setActiveRole } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  if (activeRole === null) {
    return <RoleInspectorEmpty />;
  }

  return <RoleInspectorPanel role={activeRole} onClose={() => setActiveRole(null)} />;
}

function RoleInspectorPanel({ role, onClose }: { role: PaletteRoleId; onClose: () => void }) {
  const editor = useRoleColorEditor(role);

  if (!editor.ready || !editor.slot) {
    return null;
  }

  const swatchName = editor.slot.name;

  return (
    <section
      className="rounded-2xl border border-border bg-surface px-4 py-4"
      aria-label={`Inspector del rol ${ROLE_LABELS[role]}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-border/70 pb-4">
        <div className="min-w-0">
          <h3 className="truncate text-chrome-title">{ROLE_LABELS[role]}</h3>
          <p className="mt-0.5 truncate text-chrome-label text-muted">{swatchName}</p>
        </div>
        <div className="flex items-center gap-2">
          <RoleLockToggle locked={editor.locked} onToggle={editor.toggleLock} />
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 items-center rounded-md border border-border px-2.5 text-chrome-caption font-semibold text-muted transition-colors hover:bg-surface-raised hover:text-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
          >
            Cerrar
          </button>
        </div>
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
      <p className="text-chrome-label font-medium text-ink">Selecciona un rol para editarlo.</p>
    </section>
  );
}
