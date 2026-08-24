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

// La asesoría 1:1 de 30 minutos es EL producto de entrada: va primera y
// destacada. La gratuita de 12 min es solo un paso previo opcional.
export const OPCIONES_ASESORIA = [
  {
    id: "personalizada-30",
    nombre: "Asesoría personalizada 1:1",
    duracion: "30 minutos",
    precio: "25 €",
    precioAlt: "S/ 100 · 28 US$",
    destacada: true,
    icono: "balanza",
    descripcion:
      "El diagnóstico completo con un abogado especialista: analizamos tu caso a fondo y sales con un plan de acción concreto.",
    incluye: [
      "Diagnóstico jurídico de tu caso",
      "Análisis de requisitos, plazos y medios económicos",
      "Definimos tu mejor vía: visado, estancia o residencia",
      "Plan de acción con próximos pasos y documentos",
    ],
    url: CALENDLY_URL,
  },
  {
    id: "personalizada-50",
    nombre: "Asesoría ampliada",
    duracion: "50 minutos",
    precio: "45 €",
    precioAlt: "S/ 180",
    icono: "documento",
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
  {
    id: "gratis-12",
    nombre: "Orientación previa",
    duracion: "12 minutos",
    precio: "Gratis",
    precioAlt: null,
    promo: true,
    secundaria: true,
    icono: "chat",
    descripcion:
      "¿Prefieres un primer contacto antes de decidir? Te orientamos brevemente sobre qué vía explorar.",
    incluye: [
      "Orientación general sobre tu situación",
      "Te indicamos qué vía explorar",
      "Sin diagnóstico jurídico ni plan de acción",
    ],
    url: CALENDLY_URL,
  },
];

// La opción que se promociona por defecto en toda la web.
export const ASESORIA_PRINCIPAL = OPCIONES_ASESORIA[0];
