'use client';

import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';

import { globalPatchForLevel, globalPatchForRole, type GlobalTypePatch } from '@lib/typography/typeGlobal';
import { patchTypeLevelOverrides, type TypeLevelOverrides } from '@lib/typography/typeLevels';
import { buildTypeScaleReadout } from '@lib/typography/typeScale';
import {
  collectRoleWeights,
  patchTypeRoleOverrides,
  resolveTypeRoles,
  validateTypeRoles,
  type TypeRoleContext,
  type TypeRoleSpacing,
  type TypeRoleOverrides,
} from '@lib/typography/typeRoles';

import type { TypeRolesValue } from '@/context/TypeRolesContext';

type Input = Omit<TypeRoleContext, 'sizes' | 'overrides'> & {
  base: number;
  ratio: number;
  overrides: TypeRoleOverrides;
  setOverrides: Dispatch<SetStateAction<TypeRoleOverrides>>;
  levelOverrides: TypeLevelOverrides;
  setLevelOverrides: Dispatch<SetStateAction<TypeLevelOverrides>>;
  setSizeOverrides: Dispatch<SetStateAction<Record<string, number | null>>>;
  setHeadingWeight: (weight: number) => void;
  setBodyWeight: (weight: number) => void;
  setSpacing: Dispatch<SetStateAction<TypeRoleSpacing>>;
};

/** Resolves the type roles from workspace state and exposes edit handlers. */
export function useTypeRolesValue({
  headingWeight,
  bodyWeight,
  spacing,
  sizeOverrides,
  base,
  ratio,
  overrides,
  setOverrides,
  levelOverrides,
  setLevelOverrides,
  setSizeOverrides,
  setHeadingWeight,
  setBodyWeight,
  setSpacing,
}: Input): TypeRolesValue {
  const roles = useMemo(
    () =>
      resolveTypeRoles({
        headingWeight,
        bodyWeight,
        spacing,
        sizeOverrides,
        sizes: buildTypeScaleReadout(base, ratio),
        overrides,
      }),
    [headingWeight, bodyWeight, spacing, sizeOverrides, base, ratio, overrides],
  );
  const warnings = useMemo(() => validateTypeRoles(roles), [roles]);
  const weights = useMemo(() => collectRoleWeights(roles), [roles]);

  const patchRole = useCallback<TypeRolesValue['patchRole']>(
    (id, patch) => setOverrides((current) => patchTypeRoleOverrides(current, id, patch)),
    [setOverrides],
  );
  const resetRole = useCallback<TypeRolesValue['resetRole']>(
    (id) =>
      setOverrides((current) => {
        const { [id]: _removed, ...rest } = current;
        return rest;
      }),
    [setOverrides],
  );
  const resetAll = useCallback(() => setOverrides({}), [setOverrides]);

  const applyGlobal = useCallback(
    (patch: GlobalTypePatch) => {
      if (patch.headingWeight !== undefined) setHeadingWeight(patch.headingWeight);
      if (patch.bodyWeight !== undefined) setBodyWeight(patch.bodyWeight);
      const { spacing: spacingPatch, size } = patch;
      if (spacingPatch) setSpacing((current) => ({ ...current, ...spacingPatch }));
      if (size) setSizeOverrides((current) => ({ ...current, [size.levelId]: size.value }));
    },
    [setHeadingWeight, setBodyWeight, setSpacing, setSizeOverrides],
  );

  const sizes = useMemo(() => buildTypeScaleReadout(base, ratio), [base, ratio]);

  const patchRoleGlobal = useCallback<TypeRolesValue['patchRoleGlobal']>(
    (id, patch) => {
      applyGlobal(globalPatchForRole(id, patch, sizes));
      // The role follows the applied value again, so its own override is dropped.
      setOverrides((current) =>
        patchTypeRoleOverrides(current, id, Object.fromEntries(Object.keys(patch).map((field) => [field, undefined]))),
      );
    },
    [applyGlobal, sizes, setOverrides],
  );

  const patchLevelGlobal = useCallback<TypeRolesValue['patchLevelGlobal']>(
    (id, isHeading, computedSize, patch) => {
      applyGlobal(globalPatchForLevel(id, isHeading, computedSize, patch));
      const { size: _size, ...own } = patch;
      setLevelOverrides((current) =>
        patchTypeLevelOverrides(current, id, Object.fromEntries(Object.keys(own).map((field) => [field, undefined]))),
      );
    },
    [applyGlobal, setLevelOverrides],
  );

  const patchLevel = useCallback<TypeRolesValue['patchLevel']>(
    (id, patch) => {
      const { size, ...rest } = patch;

      if ('size' in patch) {
        setSizeOverrides((current) => ({ ...current, [id]: size === undefined ? null : size }));
      }
      if (Object.keys(rest).length > 0) {
        setLevelOverrides((current) => patchTypeLevelOverrides(current, id, rest));
      }
    },
    [setLevelOverrides, setSizeOverrides],
  );
  const resetLevel = useCallback<TypeRolesValue['resetLevel']>(
    (id) => {
      setSizeOverrides((current) => ({ ...current, [id]: null }));
      setLevelOverrides((current) => {
        const { [id]: _removed, ...rest } = current;
        return rest;
      });
    },
    [setLevelOverrides, setSizeOverrides],
  );

  return useMemo(
    () => ({
      overrides,
      roles,
      warnings,
      weights,
      patchRole,
      resetRole,
      resetAll,
      levelOverrides,
      patchLevel,
      resetLevel,
      patchRoleGlobal,
      patchLevelGlobal,
    }),
    [overrides, roles, warnings, weights, patchRole, resetRole, resetAll, levelOverrides, patchLevel, resetLevel, patchRoleGlobal, patchLevelGlobal],
  );
}
