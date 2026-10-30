import {
  clampWeight,
  TYPE_ROLE_DEFINITIONS,
  type TypeRoleField,
  type TypeRoleId,
  type TypeRoleSpacing,
} from './typeRoles';
import type { TypeScaleReadout } from './typeScale';

/** Slider ranges of the global spacing controls. */
export const TYPE_SPACING_LIMITS = {
  headingLineHeight: { min: 0.9, max: 1.8 },
  headingLetterSpacing: { min: -0.06, max: 0.12 },
  bodyLineHeight: { min: 1, max: 2.2 },
  bodyLetterSpacing: { min: -0.06, max: 0.2 },
} as const satisfies Record<keyof TypeRoleSpacing, { min: number; max: number }>;

export type TypeFieldPatch = Partial<Record<TypeRoleField, number | undefined>>;

/** What an edit on one role or level changes in the applied typography. */
export type GlobalTypePatch = {
  headingWeight?: number;
  bodyWeight?: number;
  spacing?: Partial<TypeRoleSpacing>;
  /** Scale level id and its new size (`null` returns to the computed size). */
  size?: { levelId: string; value: number | null };
};

function clamp(value: number, limits: { min: number; max: number }): number {
  return Math.min(limits.max, Math.max(limits.min, value));
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

type Target = {
  family: 'heading' | 'body';
  lineHeightOffset: number;
  letterSpacingOffset: number;
  weightOffset: number;
  sizeLevelId: string;
  computedSize: number;
};

function toGlobalPatch(target: Target, patch: TypeFieldPatch): GlobalTypePatch {
  const isHeading = target.family === 'heading';
  const result: GlobalTypePatch = {};

  if (patch.weight !== undefined) {
    result[isHeading ? 'headingWeight' : 'bodyWeight'] = clampWeight(patch.weight - target.weightOffset);
  }
  if (patch.lineHeight !== undefined) {
    const key = isHeading ? 'headingLineHeight' : 'bodyLineHeight';
    result.spacing = {
      ...result.spacing,
      [key]: round(clamp(patch.lineHeight - target.lineHeightOffset, TYPE_SPACING_LIMITS[key]), 3),
    };
  }
  if (patch.letterSpacing !== undefined) {
    const key = isHeading ? 'headingLetterSpacing' : 'bodyLetterSpacing';
    result.spacing = {
      ...result.spacing,
      [key]: round(clamp(patch.letterSpacing - target.letterSpacingOffset, TYPE_SPACING_LIMITS[key]), 4),
    };
  }
  if (patch.size !== undefined) {
    result.size = {
      levelId: target.sizeLevelId,
      value: patch.size === target.computedSize ? null : patch.size,
    };
  }

  return result;
}

/**
 * Edit of a preview role as a change to the applied typography. The role keeps
 * its offset from the heading/body value, so the rest of the system moves with it.
 */
export function globalPatchForRole(
  id: TypeRoleId,
  patch: TypeFieldPatch,
  sizes: TypeScaleReadout,
): GlobalTypePatch {
  const definition = TYPE_ROLE_DEFINITIONS[id];

  return toGlobalPatch(
    {
      family: definition.family,
      lineHeightOffset: definition.lineHeightOffset,
      letterSpacingOffset: definition.letterSpacingOffset,
      weightOffset: definition.weightOffset,
      sizeLevelId: definition.sizeKey,
      computedSize: sizes[definition.sizeKey],
    },
    patch,
  );
}

/** Edit of a scale level as a change to the applied typography. */
export function globalPatchForLevel(
  levelId: string,
  isHeading: boolean,
  computedSize: number,
  patch: TypeFieldPatch,
): GlobalTypePatch {
  return toGlobalPatch(
    {
      family: isHeading ? 'heading' : 'body',
      lineHeightOffset: 0,
      letterSpacingOffset: 0,
      weightOffset: 0,
      sizeLevelId: levelId,
      computedSize,
    },
    patch,
  );
}
