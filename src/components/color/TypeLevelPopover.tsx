'use client';

import { useState } from 'react';

import type { TypeScaleSpecimenLevel } from '@lib/typography/typeScalePreview';

import { TypeEditPopover, TypeScopeToggle } from '@/components/color/TypeEditPopover';
import { TypeRoleFields } from '@/components/font-pairing/TypeRoleFields';
import { useTypeRoles } from '@/context/TypeRolesContext';

export type TypeLevelAnchor = {
  levelId: string;
  rect: DOMRect;
};

/** Edits one level of the scale: size, weight, line-height and tracking. */
export function TypeLevelPopover({
  anchor,
  levels,
  onClose,
}: {
  anchor: TypeLevelAnchor | null;
  levels: TypeScaleSpecimenLevel[];
  onClose: () => void;
}) {
  const { patchLevel, patchLevelGlobal, resetLevel, weights } = useTypeRoles();
  const [onlyThisLevel, setOnlyThisLevel] = useState(false);
  const level = anchor ? levels.find((entry) => entry.id === anchor.levelId) : undefined;
  const baseWeight = level?.isHeading ? weights.heading[0] : weights.body[0];

  return (
    <TypeEditPopover
      rect={anchor?.rect ?? null}
      title={level?.label ?? ''}
      subtitle={level ? `${level.usage}.` : ''}
      onClose={onClose}
    >
      {level ? (
        <>
          <TypeScopeToggle checked={onlyThisLevel} onChange={setOnlyThisLevel} label="Solo este nivel" />
        <TypeRoleFields
          role={level}
          defaultWeight={level.overridden.weight ? (baseWeight ?? level.weight) : level.weight}
          onPatch={(patch) =>
            onlyThisLevel
              ? patchLevel(level.id, patch)
              : patchLevelGlobal(level.id, level.isHeading, level.computedSize, patch)
          }
          onReset={() => resetLevel(level.id)}
        />
        </>
      ) : null}
    </TypeEditPopover>
  );
}
