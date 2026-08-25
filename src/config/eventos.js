// src/config/eventos.js
// Eventos gratuitos de la marca. `activo: false` retira el evento de la web
// sin borrar su contenido.
import { CALENDLY_URL } from "./contacto";

export const EVENTOS = [
  {
    id: "estudia-en-espana-2027",
    activo: true,
    destacado: true,
    titulo: "Estudia en España: el evento más completo para ti",
    subtitulo: "Estudia en España en 5 pasos — Rumbo al 2027",
    resumen:
      "El primer evento gratuito de Inspira para que entiendas, de principio a fin, cómo se estudia en España: los 5 pasos, los plazos reales y los errores que dejan a la gente fuera un año entero.",
    formato: "Charla virtual y gratuita",
    precio: "Gratis",
    cupo: "Cupos limitados",
    fecha: "2026-09-19",
    fechaTexto: "Sábado 19 de septiembre · virtual",
    // Beneficio principal: quien asiste entra a la presencial de noviembre.
    accesoPresencial:
      "Los asistentes obtienen acceso a nuestra charla presencial de noviembre.",
    agenda: [
      {
        paso: "01",
        titulo: "Elegir bien el programa",
        texto:
          "Cómo filtrar entre másteres, grados y FP según tu perfil, tu presupuesto y tus plazos reales.",
      },
      {
        paso: "02",
        titulo: "Preparar tu expediente",
        texto:
          "Qué documentos necesitas, cuáles se apostillan y por qué conviene tenerlos listos antes de postular.",
      },
      {
        paso: "03",
        titulo: "Postular y conseguir plaza",
        texto:
          "Fases de admisión, cómo funciona cada comunidad autónoma y cuándo conviene postular para maximizar opciones.",
      },
      {
        paso: "04",
        titulo: "Becas: cuándo y a cuáles",
        texto:
          "Las convocatorias que sí puedes ganar como latinoamericano y por qué las primeras fases lo cambian todo.",
      },
      {
        paso: "05",
        titulo: "Visa o estancia por estudios",
        texto:
          "Las dos vías al mismo permiso, cuál te conviene según tu consulado y cómo se prepara un expediente sin errores.",
      },
    ],
    beneficios: [
      "Acceso a la charla PRESENCIAL de noviembre, solo para asistentes.",
      "Descuento en nuestros paquetes para quienes asistan.",
      "Calendario completo Rumbo al 2027 en PDF.",
      "Sesión de preguntas en vivo con el equipo legal.",
    ],
    urlInscripcion: CALENDLY_URL,
  },
];

export const eventosActivos = () => EVENTOS.filter((e) => e.activo);
