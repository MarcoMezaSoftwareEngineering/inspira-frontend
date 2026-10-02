// Avisa al servidor de un error de la web. Queda en `pm2 logs` y en Core →
// Configuración → Errores (solo admin).
//
// Sin datos personales: mensaje, pila, URL, navegador y versión del bundle.
// Nunca lanza: avisar de un error no puede provocar otro.
import { esVersionCaducada } from "./versionNueva";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Una página que falla en bucle no tiene por qué mandar cien avisos iguales.
const MAX_POR_CARGA = 15;
const enviados = new Set();

function versionDelBundle() {
  return document.querySelector('script[type="module"][src*="/assets/"]')?.getAttribute("src") || null;
}

/**
 * @param {object} e  { origen: "web"|"login", donde, mensaje, pila, componente }
 */
export function reportarError(e = {}) {
  try {
    const mensaje = String(e.mensaje || "(sin mensaje)");
    const clave = `${e.origen || "web"}|${e.donde || ""}|${mensaje}`;
    if (enviados.has(clave) || enviados.size >= MAX_POR_CARGA) return;
    enviados.add(clave);

    const cuerpo = JSON.stringify({
      origen: e.origen || "web",
      donde: e.donde || "",
      mensaje,
      pila: String(e.pila || "").slice(0, 4000),
      componente: String(e.componente || "").slice(0, 2000),
      url: window.location.href,
      agente: navigator.userAgent,
      version: versionDelBundle(),
    });
    const destino = `${API_URL}/api/errores-web`;
    if (navigator.sendBeacon) {
      navigator.sendBeacon(destino, new Blob([cuerpo], { type: "application/json" }));
    } else {
      fetch(destino, { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
    }
  } catch { /* nada */ }
}

// Ruido que no es un fallo nuestro: extensiones del navegador, scripts de
// terceros sin detalle, cortes de red del propio usuario y el aviso de
// versión nueva, que ya resuelve versionNueva recargando.
function esRuido(mensaje, archivo) {
  const m = String(mensaje || "");
  if (!m || m === "Script error." || m.startsWith("ResizeObserver loop")) return true;
  if (/^(TypeError: )?(Failed to fetch|Load failed|NetworkError when attempting to fetch resource\.?)$/.test(m)) return true;
  if (/AbortError|The operation was aborted|The user aborted a request/.test(m)) return true;
  if (esVersionCaducada(m)) return true;
  if (archivo && !String(archivo).startsWith(window.location.origin)) return true;
  return false;
}

/**
 * Errores que no pasan por ningún cerco: los de un manejador de clic, un
 * setTimeout o una promesa sin `catch`. Sin esto solo se enteraba quien abría
 * la consola del navegador.
 */
export function vigilarErroresGlobales() {
  window.addEventListener("error", (ev) => {
    // Un <img> o <script> que no carga también dispara «error», sin mensaje.
    if (!ev.message) return;
    if (esRuido(ev.message, ev.filename)) return;
    reportarError({
      donde: "global",
      mensaje: ev.message,
      pila: ev.error?.stack || `${ev.filename}:${ev.lineno}:${ev.colno}`,
    });
  });
  window.addEventListener("unhandledrejection", (ev) => {
    const r = ev.reason;
    const mensaje = r?.message || (typeof r === "string" ? r : "");
    if (esRuido(mensaje) || esRuido(String(r))) return;
    reportarError({
      donde: "promesa",
      mensaje: mensaje || String(r),
      pila: r?.stack,
    });
  });
}
