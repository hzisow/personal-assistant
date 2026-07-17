// Henry's Brief — service worker
// App shell is cached for offline/instant load; brief DATA is always fetched
// fresh (network-first) so you never see a stale day, and encrypted blobs are
// only ever decrypted in-page.
const SHELL = "brief-shell-v1";
const SHELL_FILES = ["./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== SHELL).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // Data: network-first, no cache fallback staleness beyond last-good.
  if (url.pathname.includes("/data/")) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  // Shell: cache-first.
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request)));
});
