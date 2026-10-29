export const ONBOARDING_DISMISS_KEY = 'craftie:onboarding-dismissed';

/** Whether the first-load onboarding hint has been dismissed before. */
export function readOnboardingDismissed(): boolean {
  try {
    return window.localStorage.getItem(ONBOARDING_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** Persist the onboarding hint dismissal so it never shows again. */
export function writeOnboardingDismissed(dismissed: boolean): void {
  try {
    if (dismissed) {
      window.localStorage.setItem(ONBOARDING_DISMISS_KEY, '1');
    } else {
      window.localStorage.removeItem(ONBOARDING_DISMISS_KEY);
    }
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
}
