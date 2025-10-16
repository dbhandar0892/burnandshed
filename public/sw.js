// Minimal, safe service worker that avoids caching Vite chunks to prevent React duplication
const CACHE_NAME = 'forget-about-it-v3';
const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin GET requests
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  const pathname = url.pathname;
  const isPrecached = PRECACHE.includes(pathname);

  // Detect Vite dev/build assets and JS/CSS chunks - never cache them
  const isViteAsset =
    pathname.startsWith('/node_modules/.vite/') ||
    pathname.includes('/@react-refresh') ||
    pathname.includes('/assets/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    url.searchParams.has('v');

  if (!isPrecached || isViteAsset) {
    // Network-only for runtime/content and all module chunks
    return; // Let the default browser fetch proceed (no caching)
  }

  // Cache-first for a tiny set of safe, static app-shell files
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k))))
    )
  );
  self.clients.claim();
});
