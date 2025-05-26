/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification('Story App Notification', options),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const clickedNotification = event.notification;
  
  const urlToOpen = new URL('/', self.location.origin).href;

  const promiseChain = clients.matchAll({
    type: 'window',
    includeUncontrolled: true,
  })
    .then((windowClients) => {
      let matchingClient = null;

      for (const windowClient of windowClients) {
        if (windowClient.url === urlToOpen) {
          matchingClient = windowClient;
          break;
        }
      }

      if (matchingClient) {
        return matchingClient.focus();
      }
      
      return clients.openWindow(urlToOpen);
    });

  event.waitUntil(promiseChain);
}); 