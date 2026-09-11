// src/config/contacto.js
// Canales de captación. El CTA de toda la web apunta a Calendly, igual que
// el Linktree de la marca: la primera asesoría se agenda directamente ahí.
import { TITULAR } from "./legal";

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

/** Enlace de WhatsApp a una línea concreta. */
export const whatsappLinea = (linea, mensaje) =>
  `https://wa.me/${soloDigitos(linea.numero)}?text=${encodeURIComponent(
    mensaje || "Hola Inspira, quiero información."
  )}`;

// Datos de la sesión que se vende, repetidos en toda la web.
export const ASESORIA = {
  duracion: "30 minutos",
  modalidad: "Reunión online desde cualquier parte del mundo",
  precioEur: "25 €",
  precioUsd: "28 US$",
  precioPen: "S/ 100",
};
