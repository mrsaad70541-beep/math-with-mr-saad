const C = 'saad-public-v55';
self.addEventListener('install', (e) => e.waitUntil(
  caches.open(C).then((c) => c.addAll(['./','./index.html','./style.css?v=28','./data.js?v=9','./lab.js?v=3','./app.js?v=46','./manifest.webmanifest','./icon.svg','./favicon.svg'])).then(() => self.skipWaiting())
));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => e.respondWith(
  fetch(new Request(e.request, {cache: 'reload'})).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request))
));
