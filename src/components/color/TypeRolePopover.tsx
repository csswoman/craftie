'use client';

import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { TYPE_ROLE_DEFINITIONS, type TypeRoleId } from '@lib/typography/typeRoles';

import { TypeEditPopover, TypeScopeToggle } from '@/components/color/TypeEditPopover';
import { TypeRoleFields } from '@/components/font-pairing/TypeRoleFields';
import { useTypeRoles } from '@/context/TypeRolesContext';

export type TypeRolePopoverAnchor = {
  roleId: TypeRoleId;
  rect: DOMRect;
};

/** Edits one type role (weight, size, leading, tracking). Changes apply to every use of the role. */
export function TypeRolePopover({
  anchor,
  defaultWeights,
  onClose,
}: {
  anchor: TypeRolePopoverAnchor | null;
  defaultWeights: { heading: number; body: number };
  onClose: () => void;
}) {
  const { roles, warnings, patchRole, patchRoleGlobal, resetRole } = useTypeRoles();
  const [onlyThisRole, setOnlyThisRole] = useState(false);
  const roleId = anchor?.roleId ?? null;
  const role = roleId ? roles[roleId] : null;
  const roleWarnings = warnings.filter((warning) => warning.roleId === roleId);

  return (
    <TypeEditPopover
      rect={anchor?.rect ?? null}
      title={roleId ? TYPE_ROLE_DEFINITIONS[roleId].label : ''}
      subtitle={roleId ? `${TYPE_ROLE_DEFINITIONS[roleId].usage}. El cambio aplica a todo el rol.` : ''}
      onClose={onClose}
    >
      {roleId && role ? (
        <>
          <TypeScopeToggle checked={onlyThisRole} onChange={setOnlyThisRole} label="Solo este rol" />
          <TypeRoleFields
            role={role}
            defaultWeight={defaultWeights[role.family]}
            onPatch={(patch) => (onlyThisRole ? patchRole(roleId, patch) : patchRoleGlobal(roleId, patch))}
            onReset={() => resetRole(roleId)}
          />
          {roleWarnings.length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-border pt-3" aria-label="Avisos de legibilidad">
              {roleWarnings.map((warning) => (
                <li key={warning.code} className="flex gap-1.5 text-chrome-caption leading-snug text-fail">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{warning.message}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}
    </TypeEditPopover>
  );
}
