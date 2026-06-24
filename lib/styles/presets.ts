import { CURATED_DESIGN_STYLES, type DesignStyle } from './curatedStyles';

export type { DesignStyle };

export const DESIGN_STYLES: DesignStyle[] = CURATED_DESIGN_STYLES;

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
