// src/lib/consent.js
// ─────────────────────────────────────────────────────────────────────────────
// Motor de consentimiento de cookies con BLOQUEO PREVIO.
//
// Regla de oro: ningún script, píxel o almacenamiento no necesario puede
// ejecutarse hasta que el usuario lo acepte de forma expresa. Por eso los tags
// opcionales NO se escriben en index.html: se registran aquí con
// `alConsentir(categoria, fn)` y solo se ejecutan cuando hay consentimiento.
//
// El estado por defecto (sin decisión, o tras "Rechazar") es: todo en false
// salvo las cookies estrictamente necesarias.
// ─────────────────────────────────────────────────────────────────────────────

import { VERSIONES } from "../config/legal";

const CLAVE = "inspira_consent";
const VIGENCIA_MESES = 12;

const ESTADO_BASE = {
  necesarias: true,
  preferencias: false,
  analitica: false,
  marketing: false,
};

/* ── Lectura / escritura tolerante a fallos ─────────────────────────────── */

function leerBruto() {
  try {
    const raw = localStorage.getItem(CLAVE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function estaVigente(registro) {
  if (!registro?.fecha) return false;
  if (registro.version !== VERSIONES.cookies.version) return false; // política nueva ⇒ re-preguntar
  const vencimiento = new Date(registro.fecha);
  vencimiento.setMonth(vencimiento.getMonth() + VIGENCIA_MESES);
  return new Date() <= vencimiento;
}

/** Registro completo del consentimiento, o null si no hay decisión vigente. */
export function obtenerRegistro() {
  const registro = leerBruto();
  return registro && estaVigente(registro) ? registro : null;
}

/** Estado efectivo de las categorías. Sin decisión ⇒ solo las necesarias. */
export function obtenerConsentimiento() {
  const registro = obtenerRegistro();
  return { ...ESTADO_BASE, ...(registro?.categorias || {}) };
}

/** true si el usuario aún no ha decidido (hay que mostrar el banner). */
export function requiereDecision() {
  return obtenerRegistro() === null;
}

export function tieneConsentimiento(categoria) {
  if (categoria === "necesarias") return true;
  return obtenerConsentimiento()[categoria] === true;
}

/**
 * Guarda la decisión del usuario junto con la prueba mínima exigible:
 * qué aceptó, cuándo, con qué versión de la política y por qué vía.
 */
export function guardarConsentimiento(categorias, via = "banner") {
  const registro = {
    categorias: { ...ESTADO_BASE, ...categorias, necesarias: true },
    fecha: new Date().toISOString(),
    version: VERSIONES.cookies.version,
    via, // "aceptar_todo" | "rechazar_todo" | "configurar" | "banner"
  };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(registro));
  } catch {
    /* navegación privada o almacenamiento bloqueado: se respeta el estado base */
  }
  aplicarPendientes();
  window.dispatchEvent(
    new CustomEvent("inspira:consent", { detail: registro.categorias })
  );
  return registro;
}

export function aceptarTodo() {
  return guardarConsentimiento(
    { preferencias: true, analitica: true, marketing: true },
    "aceptar_todo"
  );
}

export function rechazarTodo() {
  return guardarConsentimiento(
    { preferencias: false, analitica: false, marketing: false },
    "rechazar_todo"
  );
}

/** Permite reabrir el panel desde el footer o la política de cookies. */
export function revocarConsentimiento() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent("inspira:consent-reset"));
}

/* ── Bloqueo previo: cola de tags opcionales ─────────────────────────────── */

const pendientes = [];
const yaEjecutados = new Set();

/**
 * Registra un tag opcional. NO se ejecuta hasta que exista consentimiento para
 * su categoría. Ejemplo de uso, cuando se decida instalar analítica:
 *
 *   alConsentir("analitica", () => {
 *     const s = document.createElement("script");
 *     s.src = "https://www.googletagmanager.com/gtag/js?id=G-XXXX";
 *     document.head.appendChild(s);
 *   });
 *
 * Mientras nadie llame a esta función con "analitica" o "marketing", el sitio
 * no carga ningún tag de terceros de esas categorías.
 */
export function alConsentir(categoria, fn, id = null) {
  const clave = id || `${categoria}:${pendientes.length}`;
  pendientes.push({ categoria, fn, clave });
  aplicarPendientes();
}

function aplicarPendientes() {
  const estado = obtenerConsentimiento();
  pendientes.forEach(({ categoria, fn, clave }) => {
    if (estado[categoria] && !yaEjecutados.has(clave)) {
      yaEjecutados.add(clave);
      try {
        fn();
      } catch (e) {
        console.error("[consent] error ejecutando tag", clave, e);
      }
    }
  });
}

/** Llamar una vez al arrancar la app: ejecuta lo ya consentido en visitas previas. */
export function inicializarConsentimiento() {
  aplicarPendientes();
}
