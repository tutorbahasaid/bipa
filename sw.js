/* ============ SERVICE WORKER - BIPA QUIZ ============ */
const CACHE_VERSION = 'tutorbahasa-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  // Audio - Words
  './audio/membaca.mp3', './audio/berenang.mp3', './audio/melukis.mp3',
  './audio/bola.mp3', './audio/menari.mp3', './audio/menyanyi.mp3',
  './audio/lego.mp3', './audio/menulis.mp3', './audio/makan.mp3',
  './audio/tidur.mp3', './audio/belajar.mp3',
  // Audio - Sentences
  './audio/dia-membaca.mp3', './audio/dia-berenang.mp3', './audio/dia-melukis.mp3',
  './audio/dia-bola.mp3', './audio/dia-menari.mp3', './audio/dia-menyanyi.mp3',
  './audio/dia-lego.mp3', './audio/dia-menulis.mp3', './audio/dia-makan.mp3',
  './audio/dia-tidur.mp3', './audio/dia-belajar.mp3',
  // Audio - Prefixes
  './audio/suka.mp3', './audio/tidak_suka.mp3',
  // Images
  './images/membaca.png', './images/berenang.png', './images/melukis.png',
  './images/bola.png', './images/menari.png', './images/menyanyi.png',
  './images/lego.png', './images/menulis.png', './images/makan.png',
  './images/tidur.png', './images/belajar.png',
  // Icons
  './images/icon-192.png', './images/icon-512.png',
  // External CDN
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn('⚠️ Failed to cache:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — cache first, then network
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (event.request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});