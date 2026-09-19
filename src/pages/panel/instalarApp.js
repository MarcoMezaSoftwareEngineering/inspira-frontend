// Instalar el panel como app: qué sistema es, si ya está instalada y el
// evento `beforeinstallprompt` de Chrome/Edge (Android y escritorio).
//
// Vivía dentro de AvisoInstalarApp (la tarjeta de Inicio). Desde el
// 18/09/2026 lo comparten la tarjeta y la ventana «Instalar la app» del menú
// (InstalarAppModal), así que el evento se guarda una sola vez aquí.
import { registrarEvento } from "../../lib/analytics";

export const CLAVE_POSPUESTO = "inspira:app-aviso-pospuesto";
export const CLAVE_INSTALADA = "inspira:app-instalada";

// El evento puede llegar antes de que se pinte el panel: se escucha en cuanto
// se carga este módulo. main.jsx lo captura antes por si llega todavía antes.
let eventoInstalar = (typeof window !== "undefined" && window.__inspiraEventoInstalar) || null;
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    eventoInstalar = e;
    avisar();
  });
  window.addEventListener("appinstalled", () => {
    eventoInstalar = null;
    try { localStorage.setItem(CLAVE_INSTALADA, new Date().toISOString()); } catch { /* sin almacenamiento */ }
    registrarEvento("app_instalada", { origen: "panel" });
    avisar();
  });
}

/** ¿Hay un diálogo de instalación nativo disponible ahora mismo? */
export const puedeInstalar = () => Boolean(eventoInstalar);

/** Suscribirse a cambios (llega el evento, se instala). Devuelve la baja. */
export function alCambiar(f) {
  oyentes.add(f);
  return () => { oyentes.delete(f); };
}

export function leer(clave) {
  try { return localStorage.getItem(clave); } catch { return null; }
}

/** «iphone», «android» o null (escritorio, tablet o desconocido). */
export function plataforma() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod/i.test(ua)) return "iphone";
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return "android";
  return null;
}

/**
 * Como `plataforma`, pero sin quedarse en «teléfono»: el iPad cuenta como
 * iPhone (mismos pasos en Safari) y una tablet Android como Android. El resto
 * es «escritorio».
 * @returns {"iphone"|"android"|"escritorio"}
 */
export function sistema() {
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod|iPad/i.test(ua)) return "iphone";
  // iPadOS se presenta como Mac con pantalla táctil.
  if (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1) return "iphone";
  if (/Android/i.test(ua)) return "android";
  return "escritorio";
}

export function yaInstalada() {
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch { /* navegador antiguo */ }
  return window.navigator.standalone === true;
}

/** En iPhone solo Safari permite añadir a la pantalla de inicio. */
export function iphoneFueraDeSafari() {
  const ua = navigator.userAgent || "";
  if (/CriOS|FxiOS|EdgiOS|OPiOS|GSA\/|FBAN|FBAV|Instagram|WhatsApp|Line\/|LinkedInApp|TikTok|musical_ly|Snapchat|Twitter/i.test(ua)) return true;
  return !/Safari\//.test(ua);
}

/** Navegadores dentro de otras apps en Android: ahí tampoco se instala. */
export function androidDentroDeApp() {
  const ua = navigator.userAgent || "";
  return /; wv\)|FBAN|FBAV|Instagram|WhatsApp|Line\/|TikTok|musical_ly|Snapchat/i.test(ua);
}

/** Samsung Internet: el menú está abajo (☰) y la opción se llama distinto. */
export function androidSamsung() {
  return /SamsungBrowser/i.test(navigator.userAgent || "");
}

/**
 * Abre el diálogo nativo. Devuelve "accepted", "dismissed" o null si no hay
 * evento. El mismo evento no se puede usar dos veces.
 */
export async function instalarAhora(origen = "panel") {
  const e = eventoInstalar;
  if (!e) return null;
  registrarEvento("app_instalar_pulsado", { plataforma: sistema(), origen });
  try {
    await e.prompt();
    const eleccion = await e.userChoice;
    const resultado = eleccion?.outcome || "desconocido";
    registrarEvento("app_instalar_resultado", { resultado, origen });
    eventoInstalar = null;
    if (resultado === "accepted") {
      try { localStorage.setItem(CLAVE_INSTALADA, new Date().toISOString()); } catch { /* sin almacenamiento */ }
    }
    avisar();
    return resultado;
  } catch {
    eventoInstalar = null;
    avisar();
    return null;
  }
}
