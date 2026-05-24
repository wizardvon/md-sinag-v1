const CACHE_VERSION = "v19";
const CACHE_NAME = `sinag-cache-${CACHE_VERSION}`;

const APP_SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css?v=20260524-2",
  "./app.js?v=20260524-2",
  "./constants.js?v=20260524-2",
  "./firebase-config.js?v=20260523-2",
  "./manifest.json",
  "./assets/sinag_logo.png",
];

const HTML_DESTINATIONS = new Set(["document", "iframe"]);
const STATIC_DESTINATIONS = new Set(["style", "script", "worker", "font"]);
const IMAGE_DESTINATIONS = new Set(["image"]);
const API_HOST_PATTERNS = [
  "firestore.googleapis.com",
  "firebase.googleapis.com",
  "firebaseinstallations.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "www.googleapis.com",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS.map((asset) => new Request(asset, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
      .then(notifyClientsAboutUpdate)
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isApiRequest(url)) {
    event.respondWith(fetch(request));
    return;
  }

  if (isHtmlRequest(request)) {
    event.respondWith(networkFirst(request, "./index.html"));
    return;
  }

  if (STATIC_DESTINATIONS.has(request.destination) || isLocalStaticFile(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (IMAGE_DESTINATIONS.has(request.destination)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

function isHtmlRequest(request) {
  return HTML_DESTINATIONS.has(request.destination)
    || request.mode === "navigate"
    || request.headers.get("accept")?.includes("text/html");
}

function isLocalStaticFile(url) {
  return url.origin === self.location.origin
    && /\.(css|js|json|webmanifest|woff2?|ttf|otf)$/i.test(url.pathname);
}

function isApiRequest(url) {
  return API_HOST_PATTERNS.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

async function networkFirst(request, fallbackUrl = "") {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetchFresh(request);
    if (shouldCache(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return offlineResponse();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetchFresh(request);
    if (shouldCache(response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return offlineResponse();
  }
}

function shouldCache(response) {
  return response && (response.ok || response.type === "opaque");
}

function fetchFresh(request) {
  const url = new URL(request.url);
  if (url.origin === self.location.origin) {
    return fetch(new Request(request, { cache: "reload" }));
  }
  return fetch(request);
}

function offlineResponse() {
  return new Response("Project SINAG is offline. Reconnect to load the latest data.", {
    status: 503,
    headers: { "Content-Type": "text/plain" },
  });
}

async function notifyClientsAboutUpdate() {
  const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clientsList.forEach((client) => {
    client.postMessage({
      type: "SINAG_SW_UPDATED",
      cacheName: CACHE_NAME,
    });
  });
}
