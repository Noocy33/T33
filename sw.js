const CACHE_NAME = "tasy-t33-cache-v14";
const ASSETS = [
  "./",
  "index.html",
  "splash.html",
  "login.html",
  "register.html",
  "T33.html",
  "manifest.webmanifest",
  "css/styles.css",
  "css/mobile.css",
  "js/auth.js",
  "js/login.js",
  "js/register.js",
  "js/scripts.js",
  "images/avatar.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const accept = request.headers.get("accept") || "";
  const isHtml = request.mode === "navigate" || accept.includes("text/html");

  if (isHtml) {
    // Evita tela antiga de login por cache: HTML vem da rede primeiro.
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
