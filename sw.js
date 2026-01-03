const CACHE_NAME = 'hader-v1';
const assets = ['./', './index.html', 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(assets)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});