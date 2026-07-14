import type { FontPair } from '../pairings';
import { LEGACY_FONT_PAIRS } from './legacy';
import { SANS_SANS_PAIRS } from './sansSans';
import { SANS_SERIF_PAIRS } from './sansSerif';
import { DISPLAY_SANS_PAIRS } from './displaySans';
import { MONO_SANS_PAIRS } from './monoSans';
import { FRIENDLY_PAIRS } from './friendly';
import { ACCESSIBLE_PAIRS } from './accessible';
import { SINGLE_FAMILY_PAIRS } from './singleFamily';

export const CURATED_FONT_PAIRS: FontPair[] = [
  ...LEGACY_FONT_PAIRS,
  ...SANS_SANS_PAIRS,
  ...SANS_SERIF_PAIRS,
  ...DISPLAY_SANS_PAIRS,
  ...MONO_SANS_PAIRS,
  ...FRIENDLY_PAIRS,
  ...ACCESSIBLE_PAIRS,
  ...SINGLE_FAMILY_PAIRS,
];
