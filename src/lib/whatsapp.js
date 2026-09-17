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

const ESPERA_MS = 1200;

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


/** Con formato legible: 51992009397 → +51 992 009 397. */
function bonito(telefono) {
  const t = String(telefono || "").replace(/\D/g, "");
  if (t.length === 11 && t.startsWith("51")) return `+51 ${t.slice(2, 5)} ${t.slice(5, 8)} ${t.slice(8)}`;
  if (t.length === 11 && t.startsWith("34")) return `+34 ${t.slice(2, 5)} ${t.slice(5, 7)} ${t.slice(7, 9)} ${t.slice(9)}`;
  return `+${t}`;
}

/**
 * El plan C: ni la aplicación ni la página web sirven aquí.
 *
 * Dentro del navegador de WhatsApp —o de Instagram en algunos teléfonos— el
 * enlace de la aplicación no abre nada y `wa.me` enseña «La acción no se pudo
 * completar». En vez de dejar a la persona ahí, se le da el número: copiarlo y
 * pegarlo en WhatsApp siempre funciona. Es DOM a pelo porque esto vive fuera
 * de React (se engancha al documento entero).
 */
function hojaDelNumero(telefono, hrefWeb) {
  const previa = document.getElementById("wa-hoja");
  if (previa) previa.remove();

  const numero = bonito(telefono);
  const velo = document.createElement("div");
  velo.id = "wa-hoja";
  velo.setAttribute("role", "dialog");
  velo.setAttribute("aria-modal", "true");
  velo.setAttribute("aria-label", "Escríbenos por WhatsApp");
  velo.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(1,26,38,.55);backdrop-filter:blur(4px);font-family:Montserrat,system-ui,sans-serif";

  const caja = document.createElement("div");
  caja.style.cssText = "width:100%;max-width:420px;background:#fff;border-radius:24px 24px 0 0;padding:22px 20px calc(20px + env(safe-area-inset-bottom,0px));text-align:center;box-shadow:0 -20px 50px rgba(1,26,38,.35)";
  caja.innerHTML = `
    <p style="margin:0;font-size:13px;line-height:1.5;color:#5f7a89">No se pudo abrir WhatsApp desde aquí. Copia el número y escríbenos:</p>
    <p style="margin:12px 0 0;font-size:24px;font-weight:800;color:#013446;letter-spacing:.01em">${numero}</p>
    <div style="display:grid;gap:8px;margin-top:16px">
      <button type="button" data-wa="copiar" style="height:48px;border:0;border-radius:14px;background:#25D366;color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer">Copiar número</button>
      <button type="button" data-wa="reintentar" style="height:48px;border:1px solid #d8e7f5;border-radius:14px;background:#fff;color:#013446;font:inherit;font-size:14px;font-weight:700;cursor:pointer">Volver a intentar abrir WhatsApp</button>
      <button type="button" data-wa="cerrar" style="height:42px;border:0;background:none;color:#5f7a89;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer">Cerrar</button>
    </div>`;
  velo.appendChild(caja);

  const cerrar = () => velo.remove();
  velo.addEventListener("click", (e) => { if (e.target === velo) cerrar(); });
  caja.querySelector('[data-wa="cerrar"]').addEventListener("click", cerrar);
  // Reintentar es volver a la aplicación, no a wa.me: ahí es donde sale el error.
  caja.querySelector('[data-wa="reintentar"]').addEventListener("click", () => {
    cerrar();
    window.location.href = enlaceDeAplicacion(hrefWeb) || hrefWeb;
  });
  caja.querySelector('[data-wa="copiar"]').addEventListener("click", async (e) => {
    const boton = e.currentTarget;
    try {
      await navigator.clipboard.writeText(numero);
      boton.textContent = "Copiado ✓";
    } catch {
      // Sin permiso de portapapeles: al menos se selecciona para copiar a mano.
      boton.textContent = "Mantén pulsado el número para copiarlo";
    }
  });
  document.body.appendChild(velo);
}

/**
 * Abre la conversación. Devuelve true si se encargó ella (y quien llama debe
 * evitar la navegación normal), false si no hay nada que hacer.
 */
export function abrirWhatsApp(href) {
  const app = esMovil() ? enlaceDeAplicacion(href) : null;
  if (!app) return false;
  const telefono = new URLSearchParams(app.split("?")[1]).get("phone") || "";

  let saltamos = false;
  const alIrse = () => { saltamos = true; };
  document.addEventListener("visibilitychange", alIrse, { once: true });
  window.addEventListener("pagehide", alIrse, { once: true });

  window.location.href = app;

  // Si no saltó, `wa.me` tampoco va a servir —es justo donde sale «La acción no
  // se pudo completar»—: se le da el número para copiar.
  setTimeout(() => {
    document.removeEventListener("visibilitychange", alIrse);
    window.removeEventListener("pagehide", alIrse);
    if (!saltamos && document.visibilityState === "visible") hojaDelNumero(telefono, href);
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
