// src/config/tienda.js
// `disponible: false` => la tarjeta muestra "Muy pronto" y NO se puede pagar.
// Solo poner `disponible: true` cuando el producto exista y su entrega esté
// configurada en inspira-backend/src/modules/pagos/productos.catalogo.js
// (campo `entrega.url`). Nunca cobrar por algo que no se pueda entregar.
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
    disponible: false,
    precioPen: 59,
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
    disponible: false,
    precioPen: 99,
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
    disponible: false,
    precioPen: 39,
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
    disponible: false,
    precioPen: 99,
    nombre: "InspiraGPT — tu asistente de extranjería 24/7",
    descripcion:
      "Asistente de IA entrenado con nuestras guías de extranjería y estudios en España. Resuelve dudas de trámites a cualquier hora. Pago único, acceso permanente.",
    precio: "25 US$",
    tipo: "Acceso permanente",
    emoji: "🤖",
    href: null,
    hotmartUrl: null,
  },
  {
    id: "videos-cv",
    disponible: false,
    precioPen: 99,
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
