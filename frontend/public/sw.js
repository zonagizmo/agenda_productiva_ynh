// Service Worker — requerido para que el navegador ofrezca instalar la PWA
// Estrategia: network-first para HTML (siempre fresco), cache-first para assets hasheados (Vite)
const CACHE = 'agenda-productiva-v2';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // API: siempre red
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  const url = new URL(e.request.url);

  // Assets con hash de Vite (/assets/): cache-first (el hash garantiza frescura)
  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // HTML, sw.js, manifest, iconos: network-first con fallback a caché
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
