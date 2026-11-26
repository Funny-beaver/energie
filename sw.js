// Garde l'app disponible hors ligne. Aucune donnée n'est envoyée.
// Réseau d'abord (pour recevoir les mises à jour), copie locale si pas d'internet.
const CACHE = "energie-v7";
const FILES = ["./", "index.html", "app.js", "style.css", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(new Request(e.request.url, {cache: "no-cache"}))
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
      .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match("index.html")))
  );
});
