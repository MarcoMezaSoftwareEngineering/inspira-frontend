// src/config/tienda.js
// Productos digitales de la Tiendita. El cobro es por Mercado Pago (sin
// plataforma externa). `disponible: false` => la tarjeta muestra "Muy
// pronto" y no se puede pagar. Solo poner `disponible: true` cuando:
// 1) el contenido (ebook, video, acceso) ya exista, y
// 2) su entrega esté configurada en
//    inspira-backend/src/modules/pagos/productos.catalogo.js (campo
//    `entrega.url`, hoy vacío en todos).
// Nunca cobrar por algo que no se pueda entregar.

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
  },
];
