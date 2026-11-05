/* ============ SERVICE WORKER - TUTOR BAHASA ============ */
const CACHE_VERSION = 'tutorbahasa-v4';

// File inti yang WAJIB disimpan saat pertama kali install
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './hobbies/',
  './hobbies/index.html',
  './numbers/',
  './numbers/index.html',
  './daily-activities/',           // ← TAMBAH
  './daily-activities/index.html'  // ← TAMBAH
];

// 1. INSTALL: Simpan file inti ke cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('📦 Caching core assets');
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Hapus cache lama jika ada update versi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Strategi "Cache First, Network Fallback" + Dynamic Caching
self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET (abaikan POST, dll)
  if (event.request.method !== 'GET') return;
  
  // Abaikan request dari ekstensi browser
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, langsung kembalikan (Offline Mode)
      if (cachedResponse) return cachedResponse;

      // Jika tidak ada di cache, ambil dari internet
      return fetch(event.request).then((networkResponse) => {
        // Simpan file baru (misal audio/gambar yang baru diakses) ke cache otomatis
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Jika internet mati DAN file tidak ada di cache, tampilkan fallback
        if (event.request.mode === 'navigate') {
          return caches.match('./hobbies/index.html'); // Fallback halaman
        }
      });
    })
  );
});
