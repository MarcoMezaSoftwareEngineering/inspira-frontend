// src/config/tienda.js
// Productos digitales de la Tiendita.
// Los productos de pago se venden por Hotmart: pega la URL de la página de
// pago de cada producto en `hotmartUrl`. Mientras esté en null, el botón
// muestra "Muy pronto" deshabilitado.

export const PRODUCTOS = [
  {
    id: "calculadora-master",
    nombre: "Calculadora de Máster en España",
    descripcion:
      "Calcula el costo real de estudiar tu máster en España: matrícula, visa, apostilla y gastos de vida. Resultado inmediato.",
    precio: null, // gratis
    tipo: "Herramienta",
    emoji: "🧮",
    href: "/calculadora-master", // producto interno gratuito
    hotmartUrl: null,
  },
  {
    id: "becas-actualizadas",
    nombre: "Becas en España actualizadas",
    descripcion:
      "Acceso al listado curado y actualizado de becas activas en España, con requisitos, montos y fechas de cierre.",
    precio: "15 US$",
    tipo: "Acceso digital",
    emoji: "🎓",
    href: null,
    hotmartUrl: null, // COMPLETAR: URL de pago de Hotmart
  },
  {
    id: "ebook-master",
    nombre: "Ebook + video: pasos para estudiar un Máster en España",
    descripcion:
      "Guía completa en ebook y video grabado con todos los pasos: elección del máster, postulación, visa y llegada a España.",
    precio: "25 US$",
    tipo: "Ebook + video",
    emoji: "📘",
    href: null,
    hotmartUrl: null, // COMPLETAR: URL de pago de Hotmart
  },
  {
    id: "ebook-fp",
    nombre: "Ebook: estudia una Formación Profesional gratis en España",
    descripcion:
      "Cómo encontrar tu centro para estudiar una carrera técnica (FP) gratuita en España: requisitos, plazos y estrategia.",
    precio: "10 US$",
    tipo: "Ebook",
    emoji: "📗",
    href: null,
    hotmartUrl: null, // COMPLETAR: URL de pago de Hotmart
  },
  {
    // Producto de suscripción pendiente de construir: ver la nota del equipo
    // sobre el asistente de IA (requiere backend + pasarela de suscripción).
    id: "asistente-ia",
    nombre: "InspiraGPT — tu asistente de extranjería 24/7",
    descripcion:
      "Asistente de IA entrenado con nuestras guías de extranjería y estudios en España. Resuelve dudas de trámites a cualquier hora, con suscripción mensual.",
    precio: "Próximamente",
    tipo: "Suscripción",
    emoji: "🤖",
    href: null,
    hotmartUrl: null,
  },
  {
    id: "videos-cv",
    nombre: "Serie de videos: mejora tu CV y tu perfil",
    descripcion:
      "Serie de videos prácticos para pulir tu CV y tu perfil académico-profesional antes de postular a universidades y becas.",
    precio: "25 US$",
    tipo: "Serie de videos",
    emoji: "🎬",
    href: null,
    hotmartUrl: null, // COMPLETAR: URL de pago de Hotmart
  },
];
