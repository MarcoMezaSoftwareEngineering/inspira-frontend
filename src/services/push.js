// src/services/push.js
//
// Los avisos al móvil del asesorado: Web Push estándar con VAPID. Gratis, sin
// Firebase ni OneSignal: el navegador trae su propio servicio de push y el
// servidor firma los envíos con su clave.
//
// Dónde funciona:
//   · Android (Chrome, Edge, Firefox…) y escritorio: en el navegador.
//   · iPhone/iPad: SOLO con la app instalada en la pantalla de inicio (iOS
//     16.4+). En Safari suelto no existe PushManager, así que hay que decirle
//     que la instale primero, no esconderle la opción sin más.
//
// El service worker lo registra main.jsx (solo en producción). Aquí no se
// registra otro: se espera al que hay.
import { apiGET, apiPOST } from "./api";

/** iPhone, iPad o iPod (los iPad nuevos se presentan como Mac con pantalla táctil). */
export function esIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
}

/** La app abierta desde la pantalla de inicio, no desde el navegador. */
export function esAppInstalada() {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  } catch { /* navegador antiguo */ }
  return window.navigator.standalone === true;
}

/** Si este navegador, tal como está abierto, puede recibir avisos. */
export function pushSoportado() {
  return typeof window !== "undefined"
    && "serviceWorker" in navigator
    && "PushManager" in window
    && "Notification" in window;
}

/** Clave VAPID en base64url → los bytes que pide pushManager.subscribe. */
function urlBase64ToUint8Array(base64) {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + relleno).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = window.atob(b64);
  const salida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i += 1) salida[i] = bruto.charCodeAt(i);
  return salida;
}

/**
 * El registro del service worker, sin quedarse colgado.
 * `serviceWorker.ready` no se resuelve nunca si no hay ninguno (en desarrollo
 * no se registra): pasado un rato se da por no disponible.
 */
async function registro(ms = 5000) {
  if (!pushSoportado()) return null;
  const actual = await navigator.serviceWorker.getRegistration().catch(() => null);
  if (actual?.active) return actual;
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * En qué punto están los avisos en este dispositivo.
 *
 * @returns {Promise<"no-soportado"|"instalar-ios"|"no-disponible"|"denegado"|"activo"|"inactivo">}
 *   · instalar-ios:  iPhone con Safari suelto; primero hay que instalar la app.
 *   · no-disponible: el servidor no tiene push activo o no hay service worker.
 *   · denegado:      el usuario bloqueó las notificaciones; solo se arregla en ajustes.
 */
export async function estadoAvisos() {
  if (!pushSoportado()) {
    return esIOS() && !esAppInstalada() ? "instalar-ios" : "no-soportado";
  }
  if (Notification.permission === "denied") return "denegado";
  const reg = await registro();
  if (!reg) return "no-disponible";
  const sub = await reg.pushManager.getSubscription().catch(() => null);
  if (sub && Notification.permission === "granted") return "activo";
  return "inactivo";
}

/**
 * Pide permiso, suscribe este dispositivo y lo guarda en el servidor.
 * Debe llamarse desde un toque del usuario: iOS no deja pedir permiso si no.
 *
 * @returns {Promise<{ok: boolean, estado: string, mensaje?: string}>}
 */
export async function activarAvisos() {
  if (!pushSoportado()) {
    return { ok: false, estado: esIOS() && !esAppInstalada() ? "instalar-ios" : "no-soportado" };
  }

  const clave = await apiGET("/cliente/push/clave").catch(() => null);
  if (!clave?.ok || !clave.activo || !clave.clave) {
    return { ok: false, estado: "no-disponible", mensaje: "Los avisos no están disponibles ahora mismo." };
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") {
    return { ok: false, estado: permiso === "denied" ? "denegado" : "inactivo" };
  }

  const reg = await registro();
  if (!reg) return { ok: false, estado: "no-disponible", mensaje: "No se pudo preparar la app para recibir avisos." };

  try {
    let sub = await reg.pushManager.getSubscription();
    // Una suscripción hecha con otra clave (si se cambió en el servidor) no
    // sirve: se da de baja y se hace de nuevo.
    const nueva = urlBase64ToUint8Array(clave.clave);
    const vieja = sub?.options?.applicationServerKey;
    if (sub && vieja && !mismaClave(new Uint8Array(vieja), nueva)) {
      await sub.unsubscribe().catch(() => {});
      sub = null;
    }
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: nueva });
    }
    const r = await apiPOST("/cliente/push/suscribir", sub.toJSON());
    if (!r?.ok) return { ok: false, estado: "inactivo", mensaje: r?.message || "No se pudieron activar los avisos." };
    return { ok: true, estado: "activo" };
  } catch {
    return { ok: false, estado: "inactivo", mensaje: "No se pudieron activar los avisos. Inténtalo de nuevo." };
  }
}

function mismaClave(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return false;
  return true;
}

/** Quita la suscripción de este dispositivo, aquí y en el servidor. */
export async function desactivarAvisos() {
  const reg = await registro();
  const sub = reg ? await reg.pushManager.getSubscription().catch(() => null) : null;
  if (!sub) return { ok: true, estado: "inactivo" };
  // Primero el servidor: si la baja local fallara, al menos no llegan avisos.
  await apiPOST("/cliente/push/baja", { endpoint: sub.endpoint }).catch(() => null);
  await sub.unsubscribe().catch(() => {});
  return { ok: true, estado: "inactivo" };
}
