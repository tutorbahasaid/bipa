/* ============ SERVICE WORKER - TUTOR BAHASA (BIPA KIDS) ============ */
const CACHE_VERSION = 'tutorbahasa-v34';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './colors/',
  './colors/index.html',
  './hobbies/',
  './hobbies/index.html',
  './numbers/',
  './numbers/index.html',
  './daily-activities/',
  './daily-activities/index.html',
  './jobs/',
  './jobs/index.html'
];

/* 1. INSTALL: Simpan file inti ke cache */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('📦 Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* 2. ACTIVATE: Hapus cache lama jika ada update versi */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

/* 3. FETCH: Strategi "Cache First, Network Fallback" + Dynamic Caching */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
