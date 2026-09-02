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
 * Líneas corporativas de atención.
 *
 * No son intercambiables: una atiende consultas y citas, la otra es solo para
 * quien ya es cliente. Por eso cada una lleva escrito para qué sirve — quien
 * mira la pantalla decide a cuál escribe.
 *
 * Ojo: el teléfono del titular (config/legal.js) es otro y sigue siendo el que
 * consta en los documentos legales y en el Libro de Reclamaciones.
 */
export const LINEAS = [
  {
    id: "citas",
    nombre: "Carina Meza",
    numero: "+51 992 009 397",
    para: "Información y citas",
  },
  {
    id: "clientes",
    nombre: "Nicole Valencia",
    numero: "+51 992 013 351",
    para: "Línea exclusiva para clientes",
  },
];

export const lineaDe = (id) => LINEAS.find((l) => l.id === id) || LINEAS[0];

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
