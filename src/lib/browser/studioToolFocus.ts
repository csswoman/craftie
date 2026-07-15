export type StudioToolSectionFocusId = 'image' | 'source' | 'adjustments' | 'typography';

export const STUDIO_TOOL_FOCUS_EVENT = 'craftie:focus-studio-tool';

export function requestStudioToolFocus(sectionId: StudioToolSectionFocusId) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(STUDIO_TOOL_FOCUS_EVENT, {
      detail: { sectionId },
    }),
  );
}
