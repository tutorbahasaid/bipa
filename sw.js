/* ============ SERVICE WORKER - TUTOR BAHASA (BIPA) ============ */
const CACHE_VERSION = 'tutorbahasa-v49';
const CORE_CACHE  = CACHE_VERSION;              // HTML, JS, CSS, fonts
const AUDIO_CACHE = 'tutorbahasa-audio-v1';     // mp3 files (persist across versions)

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',

  // ── BIPA Kids ──
  './colors/',
  './colors/index.html',
  './hobbies/',
  './hobbies/index.html',
  './numbers/',
  './numbers/index.html',
  './daily-activities/',
  './daily-activities/index.html',
  './jobs/',
  './jobs/index.html',

  // ── BIPA Adult ──
  './satu-langkah/',
  './satu-langkah/index.html',
  './word-builder/',
  './word-builder/index.html',
  './cek-kemahiran/',
  './cek-kemahiran/index.html'
];

// Audio files are NOT in CORE_ASSETS.
// They are cached lazily on first play (see fetch handler).
// AUDIO_CACHE persists across app updates — bump AUDIO_CACHE name
// manually ONLY when audio files change (e.g. re-recorded).

function isAudioRequest(url) {
  return /\/audio\/.*\.(mp3|m4a|wav|ogg)(\?.*)?$/i.test(url);
}

/* 1. INSTALL: Simpan file inti ke cache */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CORE_CACHE).then((cache) => {
      console.log('📦 Caching core assets:', CORE_ASSETS.length);
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

/* 2. ACTIVATE: Hapus cache lama (audio cache dipertahankan) */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CORE_CACHE && key !== AUDIO_CACHE)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

/* 3. FETCH: Cache First → Network Fallback → Dynamic Caching */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  const cacheName = isAudioRequest(event.request.url) ? AUDIO_CACHE : CORE_CACHE;

  event.respondWith(
    caches.open(cacheName).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            cache.put(event.request, responseClone);
          }
          return networkResponse;
        }).catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      });
    })
  );
});
