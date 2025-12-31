const cacheName = 'hader-v2';
const assets = [
  './',
  './index.html',
  './admin.html',
  './reports.html',
  './links.html',
  './manifest.json',
  './style.css'
];

// تثبيت الملفات في الذاكرة
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
});

// استرجاع الملفات بسرعة
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});