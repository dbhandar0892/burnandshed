/** Remove only this app's old shell worker; never touch messaging workers. */
export async function cleanupLegacyAppWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(registrations.filter(registration => {
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      if (!worker) return false;
      const url = new URL(worker.scriptURL);
      return url.origin === window.location.origin && url.pathname === '/sw.js';
    }).map(registration => registration.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.filter(key => key.startsWith('burn-and-shed-'))
        .map(key => caches.delete(key)));
    }
  } catch (error) {
    // Cleanup is best-effort and must never prevent the app from rendering.
    console.warn('Legacy app cache cleanup unavailable', error);
  }
}