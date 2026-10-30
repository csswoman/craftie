import type { FontPair } from './fontPairTypes';
import type { TypeScaleReadout } from './typeScale';

/**
 * Typographic roles used by the layout previews and the export.
 *
 * Each role defaults to the pair's heading or body weight and to a size from
 * the modular scale. Any of weight / size / line-height / tracking can be
 * overridden per role without touching the others.
 */

export const TYPE_ROLE_IDS = [
  'hero',
  'display',
  'heading',
  'title',
  'body',
  'label',
  'caption',
  'eyebrow',
  'button',
  'brand',
] as const;

export type TypeRoleId = (typeof TYPE_ROLE_IDS)[number];
export type TypeRoleFamily = 'heading' | 'body';

export type TypeRoleDefinition = {
  id: TypeRoleId;
  label: string;
  usage: string;
  family: TypeRoleFamily;
  /** Step of the modular scale this role starts from. */
  sizeKey: keyof TypeScaleReadout;
  /** Added to the heading/body line-height slider value. */
  lineHeightOffset: number;
  /** Added to the heading/body tracking slider value (em). */
  letterSpacingOffset: number;
  /** Added to the heading/body weight, so roles differ without extra settings. */
  weightOffset: number;
  uppercase?: boolean;
};

export const TYPE_ROLE_DEFINITIONS: Record<TypeRoleId, TypeRoleDefinition> = {
  hero: { id: 'hero', label: 'Hero', usage: 'Titular grande de portada', family: 'heading', sizeKey: 'h1', lineHeightOffset: -0.16, letterSpacingOffset: 0, weightOffset: 0 },
  display: { id: 'display', label: 'Display', usage: 'Cifra o título principal de un bloque', family: 'heading', sizeKey: 'h2', lineHeightOffset: -0.15, letterSpacingOffset: 0.01, weightOffset: 0 },
  heading: { id: 'heading', label: 'Titular', usage: 'Títulos de panel y sección', family: 'heading', sizeKey: 'h3', lineHeightOffset: 0, letterSpacingOffset: 0.014, weightOffset: -100 },
  title: { id: 'title', label: 'Título', usage: 'Nombres en listas y tarjetas', family: 'body', sizeKey: 'body', lineHeightOffset: -0.15, letterSpacingOffset: 0, weightOffset: 100 },
  body: { id: 'body', label: 'Cuerpo', usage: 'Párrafos y descripciones', family: 'body', sizeKey: 'body', lineHeightOffset: 0.05, letterSpacingOffset: 0, weightOffset: 0 },
  label: { id: 'label', label: 'Etiqueta', usage: 'Botones, navegación, controles', family: 'body', sizeKey: 'small', lineHeightOffset: -0.15, letterSpacingOffset: 0, weightOffset: 100 },
  caption: { id: 'caption', label: 'Nota', usage: 'Metadatos y texto auxiliar', family: 'body', sizeKey: 'small', lineHeightOffset: -0.05, letterSpacingOffset: 0, weightOffset: 0 },
  button: { id: 'button', label: 'Botón', usage: 'Botones, filtros y estados activos', family: 'body', sizeKey: 'small', lineHeightOffset: -0.15, letterSpacingOffset: 0, weightOffset: 200 },
  brand: { id: 'brand', label: 'Marca', usage: 'Logotipo y titulares pequeños en la fuente de titulares', family: 'heading', sizeKey: 'body', lineHeightOffset: 0.05, letterSpacingOffset: 0.02, weightOffset: -100 },
  eyebrow: { id: 'eyebrow', label: 'Sobretítulo', usage: 'Etiqueta pequeña en mayúsculas', family: 'body', sizeKey: 'small', lineHeightOffset: -0.2, letterSpacingOffset: 0.06, weightOffset: 100, uppercase: true },
};

export type TypeRoleOverride = {
  weight?: number;
  /** Absolute size in px. */
  size?: number;
  lineHeight?: number;
  /** In em. */
  letterSpacing?: number;
};

export type TypeRoleOverrides = Partial<Record<TypeRoleId, TypeRoleOverride>>;
export type TypeRoleField = keyof TypeRoleOverride;

export const TYPE_ROLE_LIMITS = {
  weight: { min: 100, max: 900, step: 100 },
  size: { min: 9, max: 120, step: 1 },
  lineHeight: { min: 0.8, max: 2.2, step: 0.01 },
  letterSpacing: { min: -0.06, max: 0.3, step: 0.005 },
} as const;

export const TYPE_ROLE_WEIGHT_OPTIONS = [300, 400, 500, 600, 700, 800] as const;

export type TypeRoleSpacing = {
  headingLineHeight: number;
  headingLetterSpacing: number;
  bodyLineHeight: number;
  bodyLetterSpacing: number;
};

