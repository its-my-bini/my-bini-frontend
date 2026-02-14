/* Minimal service worker.
 * This is enough to satisfy "installable" criteria in most browsers.
 * You can extend it later with caching/offline support.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first passthrough.
  event.respondWith(fetch(event.request));
});
