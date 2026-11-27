const C = 'saad-public-v164';
self.addEventListener('install', (e) => e.waitUntil(
  caches.open(C).then((c) => c.addAll(['./','./index.html','./style.css?v=56','./data.js?v=10','./lab.js?v=14','./theorems.js?v=50','./mathx.js?v=1','./app.js?v=75','./qr.js?v=1','./manifest.webmanifest','./icon.svg','./favicon.svg','./s/g1-l0-v0.html','./s/g2-l0-v0.html','./s/g2-l0-v1.html','./s/g3-l0-v0.html','./s/g3-l0-v1.html','./s/g3-l0-v2.html','./s/lesson-g1-l0.html','./s/lesson-g2-l0.html','./s/lesson-g3-l0.html'])).then(() => self.skipWaiting())
));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => e.respondWith(
  fetch(new Request(e.request, {cache: 'reload'})).then((r) => { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match(e.request).then((m) => m || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
));
