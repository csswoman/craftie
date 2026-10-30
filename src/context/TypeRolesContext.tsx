'use client';

import { createContext, useContext } from 'react';

import type { TypeLevelOverrides } from '@lib/typography/typeLevels';
import { buildTypeScaleReadout } from '@lib/typography/typeScale';
import {
  collectRoleWeights,
  resolveTypeRoles,
  type ResolvedTypeRole,
  type TypeRoleContext,
  type TypeRoleField,
  type TypeRoleFamily,
  type TypeRoleId,
  type TypeRoleOverrides,
  type TypeRoleWarning,
} from '@lib/typography/typeRoles';

export type TypeRolesValue = {
  overrides: TypeRoleOverrides;
  roles: Record<TypeRoleId, ResolvedTypeRole>;
  warnings: TypeRoleWarning[];
  /** Weights each family has to load (defaults plus role overrides). */
  weights: Record<TypeRoleFamily, number[]>;
  patchRole: (id: TypeRoleId, patch: Partial<Record<TypeRoleField, number | undefined>>) => void;
  resetRole: (id: TypeRoleId) => void;
  resetAll: () => void;
  /** Per-level (scale) overrides. `size` is stored with the fine-tuned sizes. */
  levelOverrides: TypeLevelOverrides;
  patchLevel: (id: string, patch: Partial<Record<TypeRoleField, number | undefined>>) => void;
  resetLevel: (id: string) => void;
  /** Same edits, written to the applied typography instead of the role / level. */
  patchRoleGlobal: (id: TypeRoleId, patch: Partial<Record<TypeRoleField, number | undefined>>) => void;
  patchLevelGlobal: (
    id: string,
    isHeading: boolean,
    computedSize: number,
    patch: Partial<Record<TypeRoleField, number | undefined>>,
  ) => void;
};

export const DEFAULT_TYPE_ROLE_CONTEXT: TypeRoleContext = {
  headingWeight: 700,
  bodyWeight: 400,
  sizes: buildTypeScaleReadout(16, 1.25),
  spacing: { headingLineHeight: 1.2, headingLetterSpacing: -0.02, bodyLineHeight: 1.5, bodyLetterSpacing: 0 },
};

const defaultRoles = resolveTypeRoles(DEFAULT_TYPE_ROLE_CONTEXT);

const DEFAULT_VALUE: TypeRolesValue = {
  overrides: {},
  roles: defaultRoles,
  warnings: [],
  weights: collectRoleWeights(defaultRoles),
  patchRole: () => undefined,
  resetRole: () => undefined,
  resetAll: () => undefined,
  levelOverrides: {},
  patchLevel: () => undefined,
  resetLevel: () => undefined,
  patchRoleGlobal: () => undefined,
  patchLevelGlobal: () => undefined,
};

export const TypeRolesContext = createContext<TypeRolesValue>(DEFAULT_VALUE);

export function useTypeRoles(): TypeRolesValue {
  return useContext(TypeRolesContext);
}
