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
 *
 * Los trozos se purgan (09/10/2026). Hasta entonces se guardaban para
 * siempre: cada despliegue cambia sus nombres y la caché crecía 2,4 MB por
 * versión sin soltar nunca nada. Ahora cada trozo lleva la fecha de su último
 * uso, y tras una navegación CON red se tiran los que llevan una semana sin
 * usarse (el servidor tampoco guarda más la versión anterior), con un tope
 * de trozos por si acaso. Sin red no se purga nunca, y lo que enlaza la
 * página que acaba de llegar no se toca: abrir sin conexión la última versión
 * que se vio sigue funcionando igual que antes.
 */
const CACHE = "inspira-v1";
const CASCARA = "/index.html";

const SELLO = "x-inspira-usado";   // cabecera propia con la fecha de último uso
const HORA = 60 * 60 * 1000;
const CADUCIDAD = 7 * 24 * HORA;    // una semana sin usarse: fuera
const REFRESCO = 12 * HORA;         // un acierto renueva la fecha, como mucho cada 12 h
const TOPE = 250;                   // y nunca más de 250 trozos
let ultimaPurga = 0;

/** Guarda un trozo con la fecha de uso de ahora. */
function guardarTrozo(req, r) {
  const cabeceras = new Headers(r.headers);
  cabeceras.set(SELLO, String(Date.now()));
  return r.blob()
    .then((cuerpo) => new Response(cuerpo, { status: r.status, statusText: r.statusText, headers: cabeceras }))
    .then((sellada) => caches.open(CACHE).then((c) => c.put(req, sellada)));
}

/**
 * Tira los trozos que llevan una semana sin usarse y, si aún quedan más de
 * TOPE, los más antiguos. `protegidos`: las rutas /assets/ que enlaza la
 * página que acaba de llegar, que no se tocan aunque sean viejas.
 */
function purgar(protegidos) {
  const ahora = Date.now();
  if (ahora - ultimaPurga < 6 * HORA) return Promise.resolve();
  ultimaPurga = ahora;
  return caches.open(CACHE).then(async (c) => {
    const trozos = [];
    for (const req of await c.keys()) {
      const ruta = new URL(req.url).pathname;
      if (!ruta.startsWith("/assets/") || protegidos.has(ruta)) continue;
      const r = await c.match(req);
      // Los guardados antes de esta versión no tienen fecha: cuentan como viejos.
      trozos.push({ req, usado: Number(r && r.headers.get(SELLO)) || 0 });
    }
    trozos.sort((a, b) => b.usado - a.usado);
    const fuera = trozos.filter((t, i) => ahora - t.usado > CADUCIDAD || i >= TOPE);
    await Promise.all(fuera.map((t) => c.delete(t.req)));
  });
}

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
          // La cáscara guardada es la de index.html. La de /backoffice es otro
          // HTML (Inspira Core, con su manifiesto): no debe pisarla.
          // Solo HTML: abrir una guía en PDF también es una navegación, y sin
          // este filtro el PDF quedaba guardado como cáscara del panel.
          const esHtml = (r.headers.get("content-type") || "").includes("text/html");
          if (r.ok && esHtml && !url.pathname.startsWith("/backoffice")) {
            caches.open(CACHE).then((c) => c.put(CASCARA, r.clone())).catch(() => {});
          }
          // Con red y una página nueva en la mano (la web o Core), es el
          // momento de soltar los trozos que ya no usa nadie.
          if (r.ok && esHtml) {
            r.clone().text()
              .then((html) => purgar(new Set(html.match(/\/assets\/[^"'\s<>)]+/g) || [])))
              .catch(() => {});
          }
          return r;
        })
        .catch(() => caches.match(CASCARA)),
    );
    return;
  }

  // Trozos con hash: caché primero. Son inmutables.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) {
          // Se usa: se renueva su fecha para que la purga no lo tire.
          const usado = Number(hit.headers.get(SELLO)) || 0;
          if (Date.now() - usado > REFRESCO) guardarTrozo(req, hit.clone()).catch(() => {});
          return hit;
        }
        return fetch(req).then((r) => {
          // Solo respuestas completas: un 206 (vídeo por rangos) no se guarda.
          if (r.status === 200) guardarTrozo(req, r.clone()).catch(() => {});
          return r;
        });
      }),
    );
    return;
  }

  // Iconos, manifiesto, favicon: lo guardado, y se refresca por detrás.
  // (Los avisos al móvil están al final del archivo, aparte de la caché.)
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

/*
 * Avisos al móvil (Web Push estándar con VAPID, sin servicios de pago).
 *
 * El servidor manda {title, body, url, tag}. La etiqueta agrupa: un aviso
 * nuevo del mismo expediente sustituye al anterior en la bandeja en vez de
 * apilar varios iguales. La URL es siempre una ruta del panel.
 */
self.addEventListener("push", (e) => {
  let datos = {};
  try { datos = e.data ? e.data.json() : {}; } catch {
    datos = { body: e.data ? e.data.text() : "" };
  }
  const titulo = datos.title || "Inspira Legal";
  e.waitUntil(
    self.registration.showNotification(titulo, {
      body: datos.body || "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: datos.tag || undefined,
      // Con etiqueta repetida, que vuelva a sonar: es una novedad, no la misma.
      renotify: Boolean(datos.tag),
      data: { url: datos.url || "/panel" },
    }),
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  // Solo rutas de este sitio: una URL de fuera no se abre desde un aviso.
  let destino = "/panel";
  try {
    const u = new URL((e.notification.data && e.notification.data.url) || "/panel", self.location.origin);
    if (u.origin === self.location.origin) destino = u.pathname + u.search + u.hash;
  } catch { /* URL rara: al panel */ }

  e.waitUntil((async () => {
    const abiertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    // Si el panel ya está abierto, se usa esa ventana en vez de abrir otra.
    const panel = abiertas.find((c) => new URL(c.url).pathname.startsWith("/panel"));
    if (panel) {
      await panel.focus();
      if ("navigate" in panel) {
        try { await panel.navigate(destino); return; } catch { /* sin control del SW: se abre aparte */ }
      } else {
        return;
      }
    }
    await self.clients.openWindow(destino);
  })());
});
