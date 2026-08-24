// src/config/plataforma.js
// Contenido de la página /plataforma. Describe el sistema propio de Inspira
// — es el mayor diferenciador frente a asesorías que trabajan por WhatsApp.
// ⚠️ Solo describir funciones que el sistema tiene de verdad (panel del
// cliente, checklist de documentos, informes, correos automáticos y
// backoffice de asesores).

export const CAPACIDADES = [
  {
    id: "panel",
    icono: "laptop",
    titulo: "Tu panel privado con credenciales",
    texto:
      "Accedes con tu cuenta a un panel propio donde vive tu expediente completo: tu perfil, tus servicios contratados y el estado real de cada trámite. No es un chat: es tu expediente.",
    puntos: [
      "Acceso con credenciales personales",
      "Perfil académico y migratorio en un solo sitio",
      "Estado de cada servicio contratado, siempre visible",
    ],
  },
  {
    id: "documentos",
    icono: "documento",
    titulo: "Checklist de documentos con validación",
    texto:
      "Cada trámite genera su checklist. Subes cada documento a tu expediente y tu asesor lo revisa y lo valida ahí mismo: sabes qué falta, qué está aprobado y qué hay que corregir.",
    puntos: [
      "Subida segura de documentos al expediente",
      "Revisión y validación por tu asesor",
      "Siempre sabes qué falta y qué ya está listo",
    ],
  },
  {
    id: "flujos",
    icono: "destello",
    titulo: "Flujos automáticos entre tú y tu asesor",
    texto:
      "El sistema avisa solo. Cuando cambia el estado de tu expediente, cuando se valida un documento, cuando se confirma un pago o cuando se acerca un plazo, la notificación sale automáticamente.",
    puntos: [
      "Avisos automáticos en cada hito del expediente",
      "Confirmaciones de pago y de reserva sin intermediarios",
      "Alertas de plazos antes de que se venzan",
    ],
  },
  {
    id: "backoffice",
    icono: "escudo",
    titulo: "Backoffice interno para el equipo legal",
    texto:
      "Del otro lado, tus asesores trabajan sobre el mismo expediente en un backoffice propio: informes, seguimiento y trazabilidad. Nada depende de que alguien recuerde reenviarte un correo.",
    puntos: [
      "Un solo expediente compartido por todo el equipo",
      "Informes internos y trazabilidad de cada gestión",
      "Continuidad aunque cambie el asesor que te atiende",
    ],
  },
  {
    id: "recursos",
    icono: "libro",
    titulo: "Biblioteca de recursos incluida",
    texto:
      "Al contratar un servicio se te abre la sección de recursos: guías de máster, de apostilla y el listado de becas en España, dentro del mismo panel.",
    puntos: [
      "Guía de máster paso a paso",
      "Guía de apostilla y legalizaciones",
      "Becas en España actualizadas",
    ],
  },
];

export const COMPARATIVA = [
  {
    tema: "Dónde vive tu caso",
    otros: "En una conversación de WhatsApp que se pierde entre mensajes.",
    inspira: "En un expediente digital con tu usuario y contraseña.",
  },
  {
    tema: "Tus documentos",
    otros: "Fotos y PDF reenviados por chat o correo, sin control de versiones.",
    inspira: "Subidos a tu expediente, revisados y validados por tu asesor.",
  },
  {
    tema: "Saber en qué punto vas",
    otros: "Escribir para preguntar y esperar respuesta.",
    inspira: "Entrar a tu panel y verlo, a cualquier hora.",
  },
  {
    tema: "Los avisos",
    otros: "Dependen de que alguien se acuerde de escribirte.",
    inspira: "Salen automáticamente en cada hito del proceso.",
  },
  {
    tema: "Si cambia tu asesor",
    otros: "Hay que volver a contar tu caso desde cero.",
    inspira: "Todo el equipo ve el mismo expediente y su historial.",
  },
];
