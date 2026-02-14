const CACHE_NAME = 'studio344-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/blog.html',
  '/projects.html',
  '/contact.html',
  '/styles.css',
  '/script.js',
  '/blog.js',
  '/i18n.js',
  '/assets/js/ui.js',
  '/assets/js/cookie-consent.js',
  '/locales/ja.json',
  '/locales/en.json',
  '/projects.json',
  '/assets/posts/list.json',
  '/assets/logo-black.png'
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and CDN requests
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
