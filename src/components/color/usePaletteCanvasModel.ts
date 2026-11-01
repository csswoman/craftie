'use client';

import { useMemo } from 'react';
import {
  buildRolePaletteColumnsWithContrast,
  getRolePaletteContrastWarnings,
  hasRolePaletteContrastFailure,
} from '@lib/color/rolePaletteContrast';
import { PALETTE_ROLE_ORDER } from '@lib/color/rolePalette';
import type { SelectableColor } from '@lib/color/selectableColors';
import type { ThemeId } from '@lib/color/themePalette';

import { useRolePalette } from '@/context/RolePaletteContext';

import type { ThemeContrastReport } from './PaletteCanvasNotices';

/** Derived data the palette canvas renders: role columns, paint colors and contrast reports. */
export function usePaletteCanvasModel(paletteCatalog: SelectableColor[]) {
  const { rolePalette, previewRolePalette, counterpartRolePalette, activeTheme } = useRolePalette();
  const liveRolePalette = previewRolePalette ?? rolePalette;

  const columns = useMemo(
    () => (liveRolePalette ? buildRolePaletteColumnsWithContrast(liveRolePalette) : []),
    [liveRolePalette],
  );

  const paintColors = useMemo<SelectableColor[]>(() => {
    if (liveRolePalette) {
      return PALETTE_ROLE_ORDER.map((role) => ({
        id: `role-${role}`,
        name: liveRolePalette[role].name,
        hex: liveRolePalette[role].hex,
        group: 'bold',
      }));
    }
    return paletteCatalog;
  }, [liveRolePalette, paletteCatalog]);

  const contrastReports = useMemo<ThemeContrastReport[]>(() => {
    const reports: ThemeContrastReport[] = [];
    const entries: Array<[ThemeId, typeof liveRolePalette]> = [
      [activeTheme, liveRolePalette],
      [activeTheme === 'light' ? 'dark' : 'light', counterpartRolePalette],
    ];
    for (const [theme, palette] of entries) {
      if (palette) {
        reports.push({
          theme,
          failure: hasRolePaletteContrastFailure(palette),
          warnings: getRolePaletteContrastWarnings(palette),
        });
      }
    }
    return reports;
  }, [activeTheme, counterpartRolePalette, liveRolePalette]);

  return { columns, paintColors, contrastReports, hasPalette: columns.length > 0 && liveRolePalette !== null };
}
