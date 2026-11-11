const CACHE = 'cksc-trophy-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/cksc-logo.png',
  '/assets/raffle-poster.jpg',
  '/assets/gladiators-logo.jpg',
  '/assets/md-strikers-logo.png'
];

// Install — cache assets individually so a single 404 doesn't kill the whole SW
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      Promise.all(
        ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('SW: failed to cache', url, err))
        )
      )
    )
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — serve from cache, fall back to network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
