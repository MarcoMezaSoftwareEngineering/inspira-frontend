import { startTransition } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";

import Raiz from "./Raiz.jsx";
import "./styles/globals.css";
// La escala y el tacto compartidos por las dos mitades del producto.
// Va aquí y no en cada shell a propósito: importada desde BackofficeApp y
// desde PanelCliente a la vez, Vite la metía en un fragmento perezoso
// —el de Documentos— y los estilos no existían hasta entrar en esa
// pantalla. En la entrada está siempre, y pesa 6 KB.
import "./styles/ergonomia.css";

import { vigilarVersionNueva, marcarArranqueCorrecto } from "./lib/versionNueva";
import { vigilarEnlacesWhatsApp } from "./lib/whatsapp";
import { vigilarErroresGlobales } from "./lib/reportarError";

// Los errores que no pasan por ningún cerco (un clic, una promesa sin catch)
// también llegan a Core → Configuración → Errores.
vigilarErroresGlobales();

// Si llegamos hasta aquí, la aplicación cargó: se limpia la marca de recarga
// para que un fallo futuro pueda volver a intentarlo.
marcarArranqueCorrecto();
vigilarVersionNueva();

// Los enlaces de WhatsApp abren la aplicación, también dentro del navegador
// incrustado de Instagram o TikTok, donde wa.me se queda en su pantalla.
vigilarEnlacesWhatsApp();

// Recargar al volver con el botón "atrás" desde la caché de retroceso (bfcache),
// para que el panel no muestre datos de una sesión que ya cerró.
//
// Vivía como <script> suelto dentro de index.html, y era el único motivo por el
// que la CSP del sitio necesitaba 'unsafe-inline' en script-src por nuestra
// parte. Aquí entra en el bundle y deja de serlo.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});

// Chrome puede lanzar `beforeinstallprompt` antes de que cargue el trozo del
// panel: se guarda aquí y AvisoInstalarApp lo recoge al cargarse.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__inspiraEventoInstalar = e;
});

// La aplicación instalable: el service worker sirve la cáscara al instante y
// los trozos con hash desde caché. Solo en producción: en desarrollo
// cachearía código que cambia cada minuto.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}


// El HTML pre-renderizado de las entradas del blog (scripts/html-compartir.mjs)
// es para los rastreadores: la aplicación pinta lo suyo en #root.
document.getElementById("prerender")?.remove();

// Las páginas públicas principales llegan con su contenido ya pintado
// (scripts/prerender.mjs, 09/10/2026): <html data-prerender="/ruta"> dice
// cuál trae el HTML. Si es la de la barra de direcciones, React lo hidrata:
// conserva lo pintado, sin parpadeo ni animación repetida. Si no lo es (nginx
// sirve index.html, con la portada dentro, a /mapa, /panel o un 404), #root
// sigue escondido (la guarda del <head> solo lo enseña en su ruta): se vacía
// y se monta de cero, como siempre. En los dos casos se marca
// data-prerender-ok, por si la guarda no llegó a correr.
const raiz = document.getElementById("root");
const html = document.documentElement;

if (html.dataset.prerender === window.location.pathname && raiz.hasChildNodes()) {
  html.setAttribute("data-prerender-ok", "");
  // En una transición, React hidrata a ratos y cede el hilo entre uno y otro:
  // la página ya se ve y, si alguien toca o desplaza mientras tanto, responde.
  // Sin ella, hidratar la portada era una tarea larga de casi un segundo en un
  // móvil lento (TBT de Lighthouse). Es lo que hace Next.js.
  startTransition(() => {
    hydrateRoot(raiz, <Raiz prerenderizada />, {
      // Un desajuste entre el servidor y el navegador no rompe nada: React
      // repinta ese trozo y sigue. Sin este manejador, React lo pasa a
      // window.reportError y vigilarErroresGlobales lo mandaría a Core →
      // Configuración → Errores, que es para fallos de verdad.
      onRecoverableError(error, info) {
        console.warn("[prerender] desajuste al hidratar:", error, info?.componentStack || "");
      },
    });
  });
} else {
  raiz.textContent = "";
  html.removeAttribute("data-aviso-cookies-oculto");
  html.setAttribute("data-prerender-ok", "");
  createRoot(raiz).render(<Raiz />);
}
