const CACHE_NAME = 'story-app-cache-v1';
const OFFLINE_URL = '/offline.html';
const API_URL = 'https://story-api.dicoding.dev';

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          OFFLINE_URL,
          '/',
          '/index.html',
          '/assets/styles/main.css',
          '/assets/images/logo.png'
        ]);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  // Skip API requests and external images
  if (requestUrl.origin === API_URL) {
    event.respondWith(fetch(request)); 
    return;
  }

  // Network first strategy for HTML documents
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, response.clone());
              return response;
            });
        })
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Cache first strategy for assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        return response || fetch(request)
          .then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200) {
              return fetchResponse;
            }

            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request.url, fetchResponse.clone());
                return fetchResponse;
              });
          });
      })
      .catch(() => {
        if (request.headers.get('Accept').includes('text/html')) {
          return caches.match(OFFLINE_URL);
        }
      })
  );
});