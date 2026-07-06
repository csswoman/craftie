import { describe, expect, it } from 'vitest';

import {
  formatShortcutKeys,
  isGenerateShortcut,
  isShortcutsHelpShortcut,
  shouldIgnoreStudioShortcut,
} from './studioShortcuts';

function mockElement(
  tagName: string,
  options: { contentEditable?: boolean; type?: string } = {},
) {
  return {
    tagName: tagName.toUpperCase(),
    isContentEditable: options.contentEditable ?? false,
    type: options.type,
  } as unknown as HTMLElement;
}

describe('studioShortcuts', () => {
  it('detects generate shortcut', () => {
    expect(isGenerateShortcut({ key: 'Enter', ctrlKey: true, metaKey: false })).toBe(true);
    expect(isGenerateShortcut({ key: 'Enter', ctrlKey: false, metaKey: true })).toBe(true);
    expect(isGenerateShortcut({ key: 'Enter', ctrlKey: false, metaKey: false })).toBe(false);
  });

  it('detects shortcuts help key outside inputs', () => {
    const event = {
      key: '?',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      target: mockElement('body'),
    } as unknown as KeyboardEvent;

    expect(isShortcutsHelpShortcut(event)).toBe(true);
  });

  it('ignores shortcuts help inside text inputs', () => {
    expect(shouldIgnoreStudioShortcut(mockElement('input', { type: 'text' }))).toBe(true);
    expect(shouldIgnoreStudioShortcut(mockElement('button'))).toBe(false);
  });

  it('formats mod enter for display', () => {
    expect(formatShortcutKeys('mod+Enter')).toMatch(/Enter/);
    expect(formatShortcutKeys('Esc')).toBe('Esc');
  });
});