export type TypeRoleContext = {
  headingWeight: number;
  bodyWeight: number;
  sizes: TypeScaleReadout;
  spacing: TypeRoleSpacing;
  /** Fine-tune overrides keyed by scale level id (`h1`, `body`, ...). */
  sizeOverrides?: Record<string, number | null>;
  overrides?: TypeRoleOverrides;
};

export type ResolvedTypeRole = {
  id: TypeRoleId;
  label: string;
  family: TypeRoleFamily;
  weight: number;
  size: number;
  lineHeight: number;
  letterSpacing: number;
  uppercase: boolean;
  overridden: Record<TypeRoleField, boolean>;
};

/** Offsets move a role away from the pair's weight, snapped to the 100-step grid. */
export function clampWeight(value: number): number {
  return clamp(Math.round(value / 100) * 100, 100, 900);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function resolveTypeRole(id: TypeRoleId, context: TypeRoleContext): ResolvedTypeRole {
  const definition = TYPE_ROLE_DEFINITIONS[id];
  const override = context.overrides?.[id] ?? {};
  const isHeading = definition.family === 'heading';

  const baseWeight = isHeading ? context.headingWeight : context.bodyWeight;
  const baseLineHeight = isHeading ? context.spacing.headingLineHeight : context.spacing.bodyLineHeight;
  const baseTracking = isHeading ? context.spacing.headingLetterSpacing : context.spacing.bodyLetterSpacing;
  const scaleOverride = context.sizeOverrides?.[definition.sizeKey];
  const baseSize = typeof scaleOverride === 'number' && scaleOverride > 0
    ? scaleOverride
    : context.sizes[definition.sizeKey];

  return {
    id,
    label: definition.label,
    family: definition.family,
    weight: override.weight ?? clampWeight(baseWeight + definition.weightOffset),
    size: override.size ?? baseSize,
    lineHeight: override.lineHeight ?? round(baseLineHeight + definition.lineHeightOffset, 3),
    letterSpacing: override.letterSpacing ?? round(baseTracking + definition.letterSpacingOffset, 4),
    uppercase: definition.uppercase === true,
    overridden: {
      weight: override.weight !== undefined,
      size: override.size !== undefined,
      lineHeight: override.lineHeight !== undefined,
      letterSpacing: override.letterSpacing !== undefined,
    },
  };
}

export function resolveTypeRoles(context: TypeRoleContext): Record<TypeRoleId, ResolvedTypeRole> {
  return Object.fromEntries(
    TYPE_ROLE_IDS.map((id) => [id, resolveTypeRole(id, context)]),
  ) as Record<TypeRoleId, ResolvedTypeRole>;
}

export function isTypeRoleId(value: unknown): value is TypeRoleId {
  return typeof value === 'string' && (TYPE_ROLE_IDS as readonly string[]).includes(value);
}

/** CSS custom properties consumed by the preview type helpers. */
export function typeRoleCssVariables(
  roles: Record<TypeRoleId, ResolvedTypeRole>,
): Record<string, string> {
  const variables: Record<string, string> = {};

  for (const id of TYPE_ROLE_IDS) {
    const role = roles[id];
    variables[`--role-${id}-weight`] = String(role.weight);
    variables[`--role-${id}-size`] = `${role.size}px`;
    variables[`--role-${id}-lh`] = String(role.lineHeight);
    variables[`--role-${id}-ls`] = `${role.letterSpacing}em`;
  }

  return variables;
}

/** Distinct weights each family must load, sorted ascending. */
export function collectRoleWeights(
  roles: Record<TypeRoleId, ResolvedTypeRole>,
): Record<TypeRoleFamily, number[]> {
  const sets: Record<TypeRoleFamily, Set<number>> = { heading: new Set(), body: new Set() };

  for (const id of TYPE_ROLE_IDS) {
    sets[roles[id].family].add(roles[id].weight);
  }

  return {
    heading: [...sets.heading].sort((a, b) => a - b),
    body: [...sets.body].sort((a, b) => a - b),
  };
}

/** Returns a copy of the pair that also requests every weight the roles use. */
export function withRoleWeights(pair: FontPair, weights: Record<TypeRoleFamily, readonly number[]>): FontPair {
  return {
    ...pair,
    heading: { ...pair.heading, extraWeights: weights.heading },
    body: { ...pair.body, extraWeights: weights.body },
  };
}

export type TypeRoleWarningCode =
  | 'size-small'
  | 'thin-small'
  | 'tight-leading'
  | 'loose-leading'
  | 'clipped-leading'
  | 'tight-tracking'
  | 'wide-tracking'
  | 'many-weights';

export type TypeRoleWarning = {
  code: TypeRoleWarningCode;
  roleId: TypeRoleId | null;
  message: string;
};

const MAX_WEIGHTS_PER_FAMILY = 3;

/** Readability and loading checks. Pure: returns messages, never throws. */
export function validateTypeRoles(
  roles: Record<TypeRoleId, ResolvedTypeRole>,
): TypeRoleWarning[] {
  const warnings: TypeRoleWarning[] = [];

  for (const id of TYPE_ROLE_IDS) {
    const role = roles[id];
    const isText = role.family === 'body' && !role.uppercase;
    const name = role.label;

    if (role.size < 11) {
      warnings.push({ code: 'size-small', roleId: id, message: `${name}: ${role.size}px es difícil de leer. Usa 11px o más.` });
    }
    if (role.weight < 400 && role.size < 14) {
      warnings.push({ code: 'thin-small', roleId: id, message: `${name}: un peso ${role.weight} a ${role.size}px pierde contraste.` });
    }
    if (role.lineHeight < 0.95) {
      warnings.push({ code: 'clipped-leading', roleId: id, message: `${name}: interlineado ${role.lineHeight} puede cortar ascendentes y descendentes.` });
    } else if (isText && role.lineHeight < 1.3 && role.id !== 'label') {
      warnings.push({ code: 'tight-leading', roleId: id, message: `${name}: interlineado ${role.lineHeight} es justo para texto corrido. Prueba 1.4 o más.` });
    } else if (role.family === 'heading' && role.lineHeight > 1.5) {
      warnings.push({ code: 'loose-leading', roleId: id, message: `${name}: interlineado ${role.lineHeight} separa demasiado las líneas de un titular.` });
    }
    if (role.letterSpacing < -0.04) {
      warnings.push({ code: 'tight-tracking', roleId: id, message: `${name}: tracking ${role.letterSpacing}em hace que las letras se toquen.` });
    } else if (role.letterSpacing > (role.uppercase ? 0.16 : 0.08)) {
      warnings.push({ code: 'wide-tracking', roleId: id, message: `${name}: tracking ${role.letterSpacing}em está muy abierto.` });
    }
  }

  const weights = collectRoleWeights(roles);
  for (const family of ['heading', 'body'] as const) {
    if (weights[family].length > MAX_WEIGHTS_PER_FAMILY) {
      warnings.push({
        code: 'many-weights',
        roleId: null,
        message: `${family === 'heading' ? 'Titular' : 'Cuerpo'} carga ${weights[family].length} pesos (${weights[family].join(', ')}). Cada peso suma peso a la página.`,
      });
    }
  }

  return warnings;
}

/** Clamps a field to its limits; returns `undefined` when the input is not a finite number. */
export function clampTypeRoleValue(field: TypeRoleField, value: number): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  const limits = TYPE_ROLE_LIMITS[field];
  const clamped = clamp(value, limits.min, limits.max);
  return field === 'weight' ? Math.round(clamped / 100) * 100 : round(clamped, field === 'size' ? 0 : 3);
}

