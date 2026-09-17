// Abrir WhatsApp de verdad, no la página intermedia.
//
// 17/09/2026. Los enlaces `wa.me` funcionan bien en un navegador normal, pero
// cuando la web se abre DENTRO de otra aplicación —el navegador incrustado de
// Instagram, TikTok o del propio WhatsApp, que es de donde llega casi todo el
// tráfico de la biografía— `wa.me` no puede saltar a la aplicación: enseña su
// propia pantalla («Abrir aplicación») y, encima, un aviso gris de «La acción
// no se pudo completar». Dos toques más y mucha gente se cae ahí.
//
// La solución es el enlace propio de la aplicación (`whatsapp://send`), que sí
// sale del navegador incrustado. Como no todos los dispositivos la tienen
// instalada (un ordenador, por ejemplo), se intenta el esquema y, si en un
// segundo y medio la página sigue delante, se va al enlace web de siempre.
//
// Se engancha una sola vez a nivel de documento (`vigilarEnlacesWhatsApp`) y
// atrapa cualquier <a> que apunte a wa.me o api.whatsapp.com, venga de donde
// venga: así ningún enlace nuevo se queda fuera y no hay que tocar cada
// componente. Con Ctrl/Cmd, con el botón central o en escritorio no se toca
// nada: el enlace normal ya funciona.

const ESPERA_MS = 1500;

/** ¿Es un teléfono o una tableta? En escritorio `whatsapp://` no lleva a ningún sitio. */
export function esMovil() {
  try {
    if (navigator.userAgentData?.mobile) return true;
    return /android|iphone|ipad|ipod|opera mini|iemobile|mobile/i.test(navigator.userAgent || "");
  } catch {
    return false;
  }
}

/** De `https://wa.me/51992009397?text=Hola` a `whatsapp://send?phone=51992009397&text=Hola`. */
export function enlaceDeAplicacion(href) {
  try {
    const u = new URL(href, window.location.origin);
    if (!/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/.test(u.hostname)) return null;
    // wa.me/<numero> o api.whatsapp.com/send?phone=<numero>
    const telefono = (u.pathname.replace(/\D/g, "") || u.searchParams.get("phone") || "").replace(/\D/g, "");
    if (!telefono) return null;
    const texto = u.searchParams.get("text") || "";
    return `whatsapp://send?phone=${telefono}${texto ? `&text=${encodeURIComponent(texto)}` : ""}`;
  } catch {
    return null;
  }
}

/**
 * Abre la conversación. Devuelve true si se encargó ella (y quien llama debe
 * evitar la navegación normal), false si no hay nada que hacer.
 */
export function abrirWhatsApp(href) {
  const app = esMovil() ? enlaceDeAplicacion(href) : null;
  if (!app) return false;

  let saltamos = false;
  const alIrse = () => { saltamos = true; };
  document.addEventListener("visibilitychange", alIrse, { once: true });
  window.addEventListener("pagehide", alIrse, { once: true });

  window.location.href = app;

  // Si la aplicación no está instalada, la página sigue aquí: se usa el enlace
  // web, que ofrece descargarla.
  setTimeout(() => {
    document.removeEventListener("visibilitychange", alIrse);
    window.removeEventListener("pagehide", alIrse);
    if (!saltamos && document.visibilityState === "visible") window.location.href = href;
  }, ESPERA_MS);

  return true;
}

/** Se llama una vez al arrancar. Devuelve la función para dejar de vigilar. */
export function vigilarEnlacesWhatsApp() {
  const alPulsar = (e) => {
    // Respeta abrir en pestaña nueva, guardar el enlace, etc.
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target?.closest?.("a[href]");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!/wa\.me|api\.whatsapp\.com/.test(href)) return;
    if (abrirWhatsApp(a.href)) e.preventDefault();
  };
  document.addEventListener("click", alPulsar);
  return () => document.removeEventListener("click", alPulsar);
}
