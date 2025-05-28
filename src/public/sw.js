/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'StoryApp-V1';
const API_CACHE_NAME = 'StoryApp-API-V1';

// Daftar asset yang akan di-cache
const assetsToCache = [
  './',
  './index.html',
  './app.webmanifest',
  './favicon.png',
  './assets/index.css',
  './assets/index.js',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './images/default-placeholder.svg'
];

// Install event - mengisi cache
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing....');
  
  // Skip waiting agar service worker langsung diaktifkan
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching App Shell...');
        return cache.addAll(assetsToCache)
          .catch((error) => {
            console.error('Service Worker: Gagal caching App Shell:', error);
            throw error;
          });
      })
  );
});

// Activate event - membersihkan cache lama
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating....');
  
  // Mengambil alih halaman yang sudah terbuka
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => {
              console.log('Service Worker: Menghapus cache lama:', name);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// Fetch event - menghandle request
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip jika bukan GET request
  if (request.method !== 'GET') {
    return;
  }

  // Handle API image requests
  if (request.url.includes('dicoding.dev/images')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request)
            .then((networkResponse) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            })
            .catch(() => {
              return caches.match('./images/default-placeholder.svg');
            });
        });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).catch(() => {
        // Jika offline dan request adalah HTML
        if (request.headers.get('Accept').includes('text/html')) {
          return caches.match('./index.html');
        }
        
        // Jika offline dan request adalah gambar
        if (request.destination === 'image') {
          return caches.match('./images/default-placeholder.svg');
        }

        throw new Error('Network error');
      });
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Received push');
  const options = {
    body: event.data ? event.data.text() : 'Ada pembaruan baru!',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [100, 50, 100]
  };

  event.waitUntil(
    self.registration.showNotification('Story App Notification', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
}); 