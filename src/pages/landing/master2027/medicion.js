// src/pages/landing/master2027/medicion.js
//
// Medición y reglas de comportamiento de la landing /master-2027-2028:
// - enlace de Calendly con los utm_* del anuncio,
// - eventos de analítica (registrarEvento ya respeta el consentimiento),
// - marcas de sesión que apagan las ventanas emergentes,
// - «zonas» donde el visitante está trabajando (simulador, mapa, calculadora)
//   y en las que ninguna ventana emergente debe interrumpirle.
import { CALENDLY_URL } from "../../../config/contacto";
import { registrarEvento } from "../../../lib/analytics";

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// Se calcula una vez al cargar el módulo: la landing es de una sola URL y los
// utm_* no cambian mientras se navega por ella.
function construirCalendly() {
  if (typeof window === "undefined") return CALENDLY_URL;
  try {
    const origen = new URLSearchParams(window.location.search);
    const url = new URL(CALENDLY_URL);
    UTM.forEach((clave) => {
      const valor = origen.get(clave);
      if (valor) url.searchParams.set(clave, valor);
    });
    return url.toString();
  } catch {
    return CALENDLY_URL;
  }
}

export const URL_CALENDLY = construirCalendly();

export function evento(nombre, datos = {}) {
  registrarEvento(nombre, datos);
}

// ── Marcas de sesión ────────────────────────────────────────────────────────
const CLAVE_CTA = "ads2027_cta";
const claveModal = (tipo) => `ads2027_modal_${tipo}`;

function leer(clave) {
  try {
    return sessionStorage.getItem(clave) === "1";
  } catch {
    return false;
  }
}

function marcar(clave) {
  try {
    sessionStorage.setItem(clave, "1");
  } catch {
    /* navegación privada o almacenamiento bloqueado */
  }
}

let ultimoCtaEn = 0;

/** Clic en cualquier CTA hacia Calendly: evento, marca de sesión y pausa de 10 s. */
export function registrarCta(ubicacion) {
  evento("ads2027_cta_calendly", { ubicacion });
  ultimoCtaEn = Date.now();
  marcar(CLAVE_CTA);
}

export const ctaPulsado = () => leer(CLAVE_CTA);
export const modalYaMostrado = (tipo) => leer(claveModal(tipo));
export const marcarModal = (tipo) => marcar(claveModal(tipo));

// ── Zonas de trabajo ────────────────────────────────────────────────────────
// Un contenedor con data-m27-zona suprime las ventanas mientras el foco esté
// dentro (el iframe de la calculadora cuenta: al tocarlo, el foco del documento
// pasa al propio iframe) o mientras el último toque haya caído dentro.
let toqueEnZona = false;

export function vigilarZonas() {
  const alTocar = (e) => {
    const destino = e.target;
    toqueEnZona = !!(destino instanceof Element && destino.closest("[data-m27-zona]"));
  };
  document.addEventListener("pointerdown", alTocar, true);
  return () => document.removeEventListener("pointerdown", alTocar, true);
}

function focoEnZona() {
  const activo = document.activeElement;
  if (!activo || activo === document.body) return false;
  return !!activo.closest?.("[data-m27-zona]");
}

// El banner de cookies ya no bloquea la ventana (cliente, 11/09/2026, tarde):
// la ventana sale por encima y, al cerrarla, el banner sigue ahí.
export function modalesSuprimidos() {
  return toqueEnZona || focoEnZona() || Date.now() - ultimoCtaEn < 10000;
}

// ── Desplazamiento ──────────────────────────────────────────────────────────
export function prefiereMenosMovimiento() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Lleva a la vista un elemento por id sin tocar la URL. */
export function irA(id, block = "start") {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefiereMenosMovimiento() ? "auto" : "smooth", block });
}

export const esEscritorio = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
