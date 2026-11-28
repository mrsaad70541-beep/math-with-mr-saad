const C = 'saad-public-v167';
self.addEventListener('install', (e) => e.waitUntil(
  caches.open(C).then((c) => c.addAll(['./','./index.html','./style.css?v=63','./data.js?v=10','./lab.js?v=14','./theorems.js?v=50','./mathx.js?v=1','./app.js?v=103','./qr.js?v=1','./manifest.webmanifest','./icon.svg','./favicon.svg','./s/g1-l0-v0.html','./s/g2-l0-v0.html','./s/g2-l0-v1.html','./s/g3-l0-v0.html','./s/g3-l0-v1.html','./s/g3-l0-v2.html','./s/lesson-g1-l0.html','./s/lesson-g2-l0.html','./s/lesson-g3-l0.html'])).then(() => self.skipWaiting())
));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', (e) => {
  // Reader: never route PDFs or Range requests through the cache-writing handler (would copy whole books into Cache Storage; 206 cannot be cached).
  // Also bypass anything requested BY the reader (page or its pdf.js worker): extensionless download endpoints are valid book links.
  let fromReader = false;
  try { fromReader = e.request.mode !== 'navigate' && new URL(e.request.referrer).pathname.indexOf('/reader/') >= 0; } catch (x) { /* no referrer */ }
  if (e.request.headers.has('range') || fromReader || /\.pdf(\?|#|$)/i.test(e.request.url)) return;
  e.respondWith(

  fetch(new Request(e.request, {cache: 'reload'})).then((r) => {
    // Never persist a PDF/binary download even when it arrives as a full 200 from an extensionless URL; only cache complete normal responses.
    const ct = r.headers.get('content-type') || '', cd = r.headers.get('content-disposition') || '';
    if ((r.status === 200 || r.type === 'opaque') && !/pdf|octet-stream/i.test(ct) && !/attachment/i.test(cd)) { const cp = r.clone(); caches.open(C).then((c) => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then((m) => m || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
);
});
