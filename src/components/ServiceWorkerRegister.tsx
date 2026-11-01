'use client';

import { useEffect } from 'react';

/** Registers the offline service worker in production only, so dev hot reload is never cached. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an enhancement; the app works without it.
    });
  }, []);

  return null;
}
