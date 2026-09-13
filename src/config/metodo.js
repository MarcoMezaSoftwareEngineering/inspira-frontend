// src/config/metodo.js
// ─────────────────────────────────────────────────────────────────────────────
// Sesión diagnóstico, vía migratoria (visado / estancia) y citas en España:
// qué incluye cada uno. Lo usan el Paquete Máster 2027/2028
// (paqueteMaster2027.js) y el test /visa-o-estancia.
//
// Aquí NO hay importes propios: todos salen de la fuente única
// precios-inspira.json (copia del backend, ver paqueteMaster2027Resumen.js).
// Las listas y planes de máster viven solo en paqueteMaster2027.js.
//
// /metodo-inspira ya no es una página: redirige a
// /servicios/master#pago-por-etapas (App.jsx).
// ─────────────────────────────────────────────────────────────────────────────

import { PRECIOS_INSPIRA, eur } from "./paqueteMaster2027Resumen";

export { eur };

const P = PRECIOS_INSPIRA;
const visado = (id) => P.visado.find((v) => v.id === id).eur;
const cita = (id) => P.citasEspana.find((c) => c.id === id).eur;

// ── La sesión diagnóstico ───────────────────────────────────────────────────
// Pago aparte: no se descuenta del paquete (cliente, 11/09/2026).
const S = P.sesionDiagnostico;
export const SESION_DIAGNOSTICO = {
  nombre: S.nombre,
  duracion: `${S.duracionMin} minutos`,
  precio: S.eur,
  precioTexto: eur(S.eur),
  precioAlt: `S/ ${S.pen} · ${S.usd} US$`,
  icono: "balanza",
  gancho: "Antes de cobrarte un paquete, te decimos si tu caso es viable.",
  incluye: [
    "Diagnóstico jurídico de tu caso con un abogado especialista",
    "Requisitos, plazos y medios económicos de tu consulado",
    "Definimos tu vía: visado, estancia por estudios u otra",
    "Plan de acción escrito con próximos pasos y documentos",
  ],
};

// ── Vía migratoria: visado ──────────────────────────────────────────────────
export const PLANES_VISADO = [
  {
    id: "visado-base",
    nombre: "Asesoría Base",
    subtitulo: "Validación económica",
    precio: visado("visado-base"),
    icono: "euro",
    tono: "sky",
    incluye: [
      "Validación de tu solvencia económica",
      "Declaración Jurada de Solvencia Económica",
    ],
    para: "Ya preparas tú el expediente y solo necesitas asegurar la parte que más se deniega.",
  },
  {
    id: "visado-parcial",
    nombre: "Asesoría Parcial",
    subtitulo: "Acompañamiento completo, sin cita ni recurso",
    precio: visado("visado-parcial"),
    icono: "escudo",
    tono: "primary",
    incluye: [
      "Todas las declaraciones juradas que necesite tu expediente",
      "Diagnóstico legal y estrategia personalizada",
      "Revisión y preparación de TODOS tus documentos",
      "Asesoría en formularios y diligenciamiento",
      "Asesoría en seguro médico internacional",
      "Revisión general final antes de presentar",
    ],
    para: "Te mueves bien con las citas de tu consulado, pero no quieres jugártela con el expediente.",
  },
  {
    id: "visado-integral",
    nombre: "Asesoría Integral",
    subtitulo: "Acompañamiento total, de principio a fin",
    precio: visado("visado-integral"),
    icono: "estrella",
    tono: "accent",
    destacado: true,
    incluye: [
      "Todo lo del paquete Parcial",
      "Cita consular: gestión y agendamiento",
      "Recurso de reposición en caso de denegación",
      "Subsanaciones y apelaciones durante todo el proceso",
    ],
    para: "Es el que recomendamos: cubre la cita y también el escenario que nadie quiere nombrar.",
  },
];

// ── Vía migratoria: estancia por estudios ───────────────────────────────────
export const ESTANCIA_ESTUDIOS = {
  id: "estancia",
  nombre: "Estancia por Estudios",
  subtitulo: "Ya estás en España o vas a entrar como turista",
  precio: P.estancia.eur,
  icono: "laptop",
  incluye: [
    "Asesoría jurídica personalizada para entrar como turista y modificar tu situación",
    "Presentación del expediente vía MERCURIO, con firma digital del abogado",
    "100 % online: sin citas presenciales, sin colas",
    "Modelos oficiales: formulario, declaraciones juradas y cartas",
    "Guía para abrir cuenta bancaria, empadronarte y contratar el seguro médico válido",
    "Requerimientos y subsanaciones hasta la resolución",
  ],
  para: [
    "Tienes carta de admisión oficial reciente y entrarás como turista",
    "No lograste el visado en tu consulado y buscas una vía legal alternativa",
  ],
  noIncluye: [
    "Tasa administrativa de 11 €, que se paga directamente a Extranjería",
    "Recurso de reposición y recursos contencioso-administrativos",
  ],
  permiso: "Incluye permiso para trabajar hasta 30 horas semanales.",
};

// ── Citas en España ─────────────────────────────────────────────────────────
export const CITAS_ESPANA = [
  {
    id: "empadronamiento",
    nombre: "Cita de empadronamiento",
    precio: cita("empadronamiento"),
    icono: "casa",
    detalle:
      "Gestión y reserva de la cita en tu ayuntamiento. Es el papel del que cuelgan casi todos los demás trámites.",
  },
  {
    id: "tie",
    nombre: "Cita de huellas / TIE",
    precio: cita("tie"),
    icono: "huella",
    detalle:
      "Gestión y reserva de la cita de toma de huellas, con el EX-17 y la tasa 790-012. La disponibilidad es el cuello de botella real del proceso.",
  },
];
