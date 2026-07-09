import { StudioToolsPanel } from '@/components/color/StudioToolsPanel';
import {
  buildStudioToolSections,
  type StudioToolsInput,
} from '@/components/color/studioToolSections';

export type SelectColorsWorkspaceSidebarProps = StudioToolsInput;

export function SelectColorsWorkspaceSidebar(props: SelectColorsWorkspaceSidebarProps) {
  const sections = buildStudioToolSections(props, 'sidebar');

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <StudioToolsPanel>
        {sections.map((section) => (
          <div
            key={section.id}
            className={section.id === 'typography' ? 'flex min-h-0 flex-1 flex-col' : 'shrink-0'}
          >
            {section.content}
          </div>
        ))}
      </StudioToolsPanel>
    </div>
  );
}

export function useSelectColorsWorkspaceToolSections(
  props: SelectColorsWorkspaceSidebarProps,
  target: 'sidebar' | 'mobile' = 'sidebar',
) {
  return buildStudioToolSections(props, target);
}
