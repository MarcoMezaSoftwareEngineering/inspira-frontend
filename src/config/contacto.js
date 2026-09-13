// src/config/contacto.js
// Canales de captación. El CTA de toda la web apunta a Calendly, igual que
// el Linktree de la marca: la primera asesoría se agenda directamente ahí.
import { TITULAR } from "./legal";
import { SESION_PRECIOS } from "./paqueteMaster2027Resumen";

export const CALENDLY_URL =
  "https://calendly.com/administracion-inspira-legal/30min";

export const LINKTREE_URL = "https://linktr.ee/inspira_educa";

const soloDigitos = (t) => String(t).replace(/\D/g, "");

export const whatsappUrl = (mensaje) =>
  `https://wa.me/${soloDigitos(TITULAR.whatsapp)}?text=${encodeURIComponent(
    mensaje || "Hola Inspira, quiero información sobre la primera asesoría."
  )}`;

/**
 * Línea corporativa de atención: una sola.
 *
 * Hasta septiembre de 2026 había dos (citas y una exclusiva para clientes).
 * Decisión del cliente (11/09/2026): en todo lo que ve el asesorado o el
 * público solo aparece +51 992 009 397, con la etiqueta neutra «WhatsApp de
 * Inspira». Se mantiene `LINEAS` como lista y `lineaDe(id)` con su firma para
 * no romper imports: cualquier id («citas», «clientes»…) devuelve esta línea.
 * No vuelvas a añadir una segunda sin que el cliente lo pida.
 *
 * Ojo: el teléfono del titular (config/legal.js) es otro y sigue siendo el que
 * consta en los documentos legales y en el Libro de Reclamaciones.
 */
export const LINEAS = [
  {
    id: "inspira",
    nombre: "Inspira Legal",
    numero: "+51 992 009 397",
    para: "WhatsApp de Inspira",
  },
];

/** Acepta un id por compatibilidad; siempre devuelve la línea única. */
export const lineaDe = () => LINEAS[0];

/**
 * De dónde llega quien escribe por WhatsApp.
 *
 * Cada enlace a WhatsApp de la web abre la conversación con un saludo que
 * nombra la página o la pieza de origen («vengo de …»). Así el equipo sabe,
 * sin preguntar, qué página trajo al cliente. Añade aquí un origen nuevo antes
 * de enlazar WhatsApp desde otra pieza; no escribas `wa.me` a mano.
 */
export const ORIGENES_WHATSAPP = {
  inicio: "la página de inicio",
  servicios: "el catálogo de servicios",
  "servicio-master": "la página del Máster en España",
  "servicio-estancia": "la página de Visa y estancia por estudios",
  servicio: "la página de un servicio",
  ruta: "la guía de rutas para migrar",
  blog: "el blog",
  eventos: "la página de eventos",
  casos: "la página de casos de éxito",
  nosotros: "la página Nosotros",
  plataforma: "la página del Portal Inspira",
  calculadora: "la calculadora de máster",
  asistente: "el diagnóstico gratuito de la web",
  "visa-o-estancia": "el test «¿Visa o estancia?»",
  "asesoria-cta": "el botón «Agenda tu asesoría»",
  "panel-bienvenida": "la pantalla de acceso al panel",
  "panel-inicio": "mi panel de asesorado",
  "panel-mi-ruta": "«Mi ruta» en mi panel",
  "panel-sin-acceso": "mi panel, recién creada la cuenta",
  "panel-guia-master": "la guía del máster en mi panel",
  web: "la web",
};

/** Origen de WhatsApp para una ruta pública (lo usan los CTA comunes). */
export function origenDeRuta(path = "") {
  const p = String(path || "/");
  if (p === "/") return "inicio";
  if (p.startsWith("/servicios/master") || p.startsWith("/master-")) return "servicio-master";
  if (p.startsWith("/servicios/estancia")) return "servicio-estancia";
  if (p.startsWith("/servicios/")) return "servicio";
  if (p.startsWith("/servicios")) return "servicios";
  if (p.startsWith("/ruta/")) return "ruta";
  if (p.startsWith("/blog")) return "blog";
  if (p.startsWith("/eventos")) return "eventos";
  if (p.startsWith("/casos-de-exito")) return "casos";
  if (p.startsWith("/nosotros")) return "nosotros";
  if (p.startsWith("/plataforma")) return "plataforma";
  if (p.startsWith("/calculadora")) return "calculadora";
  if (p.startsWith("/asistente")) return "asistente";
  if (p.startsWith("/visa-o-estancia")) return "visa-o-estancia";
  return "web";
}

/**
 * Enlace a la línea única de WhatsApp con el saludo de origen.
 *
 *   whatsappDesde("asistente", "Me salió: estancia por estudios.")
 *   → «Hola Inspira, vengo de el diagnóstico gratuito de la web. Me salió…»
 *
 * `origen` es una clave de ORIGENES_WHATSAPP (o una ruta, que se traduce con
 * origenDeRuta). `detalle` es el resto del mensaje, opcional.
 */
export function whatsappDesde(origen, detalle = "Quiero información.") {
  const clave = ORIGENES_WHATSAPP[origen] ? origen : origenDeRuta(origen);
  const donde = ORIGENES_WHATSAPP[clave];
  const saludo = `Hola Inspira, vengo de ${donde}.`.replace(" de el ", " del ");
  const texto = detalle ? `${saludo} ${detalle}` : saludo;
  return whatsappLinea(LINEAS[0], texto);
}

/** Enlace de WhatsApp a una línea concreta. */
export const whatsappLinea = (linea, mensaje) =>
  `https://wa.me/${soloDigitos(linea.numero)}?text=${encodeURIComponent(
    mensaje || "Hola Inspira, quiero información."
  )}`;

// Datos de la sesión que se vende, repetidos en toda la web.
export const ASESORIA = {
  duracion: "30 minutos",
  modalidad: "Reunión online desde cualquier parte del mundo",
  // Importes de la fuente única (precios-inspira.json).
  precioEur: `${SESION_PRECIOS.eur} €`,
  precioUsd: `${SESION_PRECIOS.usd} US$`,
  precioPen: `S/ ${SESION_PRECIOS.pen}`,
};
