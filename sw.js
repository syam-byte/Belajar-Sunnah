
const CACHE_PREFIX = 'belajar-sunnah-';
const CACHE_VERSION = 'v1';
const SHELL_CACHE = CACHE_PREFIX + 'shell-' + CACHE_VERSION;
const DATA_CACHE = CACHE_PREFIX + 'data-' + CACHE_VERSION;

const CORE_FILES = [
  './',
  './index.html',
  './drawable/BS_1.jpg',
  './drawable/Bs_2.jpg',
  './drawable/BelajarSunnah.9.png',
  './drawable/search.9.png',
  './fonts/Amiri-Regular.ttf',
  './fonts/MarkaziText-Regular.ttf',
  './fonts/Birds of Paradise.ttf',
  './fonts/akzidenz-grotesk-roman.woff2',
  './fonts/Lionking.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);

    await Promise.allSettled(
      CORE_FILES.map(file => cache.add(file))
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key =>
          key.startsWith(CACHE_PREFIX) &&
          key !== SHELL_CACHE &&
          key !== DATA_CACHE
        )
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (request.headers.has('range')) return;

  event.respondWith((async () => {
    const isData = /\.(json)$/i.test(url.pathname);
    const cacheName = isData ? DATA_CACHE : SHELL_CACHE;

    try {
      const response = await fetch(request);

      if (response.ok) {
        const cache = await caches.open(cacheName);

        await cache.put(request, response.clone())
          .catch(error => {
            console.warn('Cache gagal:', error);
          });
      }

      return response;

    } catch (error) {
      const cached = await caches.match(request, {
        ignoreSearch: true
      });

      if (cached) return cached;

      if (request.mode === 'navigate') {
        const halaman = await caches.match('./index.html');

        if (halaman) return halaman;
      }

      return new Response('Konten belum tersimpan untuk akses offline.', {
        status: 503,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      });
    }
  })());
});
