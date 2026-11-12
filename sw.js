const CACHE = 'cksc-trophy-v5';
const ASSETS = [
  '/assets/cksc-logo.png',
  '/assets/raffle-poster.jpg',
  '/assets/gladiators-logo.jpg',
  '/assets/md-strikers-logo.png',
  '/assets/khalasis-logo.png',
  '/assets/charlotte-minnals-logo.png',
  '/assets/ny-challengers-logo.png',
  '/assets/abu-kuttan.png',
  '/assets/vguard-insurance.jpg'
  // CCT2026.mp4 excluded — too large for SW pre-cache
];

// Install — pre-cache only images (not HTML/SW/manifest — those stay fresh)
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

// Fetch strategy:
// - HTML / SW / manifest → network first (always fresh), fall back to cache
// - Images / everything else → cache first (fast), fall back to network
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isHTML = e.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');
  const isSW = url.pathname.endsWith('sw.js') || url.pathname.endsWith('manifest.json');

  if (isHTML || isSW) {
    // Network first — always get latest, cache as backup
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache first — images load instantly, network fills gaps
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request))
    );
  }
});
