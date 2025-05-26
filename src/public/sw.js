/* eslint-disable no-restricted-globals */
const CACHE_NAME = 'StoryApp-V1';

// Daftar asset yang akan dicaching (Application Shell)
const assetsToCache = [
  './',
  './index.html',
  './app.bundle.js',
  './app.webmanifest',
  './sw.bundle.js',
  // Icons
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  // Static assets
  './favicon.png',
  './images/default-placeholder.svg',
  // Styles and fonts
  './styles/main.css',
  './styles/responsive.css',
  // External resources
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap',
];

// Cache helper functions
const CacheHelper = {
  async cachingAppShell(requests) {
    const cache = await this._openCache();
    await cache.addAll(requests);
  },

  async deleteOldCache() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name !== CACHE_NAME)
        .map((filteredName) => caches.delete(filteredName)),
    );
  },

  async revalidateCache(request) {
    const url = new URL(request.url);

    // Skip cache for API requests
    if (this._isApiRequest(request)) {
      return this._fetchRequest(request);
    }

    // For navigation requests, always try network first
    if (request.mode === 'navigate') {
      try {
        const networkResponse = await fetch(request);
        return networkResponse;
      } catch (error) {
        const cache = await this._openCache();
        return cache.match('./index.html');
      }
    }

    try {
      const cache = await this._openCache();
      const cachedResponse = await cache.match(request);

      if (cachedResponse) {
        // Return cached response and update cache in background
        this._fetchRequest(request)
          .then((networkResponse) => {
            if (networkResponse) {
              cache.put(request, networkResponse.clone());
            }
          })
          .catch(console.error);

        return cachedResponse;
      }

      // If not in cache, try network
      const networkResponse = await this._fetchRequest(request);
      return networkResponse;
    } catch (error) {
      console.error('Cache/fetch error:', error);
      
      // Return offline page for navigation requests
      if (request.mode === 'navigate') {
        const cache = await this._openCache();
        return cache.match('./index.html');
      }

      return new Response('Network error happened', {
        status: 404,
        statusText: 'Network error happened',
      });
    }
  },

  _isApiRequest(request) {
    return request.url.includes('story-api.dicoding.dev');
  },

  async _openCache() {
    return caches.open(CACHE_NAME);
  },

  async _fetchRequest(request) {
    try {
      const response = await fetch(request);
      
      // For API requests, we don't cache
      if (this._isApiRequest(request)) {
        return response;
      }

      // For other requests, cache if successful
      if (response.ok) {
        const cache = await this._openCache();
        cache.put(request, response.clone());
      }

      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
};

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('Installing Service Worker ...');
  event.waitUntil(CacheHelper.cachingAppShell([...assetsToCache]));
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('Activating Service Worker ...');
  event.waitUntil(CacheHelper.deleteOldCache());
  self.clients.claim();
});

// Fetch Request
self.addEventListener('fetch', (event) => {
  event.respondWith(CacheHelper.revalidateCache(event.request));
});

// Push Notification Handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Received push notification');

  let notificationData = {
    title: 'Story App Notification',
    body: 'Ada pembaruan baru',
  };

  try {
    const payload = event.data.text();
    if (payload) {
      const jsonData = JSON.parse(payload);
      if (jsonData.title) notificationData.title = jsonData.title;
      if (jsonData.options && jsonData.options.body) notificationData.body = jsonData.options.body;
    }
  } catch (error) {
    console.error('Error parsing notification:', error);
  }

  const options = {
    body: notificationData.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options),
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();
  
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