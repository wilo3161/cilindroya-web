// static/pwa/sw.js — Service Worker blindado para repartidores con modo Offline y resiliencia en carretera
const CACHE_NAME = 'cilindroya-shared-pilot-20261024-v4';

const PRECACHE_ASSETS = [
  '/chofer',
  '/pwa',
  '/static/pwa/index.html',
  '/static/pwa/manifest.json',
  '/static/pwa/db.js',
  '/static/style.css?v=3.2',
  '/static/style.css',
  '/static/assets/gamification_badges.js',
  '/static/brand/app-symbol.svg?v=flame-pin-20261004',
  '/static/favicon.svg?v=flame-pin-20261004',
  '/static/favicon.png?v=flame-pin-20261004',
  '/static/favicon.ico?v=flame-pin-20261004',
  '/static/cliente/icon-192.png',
  '/static/cliente/icon-512.png'
];

// Instalación: Pre-cachear assets esenciales con tolerancia a fallos individuales
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] Pre-cacheando assets del repartidor...');
      // Usar allSettled para no abortar si un favicon opcional no responde
      await Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] No se pudo precachear:', url, err.message);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activación: Purgar cachés viejas y tomar control inmediato
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch adaptable:
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Manejo de Navegación (HTML de la PWA)
  if (req.mode === 'navigate' || (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(async () => {
          console.log('[SW] Modo offline: respondiendo con index.html precacheado');
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match('/static/pwa/index.html') || await cache.match('/chofer') || await cache.match('/pwa');
          if (cached) return cached;
          return new Response('<h1>CilindroYa / CilindroYa</h1><p>Modo Fuera de Línea activo.</p>', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Rutas de API
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((response) => response)
        .catch(async () => {
          // Si es entrega o completado, retornar respuesta de contingencia JSON
          if (url.pathname.includes('/entrega/completar')) {
            return new Response(JSON.stringify({
              offline: true,
              success: false,
              detail: 'Sin conexión a internet en ruta. Guardado en cola local IndexedDB.'
            }), {
              headers: { 'Content-Type': 'application/json' },
              status: 503
            });
          }

          if (url.pathname.includes('/entregas')) {
            const cache = await caches.open(CACHE_NAME);
            const cachedRes = await cache.match(req);
            if (cachedRes) return cachedRes;
          }

          return new Response(JSON.stringify({
            offline: true,
            error: 'Sin conexión a internet en ruta'
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        })
    );
    return;
  }

  // 3. Recursos de CDNs externos (Leaflet, Tailwind, GSAP, Google Fonts, Canvas Confetti)
  const isCdn = url.hostname.includes('unpkg.com') ||
                url.hostname.includes('tailwindcss.com') ||
                url.hostname.includes('cdnjs.cloudflare.com') ||
                url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com') ||
                url.hostname.includes('jsdelivr.net');

  if (isCdn) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        }).catch(() => cached);
      })
    );
    return;
  }

  // 4. Recursos estáticos locales (Cache-First con actualización de fondo)
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // Actualizar en fondo si es posible
        fetch(req).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      }).catch(async () => {
        // Fallback a favicon o index si falla
        return caches.match('/static/pwa/index.html');
      });
    })
  );
});
