import { CURATED_DESIGN_STYLES, type DesignStyle } from './curatedStyles';

export type { DesignStyle };

export const DESIGN_STYLES: DesignStyle[] = CURATED_DESIGN_STYLES;

/** Fixed filter chips for the inspiration modal (order = UI order). */
export const INSPIRATION_FILTER_TAGS = [
  'cálido',
  'frío',
  'minimal',
  'editorial',
  'vibrante',
] as const;

export type InspirationFilterTag = (typeof INSPIRATION_FILTER_TAGS)[number];

export function collectMoods(styles: DesignStyle[]): string[] {
  const moods = new Set<string>();

  for (const style of styles) {
    for (const mood of style.mood) {
      moods.add(mood);
    }
  }

  return [...moods].sort((a, b) => a.localeCompare(b, 'es'));
}

export function filterStylesByMood(
  styles: DesignStyle[],
  mood: string | null,
): DesignStyle[] {
  if (mood === null) {
    return styles;
  }

  return styles.filter((style) => style.mood.includes(mood));
}

export function formatInspirationFilterLabel(tag: string): string {
  if (tag.length === 0) {
    return tag;
  }

  return tag.charAt(0).toUpperCase() + tag.slice(1);
}

export function formatInspirationCountLabel(visibleCount: number, totalCount: number): string {
  if (visibleCount === totalCount) {
    return `${totalCount} estilos disponibles · toca cualquiera para cargar`;
  }

  return `${visibleCount} de ${totalCount} estilos · toca cualquiera para cargar`;
}
