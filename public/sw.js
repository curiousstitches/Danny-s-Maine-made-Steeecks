// Steeecks Chat — service worker: handles push notifications and lets the app install as a PWA.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'New chat message', body: '', url: '/chat-admin.html' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/chat-admin.html', session_id: data.session_id || null },
    vibrate: [200, 100, 200],
    tag: data.session_id || undefined,
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/chat-admin.html';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('chat-admin.html') && 'focus' in client) {
          client.postMessage({ type: 'notification-click', session_id: event.notification.data?.session_id });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
