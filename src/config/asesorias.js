// src/config/asesorias.js
// Modalidades de asesoría que se ofrecen en la web.
// La promoción gratuita tiene fecha de caducidad: al pasar `hasta` deja de
// mostrarse sola, sin necesidad de tocar el resto de la web.
import { CALENDLY_URL } from "./contacto";

export const PROMO_GRATIS = {
  activa: true,
  hasta: "2026-09-22", // último día en que se muestra
  titulo: "Asesoría gratuita de 12 minutos",
  texto:
    "Por tiempo limitado: 12 minutos con un especialista para orientar tu caso, sin costo.",
  etiqueta: "Gratis por tiempo limitado",
  url: CALENDLY_URL,
};

export const promoVigente = () =>
  PROMO_GRATIS.activa && new Date() <= new Date(`${PROMO_GRATIS.hasta}T23:59:59`);

export const OPCIONES_ASESORIA = [
  {
    id: "gratis-12",
    nombre: "Asesoría de orientación",
    duracion: "12 minutos",
    precio: "Gratis",
    precioAlt: null,
    promo: true,
    descripcion:
      "Una primera orientación con un especialista para saber si tu caso es viable y qué vía te conviene explorar.",
    incluye: [
      "Orientación sobre tu situación concreta",
      "Te decimos qué vía explorar",
      "Sin compromiso de contratación",
    ],
    url: CALENDLY_URL,
  },
  {
    id: "personalizada-30",
    nombre: "Asesoría personalizada",
    duracion: "30 minutos",
    precio: "25 €",
    precioAlt: "S/ 100 · 28 US$",
    destacada: true,
    descripcion:
      "El diagnóstico completo con un abogado especialista: analizamos tu caso y sales con un plan de acción.",
    incluye: [
      "Diagnóstico jurídico de tu caso",
      "Análisis de requisitos, plazos y medios económicos",
      "Definimos tu mejor vía: visado, estancia o residencia",
      "Plan de acción con próximos pasos",
    ],
    url: CALENDLY_URL,
  },
  {
    id: "personalizada-50",
    nombre: "Asesoría ampliada",
    duracion: "50 minutos",
    precio: "45 €",
    precioAlt: "S/ 180",
    descripcion:
      "Para casos con varias variables: denegatorias previas, familia, doble vía o expedientes ya iniciados.",
    incluye: [
      "Todo lo de la asesoría de 30 minutos",
      "Revisión de expedientes o resoluciones previas",
      "Estrategia para casos con familia o doble vía",
      "Tiempo suficiente para revisar documentos contigo",
    ],
    url: CALENDLY_URL,
  },
];
