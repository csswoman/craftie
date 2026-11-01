import type { WorkspaceHeaderProps } from '@/components/layout/WorkspaceHeader';

import type { useSelectColorsWorkspaceController } from './useSelectColorsWorkspaceController';

type WorkspaceController = ReturnType<typeof useSelectColorsWorkspaceController>;

/** Maps the controller's export handlers to the header's `onExport*` props. */
export function workspaceExportProps(
  workspace: WorkspaceController,
): Pick<
  WorkspaceHeaderProps,
  | 'canExport'
  | 'onExportCss'
  | 'onCopyCss'
  | 'onExportTokensJson'
  | 'onExportFigmaTokens'
  | 'onExportTailwind'
  | 'onExportShadcn'
  | 'onExportDesignMd'
  | 'onExportBrandKit'
  | 'onExportImage'
  | 'onCopyShareLink'
> {
  return {
    canExport: workspace.canExport,
    onExportCss: workspace.handleExportCss,
    onCopyCss: workspace.handleCopyCss,
    onExportTokensJson: workspace.handleExportTokensJson,
    onExportFigmaTokens: workspace.handleExportFigmaTokens,
    onExportTailwind: workspace.handleExportTailwind,
    onExportShadcn: workspace.handleExportShadcn,
    onExportDesignMd: workspace.handleExportDesignMd,
    onExportBrandKit: workspace.handleExportBrandKit,
    onExportImage: workspace.handleExportImage,
    onCopyShareLink: workspace.handleCopyShareLink,
  };
}
