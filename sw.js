/* Service Worker – macht die Zizo-App installierbar und offline-fähig.
   Strategie „network-first": online immer frisch, offline die letzte Kopie. */
const CACHE = "zizo-v1";
const PRECACHE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "shared/styles.css",
  "shared/kid.js",
  "topics/farben/index.html",
  "topics/zahlen/index.html",
  "topics/formen/index.html",
  "topics/dinge/index.html",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u)))).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(res => { const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
