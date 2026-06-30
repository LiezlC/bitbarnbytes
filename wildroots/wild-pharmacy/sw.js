/* Wild Pharmacy service worker — offline shell.
   Caches the same-origin shell (index.html, stations.json, scenes, plates,
   assets) so the labyrinth opens offline. Cross-origin media (Cloudinary
   clips/audio) and /api/ oracle calls always go to the network. */
const CACHE = "wildpharmacy-v1";
const CORE = [
  "./", "index.html", "stations.json", "manifest.webmanifest",
  "assets/favicon.svg", "assets/learning-loop.png", "assets/og.jpg",
  "assets/icon-192.png", "assets/icon-512.png",
  "scenes/riddle-door.jpg", "scenes/sir-didymus.jpg", "scenes/stair-stack.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;      // Cloudinary etc -> network
  if (url.pathname.includes("/api/")) return;       // oracle calls -> network
  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); }
        return res;
      }).catch(() => caches.match("index.html"))
    )
  );
});
