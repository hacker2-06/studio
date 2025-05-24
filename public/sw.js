
// A very basic service worker for PWA installability

const CACHE_NAME = 'smartsheet-cache-v1';
const urlsToCache = [
  '/',
  // Add other critical assets you want to pre-cache if known
  // For Next.js, asset names can be hashed, making manual caching complex.
  // Tools like next-pwa handle this better by integrating with the build process.
];

// Install event: opens a cache and adds core assets to it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache urls during install:', error, urlsToCache);
      })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      }
    )
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
