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

/**
 * Detiene la medición y borra las cookies que GA4 dejó puestas.
 *
 * Retirar el consentimiento tiene que ser tan efectivo como darlo. Antes,
 * `revocarConsentimiento()` solo borraba la decisión de localStorage: el
 * script de gtag seguía cargado en la página y las cookies `_ga` y `_ga_<ID>`
 * se quedaban en el navegador hasta dos años, así que la medición continuaba
 * después de que el visitante dijera que no.
 */
function detenerGA() {
  if (!GA_ID) return;

  // Interruptor oficial de Google: corta cualquier envío posterior de este ID
  // aunque el script ya esté en la página.
  window[`ga-disable-${GA_ID}`] = true;

  // Borrar las cookies de medición. Hay que probar con el dominio exacto y con
  // el dominio padre (`.inspira-legal.cloud`), porque GA las escribe en el
  // registrable y una cookie solo se borra desde el mismo dominio y ruta.
  const host = window.location.hostname;
  const dominios = [undefined, host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];

  document.cookie.split(";").forEach((entrada) => {
    const nombre = entrada.split("=")[0].trim();
    if (!nombre.startsWith("_ga")) return;
    dominios.forEach((d) => {
      document.cookie =
        `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` +
        (d ? `; domain=${d}` : "");
    });
  });

  // Ojo: `cargado` NO se pone a false. El <script> sigue en el DOM y volver a
  // cargarlo inyectaría un segundo tag; lo que corta la medición es el flag
  // ga-disable, y eso es reversible sin duplicar nada.
}

/** Vuelve a medir tras un consentimiento otorgado de nuevo. */
function reanudarGA() {
  if (!GA_ID) return;
  window[`ga-disable-${GA_ID}`] = false;
  cargarGA(); // no hace nada si el script ya estaba cargado
}

/** Nombre corto de la página actual para los eventos (la ruta sin query). */
const paginaActual = () => (typeof window === "undefined" ? "" : window.location.pathname);

/* ── UTM de la visita ─────────────────────────────────────────────────────
 * Los utm_* del anuncio solo están en la URL de entrada: en cuanto se navega
 * por la SPA desaparecen. Se guardan en sessionStorage (dura lo que la
 * pestaña, no rastrea entre visitas) para adjuntarlos a los eventos y a los
 * formularios de captación. Es almacenamiento técnico de la sesión y no sale
 * del navegador salvo en un evento con consentimiento de analítica o en un
 * formulario que la persona envía.
 */
const CLAVE_UTM = "inspira_utm";
const CAMPOS_UTM = ["utm_source", "utm_medium", "utm_campaign"];

function capturarUtm() {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams(window.location.search);
    const nuevos = {};
    CAMPOS_UTM.forEach((k) => {
      const v = q.get(k);
      if (v) nuevos[k] = v.slice(0, 150);
    });
    if (Object.keys(nuevos).length) sessionStorage.setItem(CLAVE_UTM, JSON.stringify(nuevos));
  } catch {
    /* sessionStorage bloqueado: sin UTM */
  }
}

/** Los utm_* guardados de esta visita ({} si no hay). */
export function utmGuardados() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_UTM) || "{}") || {};
  } catch {
    return {};
  }
}

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/**
 * Evento del embudo para Inspira Core (POST /api/leads/evento). Solo con
 * consentimiento de analítica. Va como text/plain por sendBeacon: así no hay
 * preflight CORS y sale aunque la página se esté yendo a WhatsApp.
 * Sin correo ni teléfono el backend solo lo suma a un contador diario.
 */
export function enviarEventoEmbudo(tipo, datos = {}) {
  if (!tieneConsentimiento("analitica")) return;
  if (typeof navigator === "undefined") return;
  const cuerpo = JSON.stringify({ tipo, pagina: paginaActual(), ...utmGuardados(), ...datos });
  const url = `${API_URL}/api/leads/evento`;
  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([cuerpo], { type: "text/plain;charset=UTF-8" }));
    } else {
      fetch(url, { method: "POST", body: cuerpo, keepalive: true, headers: { "Content-Type": "text/plain" } })
        .catch(() => {});
    }
  } catch {
    /* la medición nunca rompe el clic */
  }
}

