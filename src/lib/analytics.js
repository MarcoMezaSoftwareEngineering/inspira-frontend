// src/lib/analytics.js
// Google Analytics 4, cargado SOLO si el visitante acepta la categoría
// "analítica". Sin consentimiento no se descarga ni un byte de Google.
//
// El identificador se configura en la variable de entorno VITE_GA_ID
// (fichero .env del frontend). Sin ella, la analítica queda desactivada.
import { alConsentir, tieneConsentimiento } from "./consent";

const GA_ID = import.meta.env.VITE_GA_ID || "";

let cargado = false;

function cargarGA() {
  if (cargado || !GA_ID) return;
  cargado = true;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, {
    anonymize_ip: true,
    send_page_view: true,
  });
}

/** Registra la carga diferida. Llamar una vez al arrancar la app. */
export function inicializarAnalytics() {
  if (!GA_ID) return;
  alConsentir("analitica", cargarGA, "ga4");
}

/** Vista de página en navegación SPA (el config inicial ya envía la primera). */
export function registrarVista(path, titulo) {
  if (!cargado || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_title: titulo || document.title,
    page_location: window.location.href,
  });
}

/**
 * Evento de negocio. Se usa para saber qué funciona de verdad:
 * diagnósticos completados, clics en agendar, compras iniciadas…
 */
export function registrarEvento(nombre, datos = {}) {
  if (!tieneConsentimiento("analitica")) return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", nombre, datos);
}
