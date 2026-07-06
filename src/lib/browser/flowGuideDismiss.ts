export const FLOW_GUIDE_DISMISS_KEY = 'craftie-flow-guide-dismissed';

export function readFlowGuideDismissed(): boolean {
  try {
    return window.localStorage.getItem(FLOW_GUIDE_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeFlowGuideDismissed(dismissed: boolean): void {
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
