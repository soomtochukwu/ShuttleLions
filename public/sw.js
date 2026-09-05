// ShuttleLions Progressive Web App Service Worker (W3C Standard)
const CACHE_NAME = 'shuttlelions-v3';

const STATIC_ASSETS = [
  '/',
  '/favicon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/screenshot-narrow.png',
  '/icons/screenshot-wide.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache prefetch skipped non-critical asset:', err);
      });
    })
  );
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
    })
  );
  self.clients.claim();
});

// Stale-While-Revalidate for static assets, Network-first for navigation
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never intercept non-GET requests or auth/API endpoints
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('/auth/') ||
    request.url.includes('supabase.co')
  ) {
    return;
  }

  // Static assets: Cache First with Network Revalidation
  if (
    request.url.includes('/_next/static/') ||
    request.url.includes('/icons/') ||
    request.url.includes('/images/') ||
    request.url.endsWith('.png') ||
    request.url.endsWith('.svg') ||
    request.url.endsWith('.jpg') ||
    request.url.endsWith('.jpeg') ||
    request.url.endsWith('.webp') ||
    request.url.endsWith('.css') ||
    request.url.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigation routes: Network First, falling back to cached offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const fallback = await caches.match('/');
        if (fallback) return fallback;
        return new Response(
          '<!DOCTYPE html><html><head><title>Offline - ShuttleLions</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="background:#0A0F0A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;padding:20px;"><div><h1 style="color:#00E676;font-size:24px;margin-bottom:8px;">ShuttleLions Offline</h1><p style="color:#8A9A8A;font-size:14px;">You are currently offline. Please reconnect to view live badminton schedules and athlete rosters.</p></div></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      })
    );
  }
});

// Push notification listener
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'ShuttleLions Alert';
    const options = {
      body: data.message || data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/dashboard/schedule',
      },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
