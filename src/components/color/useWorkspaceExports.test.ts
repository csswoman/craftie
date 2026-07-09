import { describe, expect, it, vi } from 'vitest';

import type { GeneratedPalette } from '@lib/color/formulas';
import type { PaletteSeeds, RolePalette, RoleSlot } from '@lib/color/rolePalette';
import type { ThemesConfig } from '@lib/color/themePalette';

import { useWorkspaceExports } from './useWorkspaceExports';
import { downloadTextFile } from '@/lib/browser/download';

vi.mock('@/lib/browser/download', () => ({
  downloadTextFile: vi.fn(() => ({ ok: true })),
}));

function slot(role: keyof RolePalette, hex: string): RoleSlot {
  return { role, hex, name: role, source: 'extracted' };
}

const generatedPalette: GeneratedPalette = {
  primary: '#3366FF',
  accent: '#FFAA00',
  surface: '#FFFFFF',
  onSurface: '#111111',
  neutralLight: '#EEEEEE',
  neutralDark: '#222222',
};

const rolePalette: RolePalette = {
  fondo: slot('fondo', '#FFFFFF'),
  superficie: slot('superficie', '#F7F7F7'),
  texto: slot('texto', '#111111'),
  primario: slot('primario', '#3366FF'),
  secundario: slot('secundario', '#88AAFF'),
  acento: slot('acento', '#FFAA00'),
  borde: slot('borde', '#DDDDDD'),
};

const seeds: PaletteSeeds = {
  primario: '#3366FF',
  acento: '#FFAA00',
  neutralHue: 250,
};

const themes: ThemesConfig = {
  light: { overrides: {} },
  dark: { overrides: {} },
};

function useSetup() {
  const setError = vi.fn();
  const setStatusMessage = vi.fn();
  const exports = useWorkspaceExports({
    generatedPalette,
    rolePalette,
    seeds,
    selectedPairing: null,
    setError,
    setStatusMessage,
    themes,
  });

  return { exports, setError, setStatusMessage };
}

describe('useWorkspaceExports', () => {
  it('downloads DESIGN.md and reports success', () => {
    const { exports, setError, setStatusMessage } = useSetup();

    exports.handleExportDesignMd();

    expect(downloadTextFile).toHaveBeenCalledWith(
      'DESIGN.md',
      expect.stringContaining('# Design System: Craftie Kit'),
      'text/markdown;charset=utf-8',
    );
    expect(setError).toHaveBeenCalledWith(null);
    expect(setStatusMessage).toHaveBeenCalledWith('DESIGN.md descargado en tu carpeta de descargas.');
  });

  it('surfaces download errors', () => {
    vi.mocked(downloadTextFile).mockReturnValueOnce({ ok: false, error: 'blocked' });
    const { exports, setError, setStatusMessage } = useSetup();

    exports.handleExportBrandKit();

    expect(setError).toHaveBeenCalledWith('blocked');
    expect(setStatusMessage).toHaveBeenCalledWith(null);
  });
});
