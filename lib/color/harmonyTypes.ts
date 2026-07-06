export type HarmonyType =
  | 'monochromatic'
  | 'analogous'
  | 'complementary'
  | 'triadic'
  | 'split_complementary'
  | 'tetradic'
  | 'achromatic'
  | 'mixed';

export type HarmonyConfidence = 'strong' | 'weak' | 'none';

export type OutlierDimension = 'hue' | 'lightness' | 'chroma';

export interface OklchColor {
  l: number;
  c: number;
  h: number | undefined;
}

export interface PaletteColorEntry {
  hex: string;
  oklch: OklchColor;
}

export interface PaletteOklchStats {
  meanHue: number | null;
  meanLightness: number;
  meanChroma: number;
  chromaticCount: number;
}

export interface PaletteOutlier {
  hex: string;
  dimensions: OutlierDimension[];
  oklch: OklchColor;
}

export interface HarmonySuggestion {
  originalHex: string;
  suggestedHex: string;
  reason: string;
}

export interface HarmonyPattern {
  type: HarmonyType;
  confidence: HarmonyConfidence;
  anchors: number[];
}

export interface HarmonyAnalysis {
  colors: PaletteColorEntry[];
  stats: PaletteOklchStats;
  pattern: HarmonyPattern;
  outliers: PaletteOutlier[];
  suggestions: HarmonySuggestion[];
}
