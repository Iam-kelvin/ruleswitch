export function registerPwa(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline caching is progressive enhancement; gameplay remains usable in the loaded session.
    });
  });
}
