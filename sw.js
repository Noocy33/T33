const CACHE_NAME = "tasy-t33-cache-v9";
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
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
