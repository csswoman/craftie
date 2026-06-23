export type DesignStyle = {
  id: string;
  name: string;
  description: string;
  seeds: string[];
  mood: string[];
  thumbnailColors: string[];
};

export const DESIGN_STYLES: DesignStyle[] = [];

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
