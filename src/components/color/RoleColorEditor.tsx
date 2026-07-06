'use client';

import type { PaletteRoleId } from '@lib/color/rolePalette';

import {
  RoleContrastBadge,
  RoleHexInput,
  RoleLockToggle,
  RoleOklchSliders,
} from './RoleColorEditorControls';
import { useRoleColorEditor } from './useRoleColorEditor';

export type RoleColorEditorProps = {
  role: PaletteRoleId;
  idPrefix?: string;
  showSwatch?: boolean;
  showContrast?: boolean;
  showLock?: boolean;
};

export function RoleColorEditor({
  role,
  idPrefix = 'role-editor',
  showSwatch = true,
  showContrast = true,
  showLock = true,
}: RoleColorEditorProps) {
  const editor = useRoleColorEditor(role);

  if (!editor.ready || !editor.slot || !editor.oklch || !editor.contrast) {
    return null;
  }

  const { slot, locked, oklch, chromaMax, contrast, updateOklch, handleHexCommit, toggleLock } =
    editor;

  return (
    <div className="space-y-3">
      {showSwatch || showLock ? (
        <div className="flex items-start gap-3">
          {showSwatch ? (
            <div
              className="size-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-ink/10"
              style={{ backgroundColor: slot.hex }}
              aria-hidden="true"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <RoleHexInput
              hex={slot.hex}
              disabled={locked}
              inputId={`${idPrefix}-hex`}
              onCommit={handleHexCommit}
            />
            {showLock ? (
              <div className="mt-2 flex justify-end">
                <RoleLockToggle locked={locked} onToggle={toggleLock} />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <RoleHexInput
          hex={slot.hex}
          disabled={locked}
          inputId={`${idPrefix}-hex`}
          onCommit={handleHexCommit}
        />
      )}

      <RoleOklchSliders
        idPrefix={idPrefix}
        oklch={oklch}
        chromaMax={chromaMax}
        disabled={locked}
        onChange={updateOklch}
      />

      {showContrast ? <RoleContrastBadge contrast={contrast} /> : null}
    </div>
  );
}
