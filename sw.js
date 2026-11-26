const C = 'saad-public-v115';
self.addEventListener('install', (e) => e.waitUntil(
  caches.open(C).then((c) => c.addAll(['./','./index.html','./style.css?v=44','./data.js?v=10','./lab.js?v=12','./theorems.js?v=27','./app.js?v=70','./manifest.webmanifest','./icon.svg','./favicon.svg'])).then(() => self.skipWaiting())
));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => e.respondWith(
  fetch(new Request(e.request, {cache: 'reload'})).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request))
));