let clicsMedidos = false;

/**
 * Medición de clics salientes sin tocar cada botón: un solo oyente en el
 * documento reconoce los enlaces a WhatsApp y a Calendly, estén donde estén.
 * `registrarEvento` ya comprueba el consentimiento, así que sin «analítica»
 * aceptada no sale nada.
 */
function medirClicsSalientes() {
  if (clicsMedidos || typeof document === "undefined") return;
  clicsMedidos = true;

  document.addEventListener(
    "click",
    (e) => {
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a) return;
      let url;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      const host = url.hostname.replace(/^www\./, "");

      if (host === "wa.me" || host.endsWith("whatsapp.com")) {
        // El saludo de origen («vengo de …») viaja en el texto: se manda su
        // arranque para cruzarlo con lo que llega al WhatsApp.
        const texto = url.searchParams.get("text") || "";
        const origen = (texto.match(/vengo del? ([^.]+)\./i) || [])[1] || "";
        registrarEvento("whatsapp_clic", {
          pagina: paginaActual(),
          origen: origen.slice(0, 90),
          transport_type: "beacon",
        });
        // Y a Core, que no depende de GA (enviarEventoEmbudo mira el consentimiento).
        enviarEventoEmbudo("WHATSAPP", { origen_detalle: origen.slice(0, 90) });
      } else if (host.endsWith("calendly.com")) {
        registrarEvento("calendly_clic", {
          pagina: paginaActual(),
          evento_calendly: url.pathname.slice(0, 60),
          transport_type: "beacon",
        });
      }
    },
    true
  );

  // Reserva confirmada: Calendly la avisa por postMessage cuando el
  // calendario va incrustado (widget o ventana emergente). Con enlace directo
  // la reserva ocurre en calendly.com y solo se ve el clic de arriba.
  window.addEventListener("message", (e) => {
    if (!/calendly\.com$/.test(String(e.origin).replace(/^https?:\/\//, ""))) return;
    if (e.data?.event === "calendly.event_scheduled") {
      registrarEvento("calendly_reserva", { pagina: paginaActual() });
    }
  });
}

/**
 * Inicio de pago: se llama justo antes de mandar al visitante a Mercado Pago.
 * Usa el nombre estándar de GA4 (`begin_checkout`) para que salga en los
 * informes de comercio sin configurar nada.
 */
export function registrarInicioPago(tipo, datos = {}) {
  registrarEvento("begin_checkout", {
    tipo_pago: tipo,
    pagina: paginaActual(),
    transport_type: "beacon", // la página se va a Mercado Pago en el acto
    ...datos,
  });
}

/** Formulario de captación enviado con éxito (nombre estándar de GA4). */
export function registrarLead(formulario, datos = {}) {
  registrarEvento("generate_lead", { formulario, pagina: paginaActual(), ...datos });
}

/** Registra la carga diferida. Llamar una vez al arrancar la app. */
export function inicializarAnalytics() {
  // Los UTM y el oyente de clics van aunque no haya GA: el embudo de Core
  // (enviarEventoEmbudo) no depende de Google, solo del consentimiento.
  capturarUtm();
  medirClicsSalientes();
  if (!GA_ID) return;
  alConsentir("analitica", cargarGA, "ga4");

  // Retirar el consentimiento tiene que surtir efecto en el acto, y volver a
  // darlo también: `alConsentir` solo ejecuta su tag una vez por sesión, así
  // que sin esto el visitante que rechaza y luego acepta se quedaba sin medir
  // hasta recargar la página.
  window.addEventListener("inspira:consent", (e) => {
    if (!e.detail) return;
    if (e.detail.analitica === false) detenerGA();
    else if (e.detail.analitica === true) reanudarGA();
  });
  window.addEventListener("inspira:consent-reset", detenerGA);
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
