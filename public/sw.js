// PassTech offline support.
//
// Strategy: network-first, falling back to cache. Every successful same-origin GET
// response gets cached as it's fetched, so a normal online visit progressively caches
// everything the app actually uses (HTML shell, hashed JS/CSS bundles, icons, frog
// images) without needing a hand-maintained precache list that'd go stale on every
// build. Offline, those cached responses serve instead; an uncached navigation falls
// back to the cached "/" shell so the app still opens instead of showing the browser's
// offline page.
//
// The /api/ route (photo-tag scanning) is intentionally never cached — it's a POST to a
// paid vision API and simply isn't available offline, which is expected and fine.

const CACHE_NAME = "passtech-v1";

// Hash-free, stable public/ assets that aren't guaranteed to be fetched during normal
// browsing before the user goes offline — several are only rendered conditionally (the
// verdict banner shows one of three flags depending on computed state; category icons
// only render once a mode with the equipment form is opened), so an incidental first
// visit could easily miss some of these. The app is small, so just precache all of them
// up front instead of hoping the runtime cache-what's-fetched strategy catches everything.
const PRECACHE_URLS = [
  "/",
  "/frog-racing-logo.png",
  "/frog-green-flag.jpg",
  "/frog-yellow-flag.jpg",
  "/frog-red-flag.jpg",
  "/frog-helmet.jpg",
  "/frog-hans.png",
  "/frog-firesuit.png",
  "/frog-gloves.png",
  "/frog-shoes.jpg",
  "/frog-undergarment.png",
  "/frog-arm-restraints.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
