const CACHE_NAME = 'storyapp-v3';

const APP_SHELL = [
  '/submission-intermediate-web/',
  '/submission-intermediate-web/index.html',
  '/submission-intermediate-web/scripts/index.js',
  '/submission-intermediate-web/styles/styles.css',
  '/submission-intermediate-web/images/logo.png',
  '/submission-intermediate-web/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match('/submission-intermediate-web/index.html')
        )
      );
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = { title: 'TEST MASUK', body: 'Push tanpa payload' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Story Baru', {
      body: data.body || 'Ada cerita baru',
      icon: '/submission-intermediate-web/images/logo.png',
      data: {
        url: '/submission-intermediate-web/#/',
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url || '/submission-intermediate-web/#/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});