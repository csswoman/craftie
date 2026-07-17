import { describe, expect, it, vi } from 'vitest';

import type { RolePalette, RoleSlot } from '@lib/color/rolePalette';
import { generatePaletteFromRolePalette } from '@lib/color/rolePalette';
import type { SemanticTokenOverrides } from '@lib/color/semanticTokens';

import { useWorkspaceExports } from './useWorkspaceExports';
import { downloadTextFile } from '@/lib/browser/download';

vi.mock('@/lib/browser/download', () => ({
  downloadTextFile: vi.fn(() => ({ ok: true })),
}));

function slot(role: keyof RolePalette, hex: string): RoleSlot {
  return { role, hex, name: role, source: 'extracted' };
}

const rolePalette: RolePalette = {
  fondo: slot('fondo', '#FFFFFF'),
  superficie: slot('superficie', '#F7F7F7'),
  texto: slot('texto', '#111111'),
  primario: slot('primario', '#3366FF'),
  secundario: slot('secundario', '#88AAFF'),
  acento: slot('acento', '#FFAA00'),
  borde: slot('borde', '#DDDDDD'),
};

const tokenOverridesByTheme = { light: {}, dark: {} };

function useSetup(overrides?: {
  rolePalette?: RolePalette | null;
  tokenOverridesByTheme?: { light: SemanticTokenOverrides; dark: SemanticTokenOverrides };
  exportStatusTokenOverrides?: SemanticTokenOverrides;
}) {
  const setError = vi.fn();
  const setStatusMessage = vi.fn();
  const exports = useWorkspaceExports({
    rolePalette: overrides && 'rolePalette' in overrides ? overrides.rolePalette! : rolePalette,
    tokenOverridesByTheme: overrides?.tokenOverridesByTheme ?? tokenOverridesByTheme,
    exportStatusTokenOverrides: overrides?.exportStatusTokenOverrides,
    selectedPairing: null,
    setError,
    setStatusMessage,
  });

  return { exports, setError, setStatusMessage };
}

describe('useWorkspaceExports', () => {
  it('downloads DESIGN.md and reports success', () => {
    const { exports, setError, setStatusMessage } = useSetup();

    exports.handleExportDesignMd();

    expect(downloadTextFile).toHaveBeenCalledWith(
      'DESIGN.md',
      expect.stringContaining('# Design System: craftie-tokens'),
      'text/markdown;charset=utf-8',
    );
    expect(setError).toHaveBeenCalledWith(null);
    expect(setStatusMessage).toHaveBeenCalledWith('DESIGN.md descargado en tu carpeta de descargas.');
  });

  it('downloads tokens.css with English semantic custom properties', () => {
    const { exports } = useSetup();

    exports.handleExportCss();

    expect(downloadTextFile).toHaveBeenCalledWith(
      'tokens.css',
      expect.stringContaining('--color-primary'),
      'text/css;charset=utf-8',
    );
  });

  it('downloads tokens.json with W3C color.primary', () => {
    const { exports } = useSetup();

    exports.handleExportTokensJson();

    expect(downloadTextFile).toHaveBeenCalledWith(
      'tokens.json',
      expect.any(String),
      'application/json;charset=utf-8',
    );
    const content = vi.mocked(downloadTextFile).mock.calls.at(-1)?.[1] as string;
    const json = JSON.parse(content);
    expect(json.color.primary).toBeDefined();
  });

  it('downloads figma-tokens.json with light.color.primary', () => {
    const { exports } = useSetup();

    exports.handleExportFigmaTokens();

    expect(downloadTextFile).toHaveBeenCalledWith(
      'figma-tokens.json',
      expect.any(String),
      'application/json;charset=utf-8',
    );
    const content = vi.mocked(downloadTextFile).mock.calls.at(-1)?.[1] as string;
    const json = JSON.parse(content);
    expect(json.light.color.primary).toBeDefined();
  });

  it('blocks export when rolePalette is null', () => {
    const { exports } = useSetup({ rolePalette: null });

    expect(exports.canExport).toBe(false);
    expect(exports.exportBlockedReason).toMatch(/^Falta:/);
  });

  it('includes confirmed status colors in tokens.css', () => {
    const { exports } = useSetup({
      exportStatusTokenOverrides: { success: '#1E9E5A', error: '#D93636' },
    });

    exports.handleExportCss();

    const content = vi.mocked(downloadTextFile).mock.calls.at(-1)?.[1] as string;
    expect(content).toContain('--color-success: #1E9E5A;');
    expect(content).toContain('--color-error: #D93636;');
  });

  it('includes confirmed status colors in tokens.json', () => {
    const { exports } = useSetup({
      exportStatusTokenOverrides: { success: '#1E9E5A', error: '#D93636' },
    });

    exports.handleExportTokensJson();

    const content = vi.mocked(downloadTextFile).mock.calls.at(-1)?.[1] as string;
    const json = JSON.parse(content);
    expect(json.color.success.$value).toBe('#1E9E5A');
    expect(json.color.error.$value).toBe('#D93636');
  });

  it('does not mutate the original light overrides when merging status colors', () => {
    const originalOverrides = { light: {}, dark: {} };
    const { exports } = useSetup({
      tokenOverridesByTheme: originalOverrides,
      exportStatusTokenOverrides: { success: '#1E9E5A' },
    });

    exports.handleExportCss();

    expect(originalOverrides.light).toEqual({});
    expect(originalOverrides.light).not.toHaveProperty('success');
  });

  it('derives brand-kit palette from the export rolePalette, not a separate review palette', () => {
    const lightExportPalette: RolePalette = {
      fondo: slot('fondo', '#FAFAFA'),
      superficie: slot('superficie', '#F0F0F0'),
      texto: slot('texto', '#1A1A1A'),
      primario: slot('primario', '#2266CC'),
      secundario: slot('secundario', '#6699EE'),
      acento: slot('acento', '#E6A000'),
      borde: slot('borde', '#CCCCCC'),
    };
    const { exports } = useSetup({ rolePalette: lightExportPalette });

    exports.handleExportBrandKit();

    const content = vi.mocked(downloadTextFile).mock.calls.at(-1)?.[1] as string;
    const kit = JSON.parse(content);
    const expectedPalette = generatePaletteFromRolePalette(lightExportPalette);

    expect(kit.palette).toEqual(expectedPalette);
    expect(kit.rolePalette.primario.hex).toBe('#2266CC');
    expect(kit.rolePalette.fondo.hex).toBe('#FAFAFA');
    expect(kit.palette.primary).toBe(expectedPalette.primary);
    expect(kit.palette.primary).not.toBe('#000000');
  });

  it('surfaces download errors', () => {
    vi.mocked(downloadTextFile).mockReturnValueOnce({ ok: false, error: 'blocked' });
    const { exports, setError, setStatusMessage } = useSetup();

    exports.handleExportBrandKit();

    expect(setError).toHaveBeenCalledWith('blocked');
    expect(setStatusMessage).toHaveBeenCalledWith(null);
  });
});
