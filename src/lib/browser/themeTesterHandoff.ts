/**
 * Hands a theme stylesheet from the studio to the theme tester page. The CSS
 * is parked in localStorage, the tester reads it once and clears it. Every
 * access is guarded so a locked-down browser falls back to the sample theme.
 */

const HANDOFF_KEY = 'craftie:theme-tester-css';
export const THEME_TESTER_PATH = '/tools/theme-tester';

export function openThemeTester(css: string): void {
  try {
    window.localStorage.setItem(HANDOFF_KEY, css);
  } catch {
    // Ignore: the tester opens with its sample theme.
  }
  try {
    window.open(THEME_TESTER_PATH, '_blank', 'noopener');
  } catch {
    // Ignore: popup blocked or non-browser context.
  }
}

/** Returns the handed-off CSS, if any, and removes it so a reload starts clean. */
export function takeThemeTesterHandoff(): string | null {
  try {
    const css = window.localStorage.getItem(HANDOFF_KEY);
    if (css !== null) window.localStorage.removeItem(HANDOFF_KEY);
    return css;
  } catch {
    return null;
  }
}
