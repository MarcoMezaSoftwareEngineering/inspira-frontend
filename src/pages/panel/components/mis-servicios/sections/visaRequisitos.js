// src/pages/panel/components/mis-servicios/sections/visaRequisitos.js
//
// Requisitos detallados de cada documento del expediente de visado: formato,
// vigencia, apostilla, qué acepta y qué no el consulado.
//
// No viven en la base de datos a propósito. El catálogo de checklist guarda el
// nombre del documento y su estado; esto es el "cómo debe venir", que cambia
// cuando cambia el criterio consular y conviene poder corregir sin migración.
//
// El enlace con cada ítem del checklist se hace por palabras clave sobre su
// nombre, porque los nombres del catálogo no son estables entre expedientes.

const CATALOGO = [
  {
    clave: "formulario",
    kw: ["formulario", "solicitud de visado", "impreso"],
    requisitos: [
      "Lo gestiona Inspira; tú solo entregas tus datos.",
      "Se completa en computadora, con la dirección de la universidad.",
      "La firma (punto 31) va manuscrita, en bolígrafo azul o negro.",
    ],
  },
  {
    clave: "pasaporte",
    kw: ["pasaporte"],
    requisitos: [
      "Copia de todas las hojas en un solo PDF, nítido.",
      "Vigencia mínima de 6 meses desde la solicitud (lo ideal: que cubra todo el programa).",
      "Adjunta también tu DNI escaneado por ambas caras.",
    ],
  },
  {
    clave: "antecedentes",
    kw: ["antecedent", "penal"],
    requisitos: [
      "De todos los países donde viviste los últimos 5 años.",
      "Menos de 3 meses desde su emisión.",
      "Apostilla digital en Cancillería (RR.EE.).",
      "Inspira no tramita apostillas, pero verifica que estén correctas.",
    ],
  },
  {
    clave: "admision",
    kw: ["aceptaci", "admisi", "matríc", "matric", "carta de acepta"],
    requisitos: [
      "Carta de admisión del centro, instituto o universidad.",
      "Pre-matrícula o matrícula con tus datos, estudios y período.",
      "Pago de reserva y/o recibos (como mínimo, el comprobante de reserva).",
      "Sólo se admiten estudios OFICIALES.",
      "Nivel académico previo apostillado: título (para máster) o constancia de secundaria (grado/técnico).",
    ],
  },
  {
    clave: "seguro",
    kw: ["seguro"],
    requisitos: [
      "Un solo PDF: Condiciones Particulares + Generales + Pagos + Certificado.",
      "Sin copagos, sin carencias y con repatriación.",
      "Debe cubrir todo el período de estudios.",
      "Adeslas, Asisa o Sanitas son válidos.",
    ],
  },
  {
    clave: "certificado_medico",
    kw: ["certificado médic", "certificado medic", "médico", "medico", "salud"],
    requisitos: [
      "Modelo estándar (está en tu carpeta de plantillas).",
      "Puede emitirlo un centro público o privado.",
      "Legalizar ante el Colegio Médico y apostillar.",
    ],
  },
  {
    clave: "alojamiento",
    kw: ["alojamiento", "arrendamiento", "invitaci"],
    requisitos: [
      "Basta una reserva cancelable.",
      "Un contrato de arrendamiento también sirve.",
      "La carta de invitación familiar NO se recomienda.",
      "Puedes buscar en Idealista.com.",
    ],
  },
  {
    clave: "viaje",
    kw: ["vuelo", "billete", "viaje", "pasaje"],
    requisitos: [
      "Reserva con tarifa flexible — NO compres el billete definitivo.",
      "Sólo el pasaje de ida.",
      "Programas de 6 meses o más: adjunta también reserva de regreso.",
    ],
  },
  {
    clave: "foto",
    kw: ["fotograf", "foto"],
    requisitos: [
      "3,5 × 4,5 cm, fondo blanco liso, a color y de frente.",
      "Menos de 6 meses de antigüedad.",
      "Sin sonreír, sin gafas ni gorras.",
      "Se adhiere al formulario de solicitud.",
    ],
  },
  {
    clave: "bancario",
    kw: ["banc", "cuenta", "estado de cuenta"],
    requisitos: [
      "Extractos ORIGINALES de cuenta de ahorro y/o corriente.",
      "Últimos 6 meses, con firma y sello del banco.",
      "No se admiten: cartas del banco, fondos de inversión, cuentas a plazo, cuentas de empresa, cuentas CTS, planes de pensiones ni tarjetas de crédito.",
    ],
  },
  {
    clave: "aval",
    kw: ["aval", "patrocin", "tercero"],
    requisitos: [
      "Carta aval ante notario, legalizada por el Colegio de Notarios y apostillada.",
      "Debe indicar expresamente que cubre todos los costes de la estancia.",
      "Documentos que acrediten el vínculo familiar directo, apostillados.",
      "Toda la documentación económica del avalista.",
    ],
  },
  {
    clave: "laboral",
    kw: ["boleta", "contrato laboral", "nómina", "nomina", "ingreso", "renta"],
    requisitos: [
      "Boletas de pago de los últimos 6 meses si estás en planilla.",
      "Si eres independiente: ficha RUC, declaración anual y declaraciones de los últimos 3 meses.",
      "Si eres socio de una empresa: añade comprobantes de utilidades, dietas o bonos.",
    ],
  },
  {
    clave: "titulo",
    kw: ["bachiller", "sunedu", "homologa", "título", "titulo", "grado académ"],
    requisitos: [
      "Título o constancia de egreso, apostillado.",
      "Para máster: título universitario. Para grado o técnico: constancia de secundaria.",
      "Si no está en español, con traducción oficial.",
    ],
  },
];

/** Requisitos de un ítem del checklist, o null si no hay ficha para él. */
export function requisitosDe(nombreItem) {
  const n = String(nombreItem || "").toLowerCase();
  if (!n) return null;
  const ficha = CATALOGO.find((c) => c.kw.some((k) => n.includes(k)));
  return ficha ? ficha.requisitos : null;
}

/** Recordatorio que aplica a todo documento extranjero. */
export const NOTA_APOSTILLA =
  "Todo documento extranjero debe ir legalizado o apostillado. Si no está en español, " +
  "con traducción oficial. Presenta original + una copia.";
