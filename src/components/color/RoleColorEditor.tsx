'use client';

import { useState } from 'react';

import type { PaletteRoleId } from '@lib/color/rolePalette';

import {
  RoleContrastBadge,
  RoleHexInput,
  RoleLockToggle,
  RoleOklchSliders,
} from './RoleColorEditorControls';
import { useRoleColorEditor } from './useRoleColorEditor';
import { hexToOklchChannels } from '@lib/utils/colorMath';

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
  const [acceptedFailure, setAcceptedFailure] = useState(false);

  if (!editor.ready || !editor.slot || !editor.oklch || !editor.contrast) {
    return null;
  }

  const { slot, locked, oklch, chromaMax, contrast, updateOklch, handleHexCommit, toggleLock } =
    editor;
  const original = slot.originalHex ? hexToOklchChannels(slot.originalHex) : null;

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

      {original ? (
        <div className="rounded-[var(--chrome-radius-card)] border border-border bg-surface p-3">
          <div className="flex items-center gap-3">
            <span className="size-8 shrink-0 rounded-md" style={{ backgroundColor: slot.originalHex }} aria-hidden="true" />
            <p className="min-w-0 flex-1 font-sans text-tools-meta text-muted">
              Original <span className="font-mono text-ink">{slot.originalHex}</span><br />
              L {original.l.toFixed(2)} → {oklch.l.toFixed(2)} · H {Math.round(original.h)}° → {Math.round(oklch.h)}° · C {(oklch.c - original.c).toFixed(3)}
            </p>
            <button
              type="button"
              onClick={() => editor.revertTo(slot.originalHex!)}
              className="min-h-10 rounded-md border border-border bg-bg px-3 font-sans text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
            >
              Revertir
            </button>
          </div>
          <p className="mt-2 font-sans text-tools-meta text-muted">Marca original de L: {(original.l * 100).toFixed(1)}%</p>
        </div>
      ) : null}

      {slot.gap ? (
        <p className="rounded-[var(--chrome-radius-card)] border border-border bg-surface p-3 font-sans text-tools-meta text-ink">
          {slot.gap} Puedes elegir uno manualmente.
        </p>
      ) : null}

      {showContrast ? <RoleContrastBadge contrast={contrast} /> : null}
      {showContrast && contrast.status === 'fail' ? (
        <button
          type="button"
          aria-pressed={acceptedFailure}
          onClick={() => setAcceptedFailure((current) => !current)}
          className="min-h-10 w-full rounded-md border border-border bg-bg px-3 font-sans text-tools-meta font-semibold text-ink hover:bg-surface-raised focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25"
        >
          {acceptedFailure ? '⚠ Fuera de norma · aceptado' : 'Aceptar este par fuera de norma'}
        </button>
      ) : null}
    </div>
  );
}
