// public/service-worker.js

// This is a minimal service worker. Its purpose is to exist,
// which allows the PWA registration to succeed and removes the error.

self.addEventListener('install', (event) => {
  console.log('Service worker installed.');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated.');
});

self.addEventListener('fetch', (event) => {
  // This service worker does not intercept fetch requests.
  // It allows the browser to handle them as it normally would.
  event.respondWith(fetch(event.request));
});