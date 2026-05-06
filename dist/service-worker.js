const CACHE_NAME = 'storyapp-v1';

const BASE = self.location.pathname.replace('service-worker.js', '');

const APP_SHELL = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'images/logo.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match(BASE)
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
    data = { title: 'Story Baru', body: 'Ada update terbaru' };
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: BASE + 'images/logo.png',
      data: {
        url: BASE + '#/',
      },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || BASE;

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