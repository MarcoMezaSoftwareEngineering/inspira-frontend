/*
 * El service worker de la aplicación instalable.
 *
 * Hace dos cosas y nada más: sirve al instante los trozos con hash desde la
 * caché (no cambian nunca: si cambia el contenido, cambia el nombre), y deja
 * abrir la aplicación sin red con la última cáscara que se vio.
 *
 * La página en sí —index.html— va SIEMPRE a la red primero. Aquí se despliega
 * a menudo, y una cáscara vieja servida desde caché apuntaría a trozos que ya
 * no existen. Solo si no hay red se usa la copia guardada.
 */
const CACHE = "inspira-v1";
const CASCARA = "/index.html";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.add(new Request(CASCARA, { cache: "reload" })))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // la API va aparte, siempre a la red

  // Navegaciones: red primero; sin red, la cáscara guardada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok) caches.open(CACHE).then((c) => c.put(CASCARA, r.clone())).catch(() => {});
          return r;
        })
        .catch(() => caches.match(CASCARA)),
    );
    return;
  }

  // Trozos con hash: caché primero. Son inmutables.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((r) => {
        if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone())).catch(() => {});
        return r;
      })),
    );
    return;
  }

  // Iconos, manifiesto, favicon: lo guardado, y se refresca por detrás.
  if (/\.(png|svg|webmanifest|ico)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const red = fetch(req).then((r) => {
          if (r.ok) caches.open(CACHE).then((c) => c.put(req, r.clone())).catch(() => {});
          return r;
        }).catch(() => hit);
        return hit || red;
      }),
    );
  }
});
