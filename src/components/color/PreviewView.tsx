'use client';

import type { PaletteRoleId } from '@lib/color/rolePalette';
import { buildPreviewTokens } from '@lib/color/previewTokens';

import { useRolePalette } from '@/context/RolePaletteContext';
import { PreviewBrandCard } from '@/components/color/preview/PreviewBrandCard';
import { PreviewContrastWarnings } from '@/components/color/preview/PreviewChrome';
import { PreviewRoleTarget } from '@/components/color/preview/PreviewRoleTarget';
import {
  PreviewChips,
  PreviewNavbar,
  PreviewSupportBanner,
} from '@/components/color/preview/PreviewSupportSections';

export type PreviewViewProps = {
  onEditRole?: (role: PaletteRoleId, element: HTMLElement) => void;
};

export function PreviewView({ onEditRole }: PreviewViewProps) {
  const { rolePalette, activeTheme } = useRolePalette();

  if (!rolePalette) {
    return null;
  }

  const tokens = buildPreviewTokens(rolePalette);

  return (
    <PreviewRoleTarget
      role="fondo"
      onEditRole={onEditRole}
      className="min-h-0 flex-1 overflow-y-auto"
      style={{ backgroundColor: rolePalette.fondo.hex }}
    >
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-5 pb-8 sm:gap-5 sm:p-8">
        {tokens.warnings.length > 0 ? <PreviewContrastWarnings warnings={tokens.warnings} /> : null}
        <PreviewBrandCard
          palette={rolePalette}
          tokens={tokens}
          activeTheme={activeTheme}
          onEditRole={onEditRole}
        />
        <PreviewSupportBanner palette={rolePalette} tokens={tokens} onEditRole={onEditRole} />
        <PreviewNavbar
          palette={rolePalette}
          tokens={tokens}
          activeTheme={activeTheme}
          onEditRole={onEditRole}
        />
        <PreviewChips palette={rolePalette} tokens={tokens} onEditRole={onEditRole} />
      </div>
    </PreviewRoleTarget>
  );
}
