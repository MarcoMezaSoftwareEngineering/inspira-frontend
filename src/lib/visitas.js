// src/lib/visitas.js
//
// Contador anónimo de visitas a las páginas de campaña (POST /api/leads/visita):
// sin cookies ni identificadores, solo página y procedencia, así que cuenta a
// todos, acepten o no la analítica. La lista de páginas vive también en el
// backend (modules/leads/visitas.js): si se añade una, en los dos sitios.
import { utmGuardados } from "./analytics";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const PAGINAS = ["/enlaces", "/beca-generacion-bicentenario-2026", "/mapa-estudiar-en-espana", "/grado-en-espana"];
const FUENTES = ["tiktok", "instagram", "facebook", "whatsapp", "google", "linkedin", "qr", "enlaces"];
const REFERENTES = [
  [/tiktok\./, "tiktok"],
  [/instagram\./, "instagram"],
  [/facebook\.|(^|\.)fb\.|messenger\./, "facebook"],
  [/whatsapp\.|wa\.me/, "whatsapp"],
  [/google\./, "google"],
  [/linkedin\.|lnkd\.in/, "linkedin"],
];

/** Procedencia: utm_source conocido; si no, el sitio de donde viene; si no, «directo». */
function fuenteDeVisita() {
  let utm = "";
  try {
    utm = new URLSearchParams(window.location.search).get("utm_source") || utmGuardados().utm_source || "";
  } catch {
    /* sin acceso a la URL o al almacenamiento */
  }
  utm = String(utm).toLowerCase();
  if (FUENTES.includes(utm)) return utm;

  let host = "";
  try {
    host = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    /* referente ilegible */
  }
  const conocido = host && REFERENTES.find(([re]) => re.test(host));
  if (conocido) return conocido[1];
  if (utm) return "otro";
  return host && !host.endsWith("inspira-legal.cloud") ? "otro" : "directo";
}

export function registrarVisita(path) {
  if (typeof window === "undefined" || !PAGINAS.includes(path)) return;
  const cuerpo = JSON.stringify({ pagina: path, fuente: fuenteDeVisita() });
  const url = `${API_URL}/api/leads/visita`;
  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([cuerpo], { type: "text/plain;charset=UTF-8" }));
    } else {
      fetch(url, { method: "POST", body: cuerpo, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
    }
  } catch {
    /* un contador nunca rompe la página */
  }
}
