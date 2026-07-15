import type { AppliedTypography } from './typeState';

export type CustomFontSource = 'google' | 'local';
export type CustomFontRole = 'heading' | 'body';

export type CustomFont = {
  id: string;
  family: string;
  source: CustomFontSource;
  /** Present for local uploads (display only). */
  fileName?: string;
};

export function normalizeFontFamilyName(family: string): string {
  return family.trim().replace(/\s+/g, ' ');
}

export function createCustomFontId(source: CustomFontSource, family: string): string {
  return `${source}:${normalizeFontFamilyName(family).toLowerCase()}`;
}

export function createCustomFont(input: {
  family: string;
  source: CustomFontSource;
  fileName?: string;
}): CustomFont {
  const family = normalizeFontFamilyName(input.family);

  return {
    id: createCustomFontId(input.source, family),
    family,
    source: input.source,
    ...(input.fileName ? { fileName: input.fileName } : null),
  };
}

export function upsertCustomFont(list: CustomFont[], next: CustomFont): CustomFont[] {
  const without = list.filter((entry) => entry.id !== next.id);
  return [...without, next];
}

/** Assign a custom family to one role; result is always hybrid (no catalog id). */
export function applyCustomFamilyToRole(
  applied: AppliedTypography,
  family: string,
  role: CustomFontRole,
): AppliedTypography {
  const nextFamily = normalizeFontFamilyName(family);

  if (role === 'heading') {
    return {
      ...applied,
      catalogPairId: null,
      headingFamily: nextFamily,
    };
  }

  return {
    ...applied,
    catalogPairId: null,
    bodyFamily: nextFamily,
  };
}

export function parseCustomFontsSession(raw: string | null): CustomFont[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((entry) => {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        typeof (entry as CustomFont).family !== 'string' ||
        ((entry as CustomFont).source !== 'google' && (entry as CustomFont).source !== 'local')
      ) {
        return [];
      }

      const source = (entry as CustomFont).source;
      const family = normalizeFontFamilyName((entry as CustomFont).family);
      if (family === '') {
        return [];
      }

      const fileName =
        typeof (entry as CustomFont).fileName === 'string'
          ? (entry as CustomFont).fileName
          : undefined;

      return [createCustomFont({ family, source, fileName })];
    });
  } catch {
    return [];
  }
}