/** Applies a patch to one override; `undefined` values clear the field. */
export function applyTypeOverridePatch(
  current: TypeRoleOverride | undefined,
  patch: Partial<Record<TypeRoleField, number | undefined>>,
): TypeRoleOverride {
  const next: TypeRoleOverride = { ...current };

  for (const field of Object.keys(patch) as TypeRoleField[]) {
    const raw = patch[field];
    const value = raw === undefined ? undefined : clampTypeRoleValue(field, raw);

    if (value === undefined) {
      delete next[field];
    } else {
      next[field] = value;
    }
  }

  return next;
}

/** Reads the four numeric fields of untrusted data, clamped to their limits. */
export function sanitizeTypeOverride(entry: unknown): TypeRoleOverride {
  const result: TypeRoleOverride = {};

  if (typeof entry !== 'object' || entry === null) {
    return result;
  }

  for (const field of ['weight', 'size', 'lineHeight', 'letterSpacing'] as const) {
    const raw = (entry as Record<string, unknown>)[field];
    const clamped = typeof raw === 'number' ? clampTypeRoleValue(field, raw) : undefined;
    if (clamped !== undefined) {
      result[field] = clamped;
    }
  }

  return result;
}

/** Applies a patch; empty roles are removed. */
export function patchTypeRoleOverrides(
  overrides: TypeRoleOverrides,
  id: TypeRoleId,
  patch: Partial<Record<TypeRoleField, number | undefined>>,
): TypeRoleOverrides {
  const next = applyTypeOverridePatch(overrides[id], patch);
  const { [id]: _removed, ...rest } = overrides;

  return Object.keys(next).length === 0 ? rest : { ...rest, [id]: next };
}

/** Validates untrusted data (storage, share links) into safe overrides. */
export function parseTypeRoleOverrides(value: unknown): TypeRoleOverrides {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const result: TypeRoleOverrides = {};

  for (const [key, entry] of Object.entries(value)) {
    const clean = sanitizeTypeOverride(entry);
    if (isTypeRoleId(key) && Object.keys(clean).length > 0) {
      result[key] = clean;
    }
  }

  return result;
}
