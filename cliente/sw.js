// static/cliente/sw.js — Service Worker Oficial CilindroYa Cliente
const CACHE_NAME = 'cilindroya-cliente-v8';
const ASSETS_TO_CACHE = [
  '/cliente',
  '/static/cliente/index.html',
  '/static/cliente/manifest.json',
  '/static/style.css',
  '/favicon.ico',
  '/static/favicon.svg',
  '/static/assets/cilindro_azul.webp?v=5',
  '/static/assets/cilindro_tomate.webp?v=5',
  '/static/assets/cilindro_amarillo.webp?v=5'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones a APIs dinámicas y WebSockets
  if (event.request.url.includes('/api/') || event.request.url.includes('/ws/')) {
    return;
  }
  
  // Network-First para navegación (/cliente) para que los cambios se reflejen de inmediato
  if (event.request.mode === 'navigate' || event.request.url.includes('/cliente')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate para recursos estáticos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
