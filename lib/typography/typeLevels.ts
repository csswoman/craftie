import {
  applyTypeOverridePatch,
  sanitizeTypeOverride,
  type TypeRoleField,
  type TypeRoleOverride,
} from './typeRoles';

/**
 * Per-level overrides for the modular scale (`display`, `h1`, `body`, `micro-1`...).
 * Weight, line-height and tracking live here; the size of a level stays in the
 * fine-tune size overrides so there is one source for it.
 */
export type TypeLevelOverrides = Record<string, TypeRoleOverride>;

const LEVEL_ID = /^[a-z][a-z0-9-]{0,23}$/;

export function patchTypeLevelOverrides(
  overrides: TypeLevelOverrides,
  id: string,
  patch: Partial<Record<Exclude<TypeRoleField, 'size'>, number | undefined>>,
): TypeLevelOverrides {
  const next = applyTypeOverridePatch(overrides[id], patch);
  const { [id]: _removed, ...rest } = overrides;

  return Object.keys(next).length === 0 ? rest : { ...rest, [id]: next };
}

export function parseTypeLevelOverrides(value: unknown): TypeLevelOverrides {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const result: TypeLevelOverrides = {};

  for (const [key, entry] of Object.entries(value)) {
    const { size: _size, ...clean } = sanitizeTypeOverride(entry);
    if (LEVEL_ID.test(key) && Object.keys(clean).length > 0) {
      result[key] = clean;
    }
  }

  return result;
}
