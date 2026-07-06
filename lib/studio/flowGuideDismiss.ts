export const FLOW_GUIDE_DISMISS_KEY = 'craftie-flow-guide-dismissed';

export function readFlowGuideDismissed(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(FLOW_GUIDE_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeFlowGuideDismissed(dismissed: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (dismissed) {
      window.localStorage.setItem(FLOW_GUIDE_DISMISS_KEY, '1');
    } else {
      window.localStorage.removeItem(FLOW_GUIDE_DISMISS_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
