// Entrada de Inspira Core (backoffice.html, que nginx sirve para /backoffice*).
//
// Hasta el 09/10/2026 Core arrancaba desde src/main.jsx, la entrada de la web
// pública: el equipo descargaba la portada, la cabecera, el pie, el catálogo
// de servicios y el enrutador del sitio solo para que App.jsx viera la ruta y
// cargara BackofficeApp. Ahora Core tiene su propia entrada con lo que
// necesita, y nada más.
//
// Lo que se copia de main.jsx, y por qué:
//   · el cerco de errores (a /api/errores-web y a Core → Configuración → Errores),
//   · la recarga tras un despliegue (vite:preloadError) y su marca,
//   · los enlaces de WhatsApp que abren la aplicación en el móvil,
//   · el «pageshow» de la bfcache (no enseñar una sesión que ya se cerró),
//   · `beforeinstallprompt` retenido, como en la web (sin él, Chrome sacaría
//     su barra de instalar por su cuenta),
//   · el service worker,
//   · ErrorRaiz y el diálogo (InspiraDialog: avisos y confirmaciones),
//   · el aviso de cookies y la vista de página para Analytics, como hacía
//     App.jsx en /backoffice.
// Lo que no: el AuthProvider del asesorado (/auth/me), el BrowserRouter y la
// web pública.
//
// En desarrollo Vite sirve index.html también para /backoffice, y App.jsx
// sigue montando BackofficeApp en diferido: las dos entradas funcionan.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// El orden de los estilos es el de antes: la base y el tema de Tailwind, la
// ergonomía compartida y, detrás, los de Core (los importa BackofficeApp).
import "./styles/globals.css";
import "./styles/ergonomia.css";

import BackofficeApp from "./pages/backoffice/BackofficeApp";
import InspiraDialog from "./components/ui/InspiraDialog";
import ErrorRaiz from "./components/common/ErrorRaiz";
import CookieConsent from "./components/legal/CookieConsent";
import { vigilarVersionNueva, marcarArranqueCorrecto } from "./lib/versionNueva";
import { vigilarEnlacesWhatsApp } from "./lib/whatsapp";
import { vigilarErroresGlobales } from "./lib/reportarError";
import { registrarVista } from "./lib/analytics";

// Los errores que no pasan por ningún cerco (un clic, una promesa sin catch)
// también llegan a Core → Configuración → Errores.
vigilarErroresGlobales();

// Si llegamos hasta aquí, la aplicación cargó: se limpia la marca de recarga
// para que un fallo futuro pueda volver a intentarlo.
marcarArranqueCorrecto();
vigilarVersionNueva();

// Los enlaces de WhatsApp abren la aplicación, también en el móvil.
vigilarEnlacesWhatsApp();

// Recargar al volver con «atrás» desde la caché de retroceso (bfcache), para
// no mostrar datos de una sesión que ya se cerró. Va aquí y no en el HTML: la
// CSP no permite scripts en línea.
window.addEventListener("pageshow", (e) => {
  if (e.persisted) window.location.reload();
});

// Como en la web: se retiene el aviso de instalar para que el navegador no
// saque su propia barra.
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__inspiraEventoInstalar = e;
});

// La aplicación instalable: el service worker sirve los trozos con hash desde
// caché. Solo en producción: en desarrollo cachearía código que cambia.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Vista de página en cada cambio de pantalla, como hacía App.jsx (solo cuenta
// si hay consentimiento de analítica; si no, no hace nada).
window.addEventListener("popstate", () => registrarVista(window.location.pathname));

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorRaiz>
      <BackofficeApp />
      <CookieConsent />
    </ErrorRaiz>
    <InspiraDialog />
  </StrictMode>
);
