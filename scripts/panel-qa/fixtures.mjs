// ============================================================================
// Inspira · fixtures FICTICIOS del panel del asesorado (QA de capturas)
//
// Respuestas JSON para la clienta ficticia «Valeria Ramos» con estos servicios:
//   155  Máster · Paquete Premium (etapa Búsqueda): 1 documento observado,
//        1 pedido por el asesor, 2 subidos sin revisar, informe publicado,
//        2 mensajes sin leer.
//   156  Visado de estudios · Visado completo, con requerimiento consular
//        cuyo plazo vence en 5 días.
//   157  Estancia por estudios (subiendo documentos; 2 datos y 3 documentos
//        por completar, 1 observado).
//   158  Profesional altamente cualificado (UGE), como titular: etapa
//        «Subiendo tus documentos»; 3 datos, 3 documentos por subir, 1
//        observado, 2 en revisión; otra persona entra al expediente.
//   159  Modificación a residencia por trabajo: etapa «Esperando documentos de
//        tu empresa»; 2 datos, 8 documentos por subir, 1 observado, aviso de
//        jornada de 30 horas.
//   160  Doctorado (etapa «Preinscrito» → paso Candidatura): diagnóstico con
//        un documento observado, aval del director pedido por el asesor,
//        carta de motivación en revisión.
//   161  Grado en España (trámite por pasos, ficha de definiciones.js; etapa
//        «Informe»): certificado observado, DNI pedido por el asesor, pasaporte
//        aprobado, tres carreras propuestas.
//   162  Estancia por estudios AJENA (invitado: titular Diego Ramos Quispe),
//        recién empezada.
// Los nuevos (158-162) son más antiguos que los tres primeros, así que salen
// detrás en las listas. Cada uno lleva un documento observado, uno pedido, un
// paso hecho y otro en curso, para que se vean todos los tonos.
// Plan de pagos con 3 cuotas (1 pagada, 1 por validar, 1 pendiente a 20 días).
// Perfil incompleto: faltan 3 datos (WhatsApp, vencimiento del DNI y fecha
// del título).
//
// Escenarios (crearFixtures().usarEscenario): «sin-servicios» deja la lista de
// servicios y los planes de pago vacíos, para forzar el asistente del perfil
// (WizardPerfilCliente). «error-155»: GET /solicitudes/155 responde 500, para
// ver el error de carga del máster con su «Reintentar» (B5).
//
// Las FORMAS salen del backend (lista blanca de cliente.dto.js, planes.service,
// perfil.campos, visa.service, estancia.*, pac.*, modificatoria.*,
// tramites.service y tramites/definiciones.js). Nada de aquí es real.
// Verificación a mano (no se simula aquí): los acompañantes del PAC y de la
// estancia con documentos propios, y lo que llega de Extranjería, la UGE y el
// consulado (registros vacíos en 157, 158, 159 y 162).
// ============================================================================

export const CLIENTE = { id_cliente: 7, nombre: "Valeria Ramos Quispe", email: "valeria.ramos@example.com" };
export const ASESORA = { nombre: "Andrea Salazar Pinto", cargo: "Abogada de extranjería" };

// ── Fechas relativas a hoy (día de Lima) ───────────────────────────────────
const DIA = 86400000;
function diaLima(d) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
/** "AAAA-MM-DD" de hoy + n días. */
export const dia = (n = 0) => diaLima(new Date(Date.now() + n * DIA));
/** ISO de hoy + n días, a una hora dada (Lima ≈ UTC-5). */
export const iso = (n = 0, hora = 10) => new Date(Date.now() + n * DIA - (new Date().getUTCHours() - (hora + 5)) * 3600000).toISOString();
const diasHasta = (fecha) => Math.round((new Date(fecha + "T12:00:00Z") - new Date(dia(0) + "T12:00:00Z")) / DIA);

// ── Perfil (GET /cliente/me) ────────────────────────────────────────────────
export const PERFIL = {
  id_cliente: 7,
  email_contacto: CLIENTE.email,
  fecha_registro: "2026-08-30T14:12:00.000Z",
  nombre: CLIENTE.nombre,
  telefono: "+51 987 000 123",
  dni: "70000123",
  pasaporte: "P0000123",
  pais_origen: "Perú",
  datos_extra: {
    fecha_nacimiento: "1999-03-14",
    pasaporte_vencimiento: "2031-06-30",
    pasaporte_emision: "2021-06-30",
    ciudad: "Lima",
    nacionalidad: "Peruana",
    dni_emision: "2021-02-10",
    // faltan a propósito: whatsapp, dni_vencimiento, fecha_titulo
    carrera_titulo: "Derecho",
    area_carrera: "Ciencias Sociales y Jurídicas",
    universidad_origen: "Universidad Nacional Mayor de San Marcos",
    inicio_estudios: "2017",
    fin_estudios: "2022",
    inicio_previsto: "Septiembre 2027",
    presupuesto_hasta: "6000",
    tour_visto_at: "2026-09-13T10:00:00.000Z",
  },
  datos_origen: {},
  foto: null,
};

// ── Servicios (GET /solicitudes/mias) ───────────────────────────────────────
const ESTADO_EN_PROCESO = { id_estado: 3, nombre: "En proceso", es_final: false };
const RESUMEN_BASE = { plazos: [], requerimientos: [], mensajes_sin_leer: 0, agenda: [], docs_observados: 0 };

const MASTER_LISTA = {
  id_solicitud: 155, id_tipo_solicitud: 6,
  titulo: "Postulación a Máster · Paquete Premium · Madrid, Cataluña, Valencia",
  descripcion: "Búsqueda, elección y postulación a másteres oficiales para el curso 2027/2028.",
  codigo_publico: "INS-2026-0155", fecha_creacion: "2026-09-12T15:20:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 6, nombre: "Paquete Premium", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: [{ id_master: 1201, estado: "pendiente" }, { id_master: 1305, estado: "pendiente" }],
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE,
    docs_pendientes: 3, docs_observados: 1,
    plazos: [{ id_master: 1201, nombre: "Máster Universitario en Abogacía y Procura", universidad: "Universidad Carlos III de Madrid", cierra: dia(9), fase: "Fase 2" }],
    mensajes_sin_leer: 2,
    formulario_completo: true, informe_disponible: true, eleccion_completa: true,
  },
  panel_servicio: "master",
  encuesta_cierre: null,
};

const VISADO_LISTA = {
  id_solicitud: 156, id_tipo_solicitud: 15,
  titulo: "Visado de estudios · Visado completo",
  descripcion: "Preparación del expediente consular, medios económicos, cita y seguimiento.",
  codigo_publico: "INS-2026-0156", fecha_creacion: "2026-10-01T16:05:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 15, nombre: "Visado", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE,
    docs_pendientes: 3, docs_observados: 0,
    agenda: [
      { tipo: "requerimiento", fecha: dia(5), titulo: "Plazo para responder al consulado" },
      { tipo: "cita", fecha: dia(18), hora: "10:30", tentativa: false, titulo: "Cita en el consulado" },
    ],
    formulario_completo: true, informe_disponible: true, eleccion_completa: true,
    etapa_propia: null, servicio_propio: null, datos_faltan: null,
  },
  panel_servicio: "visa",
  encuesta_cierre: null,
};

const ESTANCIA_LISTA = {
  id_solicitud: 157, id_tipo_solicitud: 18,
  titulo: "Estancia por estudios · Madrid",
  descripcion: "Autorización de estancia por estudios ante Extranjería, desde España.",
  codigo_publico: "INS-2026-0157", fecha_creacion: "2026-10-10T13:40:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 18, nombre: "Estancia por estudios", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE,
    docs_pendientes: 3, docs_observados: 1,
    agenda: [{ tipo: "presentacion", fecha: dia(45), titulo: "Fecha recomendada para presentar tu estancia" }],
    formulario_completo: true, informe_disponible: true, eleccion_completa: true,
    etapa_propia: "Subiendo tus documentos", servicio_propio: "estancia", datos_faltan: 2,
  },
  panel_servicio: "estancia",
  encuesta_cierre: null,
};

// Expediente propio (solicitudes.service: `propio`): sus cuentas mandan, y las
// banderas del máster van a true para que no pida formulario ni elección.
const PROPIO = { formulario_completo: true, informe_disponible: true, eleccion_completa: true };

const PAC_LISTA = {
  id_solicitud: 158, id_tipo_solicitud: 29,
  titulo: "Profesional altamente cualificado · UGE",
  descripcion: "Autorización de residencia ante la Unidad de Grandes Empresas y visado en el consulado.",
  codigo_publico: "INS-2026-0158", fecha_creacion: "2026-08-20T15:10:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 29, nombre: "Profesional altamente cualificado (UGE)", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE, ...PROPIO,
    docs_pendientes: 3, docs_observados: 1,
    etapa_propia: "Subiendo tus documentos", servicio_propio: "pac", datos_faltan: 3,
  },
  panel_servicio: "pac",
  encuesta_cierre: null,
};

const MODIFICATORIA_LISTA = {
  id_solicitud: 159, id_tipo_solicitud: 20,
  titulo: "Modificación a residencia por trabajo · Madrid",
  descripcion: "Paso de la estancia por estudios a la residencia y trabajo por cuenta ajena.",
  codigo_publico: "INS-2026-0159", fecha_creacion: "2026-08-05T14:30:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 20, nombre: "Modificación de estudios a trabajo", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE, ...PROPIO,
    docs_pendientes: 8, docs_observados: 1,
    etapa_propia: "Esperando documentos de tu empresa", servicio_propio: "modificatoria", datos_faltan: 2,
  },
  panel_servicio: "modificatoria",
  encuesta_cierre: null,
};

// Doctorado y trámites por pasos: la lista lleva `etapa` (solicitudEnLista).
const DOCTORADO_LISTA = {
  id_solicitud: 160, id_tipo_solicitud: 22,
  titulo: "Doctorado en España · Universidad de Salamanca",
  descripcion: "Diagnóstico de acceso, programa y director, candidatura, admisión y residencia.",
  codigo_publico: "INS-2026-0160", fecha_creacion: "2026-07-22T16:00:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 22, nombre: "Doctorado en España", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE, ...PROPIO,
    docs_pendientes: 3, docs_observados: 1,
    etapa_propia: null, servicio_propio: null, datos_faltan: null,
  },
  panel_servicio: "doc",
  etapa: "Preinscrito",
  encuesta_cierre: null,
};

const GRADO_LISTA = {
  id_solicitud: 161, id_tipo_solicitud: 26,
  titulo: "Grado en España · Administración y Dirección de Empresas",
  descripcion: "Homologación de la secundaria, informe de carreras, elección y postulación.",
  codigo_publico: "INS-2026-0161", fecha_creacion: "2026-07-10T15:45:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 26, nombre: "Grado en España", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE, ...PROPIO,
    docs_pendientes: 1, docs_observados: 1,
    etapa_propia: null, servicio_propio: null, datos_faltan: null,
  },
  panel_servicio: "grado",
  etapa: "Informe",
  encuesta_cierre: null,
};

// Un expediente AJENO: Diego le dio acceso a Valeria (solicitudes.service,
// `comoInvitado`). Sale en su lista con el chip «Expediente de …».
const INVITADO_LISTA = {
  id_solicitud: 162, id_tipo_solicitud: 18,
  titulo: "Estancia por estudios · Valencia",
  descripcion: "Autorización de estancia por estudios ante Extranjería, desde España.",
  codigo_publico: "INS-2026-0162", fecha_creacion: "2026-06-30T13:00:00.000Z", fecha_cierre: null,
  tipo: { id_tipo_solicitud: 18, nombre: "Estancia por estudios", ccaa_bloqueado: false },
  estado: ESTADO_EN_PROCESO,
  postulaciones_data: null,
  invitado: true, titular: "Diego Ramos Quispe",
  asesor: ASESORA,
  resumen: {
    ...RESUMEN_BASE, ...PROPIO,
    docs_pendientes: 7, docs_observados: 0,
    etapa_propia: "Completando tus datos", servicio_propio: "estancia", datos_faltan: 7,
  },
  panel_servicio: "estancia",
  encuesta_cierre: null,
};

// El backend ordena por fecha de creación descendente.
export const SOLICITUDES = [ESTANCIA_LISTA, VISADO_LISTA, MASTER_LISTA, PAC_LISTA, MODIFICATORIA_LISTA, DOCTORADO_LISTA, GRADO_LISTA, INVITADO_LISTA];

// ── Detalle (GET /solicitudes/:id) ──────────────────────────────────────────
function detalleDe(lista, extra = {}) {
  return {
    id_solicitud: lista.id_solicitud, id_tipo_solicitud: lista.id_tipo_solicitud,
    titulo: lista.titulo, descripcion: lista.descripcion, codigo_publico: lista.codigo_publico,
    fecha_creacion: lista.fecha_creacion, fecha_cierre: null,
    informe_nombre_original: null, informe_fecha_subida: null,
    tipo: { ...lista.tipo, ccaas: [] },
    estado: lista.estado,
    datos_panel: {},
    cliente: PERFIL,
    ...extra,
  };
}
const DETALLE = {
  155: detalleDe(MASTER_LISTA, {
    tipo: { ...MASTER_LISTA.tipo, ccaas: ["Comunidad de Madrid", "Cataluña", "Comunidad Valenciana"].map((n) => ({ comunidad: { nombre: n } })) },
    datos_panel: { curso_objetivo: "2027-28" },
  }),
  156: detalleDe(VISADO_LISTA),
  157: detalleDe(ESTANCIA_LISTA),
  158: detalleDe(PAC_LISTA),
  159: detalleDe(MODIFICATORIA_LISTA),
  160: detalleDe(DOCTORADO_LISTA),
  161: detalleDe(GRADO_LISTA),
  162: detalleDe(INVITADO_LISTA),
};

// ── Checklist (GET /checklist/:id) ──────────────────────────────────────────
let idItem = 900, idDoc = 5000;
function itemChecklist(id_solicitud, etapa, nombre, estado, { descripcion = null, docs = [], comentario = null, grupo = null, obligatorio = true, numero = null } = {}) {
  idItem += 1;
  return {
    id_solicitud_item: idItem, id_solicitud, id_item: idItem - 800,
    estado_item: estado, comentario_asesor: comentario, fecha_actualizacion: iso(-3), numero,
    item: { id_item: idItem - 800, id_etapa: etapa.id, grupo, nombre_item: nombre, descripcion, obligatorio, permite_archivo: true, etapa: { id_etapa: etapa.id, nombre: etapa.nombre, orden: etapa.orden } },
    documentos: docs.map((d) => ({
      id_documento: ++idDoc, id_item_solicitud: idItem, nombre_original: d.nombre, mime_type: "application/pdf",
      tamano_bytes: d.bytes || 412_000, estado_revision: d.revision || "pendiente", vigente: true,
      subido_por_cliente: d.cliente !== false, fecha_subida: iso(d.hace ?? -5),
    })),
  };
}
const ET_PERSONALES = { id: 11, nombre: "Documentos personales", orden: 1 };
const ET_ACADEMICOS = { id: 12, nombre: "Documentos académicos", orden: 2 };
const ET_CONSULADO = { id: 21, nombre: "Documentos para el consulado", orden: 1 };
const ET_SOLVENCIA = { id: 22, nombre: "Solvencia económica", orden: 2 };
const ET_DOC_DIAGNOSTICO = { id: 31, nombre: "Diagnóstico de acceso", orden: 1 };
const ET_DOC_CANDIDATURA = { id: 32, nombre: "Candidatura", orden: 2 };
const ET_DOC_RESIDENCIA = { id: 33, nombre: "Residencia", orden: 3 };
const ET_GRADO_DOCUMENTOS = { id: 41, nombre: "Documentos", orden: 1 };

const CHECKLIST = {
  155: [
    itemChecklist(155, ET_PERSONALES, "Pasaporte vigente", "aprobado", { numero: 1, descripcion: "Todas las páginas en un solo PDF.", docs: [{ nombre: "pasaporte-valeria-ramos.pdf", revision: "aprobado", hace: -12 }] }),
    // «Te lo piden» y «Por corregir»: los dos tonos que el plan revisa en panel-servicios-155-documentos.
    itemChecklist(155, ET_PERSONALES, "Foto tamaño carnet", "solicitado", { numero: 2, descripcion: "Fondo blanco, formato JPG.", comentario: "La pide el portal de la UC3M: fondo blanco, de frente y sin lentes." }),
    itemChecklist(155, ET_PERSONALES, "Currículum Europass", "observado", { numero: 3, descripcion: "En español, con la plantilla del paso de instructivos.", comentario: "Falta tu experiencia en el estudio jurídico (2023-2025) y la fecha de fin del grado.", docs: [{ nombre: "cv-europass-valeria.pdf", revision: "observado", hace: -4, bytes: 380_000 }] }),
    itemChecklist(155, ET_ACADEMICOS, "Título universitario apostillado", "enviado", { numero: 4, descripcion: "Anverso y reverso con la apostilla de La Haya.", docs: [{ nombre: "titulo-apostillado.pdf", hace: -8, bytes: 1_240_000 }] }),
    itemChecklist(155, ET_ACADEMICOS, "Certificado de notas apostillado", "enviado", { numero: 5, descripcion: "Con el sistema de calificación de tu universidad.", docs: [{ nombre: "certificado-notas-apostillado.pdf", hace: -8, bytes: 2_050_000 }] }),
    itemChecklist(155, ET_ACADEMICOS, "Nota media convertida", "aprobado", { numero: 6, descripcion: "La convierte Inspira a la escala española.", docs: [{ nombre: "nota-media-convertida.pdf", revision: "aprobado", cliente: false, hace: -6 }] }),
    itemChecklist(155, ET_ACADEMICOS, "Carta de motivación", "pendiente", { numero: 7, descripcion: "Una por máster elegido; tienes el modelo en instructivos." }),
    itemChecklist(155, ET_ACADEMICOS, "Certificado de inglés", "pendiente", { numero: 8, descripcion: "B2 o superior, si el máster lo pide.", obligatorio: false }),
  ],
  156: [
    itemChecklist(156, ET_CONSULADO, "Pasaporte vigente", "aprobado", { numero: 1, docs: [{ nombre: "pasaporte-valeria-ramos.pdf", revision: "aprobado", hace: -14 }] }),
    itemChecklist(156, ET_CONSULADO, "Carta de admisión de la universidad", "aprobado", { numero: 2, docs: [{ nombre: "carta-admision-uc3m.pdf", revision: "aprobado", hace: -10 }] }),
    itemChecklist(156, ET_CONSULADO, "Seguro médico", "pendiente", { numero: 3, descripcion: "Cobertura completa en España, sin copagos ni carencias." }),
    itemChecklist(156, ET_CONSULADO, "Antecedentes penales apostillados", "pendiente", { numero: 4, descripcion: "Con menos de 3 meses de antigüedad." }),
    itemChecklist(156, ET_CONSULADO, "Certificado médico", "pendiente", { numero: 5, descripcion: "Con la fórmula del Reglamento Sanitario Internacional." }),
    itemChecklist(156, ET_SOLVENCIA, "Extractos bancarios de los últimos 6 meses", "enviado", { numero: 6, grupo: "solvencia_propios", docs: [{ nombre: "extractos-bcp-6-meses.pdf", hace: -4, bytes: 3_100_000 }] }),
  ],
  157: [],
  // Doctorado: los nombres los reconoce doctorado.js (DOCS_DOCTORADO) y los
  // reparte por paso. Diagnóstico (hecho) con uno observado → su paso sale «a
  // corregir»; Programas hecho; Candidatura en curso, con el aval pedido.
  160: [
    itemChecklist(160, ET_DOC_DIAGNOSTICO, "Pasaporte vigente", "aprobado", { numero: 1, docs: [{ nombre: "pasaporte-valeria-ramos.pdf", revision: "aprobado", hace: -60 }] }),
    itemChecklist(160, ET_DOC_DIAGNOSTICO, "Título de máster apostillado", "aprobado", { numero: 2, docs: [{ nombre: "titulo-master-apostillado.pdf", revision: "aprobado", hace: -58 }] }),
    itemChecklist(160, ET_DOC_DIAGNOSTICO, "Notas de máster apostilladas", "observado", { numero: 3, descripcion: "Con la escala de calificación de tu universidad.", comentario: "La apostilla tapa la nota media: pide una copia con la apostilla en hoja aparte.", docs: [{ nombre: "notas-master-apostilladas.pdf", revision: "observado", hace: -9, bytes: 1_450_000 }] }),
    itemChecklist(160, ET_DOC_DIAGNOSTICO, "Certificado de acceso a doctorado", "aprobado", { numero: 4, docs: [{ nombre: "certificado-acceso-doctorado.pdf", revision: "aprobado", hace: -55 }] }),
    itemChecklist(160, ET_DOC_DIAGNOSTICO, "Currículum vitae (CV)", "aprobado", { numero: 5, docs: [{ nombre: "cv-valeria-ramos.pdf", revision: "aprobado", hace: -55 }] }),
    itemChecklist(160, ET_DOC_CANDIDATURA, "Carta de motivación", "enviado", { numero: 6, descripcion: "Una página, dirigida a la comisión académica del programa.", docs: [{ nombre: "carta-motivacion-doctorado.pdf", hace: -2, bytes: 240_000 }] }),
    itemChecklist(160, ET_DOC_CANDIDATURA, "Anteproyecto de investigación", "pendiente", { numero: 7, descripcion: "Entre 5 y 10 páginas: problema, objetivos, metodología y bibliografía." }),
    itemChecklist(160, ET_DOC_CANDIDATURA, "Aval del director de tesis", "solicitado", { numero: 8, comentario: "La Dra. Méndez aceptó dirigir tu tesis: pídele que firme el aval con el modelo de la Universidad de Salamanca." }),
    itemChecklist(160, ET_DOC_RESIDENCIA, "Seguro médico sin copagos", "pendiente", { numero: 9, descripcion: "Cobertura completa en España, sin copagos ni carencias." }),
  ],
  // Grado: todo cae en el paso «documentos» (docs de la ficha de grado).
  161: [
    itemChecklist(161, ET_GRADO_DOCUMENTOS, "Certificado de estudios secundarios (1.º a 5.º) con QR, firmado, sellado, visado por el Minedu y apostillado", "observado", { numero: 1, descripcion: "El certificado oficial de 1.º a 5.º de secundaria con código QR, escaneado nítido, al 100 %, en un solo PDF.", comentario: "Falta el visado del Minedu en el reverso: sin él, el Ministerio de Educación no admite la homologación.", docs: [{ nombre: "certificado-secundaria-apostillado.pdf", revision: "observado", hace: -6, bytes: 1_980_000 }] }),
    itemChecklist(161, ET_GRADO_DOCUMENTOS, "Pasaporte certificado por Migraciones y apostillado (primera hoja)", "aprobado", { numero: 2, descripcion: "La primera hoja del pasaporte, certificada por Migraciones y apostillada.", docs: [{ nombre: "pasaporte-certificado-apostillado.pdf", revision: "aprobado", hace: -20 }] }),
    itemChecklist(161, ET_GRADO_DOCUMENTOS, "DNI (ambas caras)", "solicitado", { numero: 3, comentario: "Lo pide la universidad para la preinscripción: las dos caras en un solo PDF." }),
  ],
};

// ── Formulario académico, instructivos, elección, informe, postulaciones ────
const FORMULARIO = {
  promedio_peru: "15.2", ubicacion_grupo: "tercio_superior", otra_maestria_tiene: "no",
  experiencia_anios: "2", experiencia_vinculada: "si", ingles_situacion: "b2",
  beca_desea: "si", duracion_preferida: "1", practicas_preferencia: "si",
  carrera_titulo: "Derecho", area_carrera: "Ciencias Sociales y Jurídicas",
  universidad_origen: "Universidad Nacional Mayor de San Marcos",
  presupuesto_hasta: "6000", inicio_previsto: "sep_2027",
  sub_areas: ["derecho_internacional", "derecho_empresa"],
  comunidades: ["Comunidad de Madrid", "Cataluña", "Comunidad Valenciana"],
};

const INSTRUCTIVOS = [
  { id_instructivo: 1, label: "Modelo de carta de motivación", descripcion: "Plantilla en Word con la estructura que piden las universidades públicas.", archivo_url: "instructivos/carta-motivacion.docx", orden: 1 },
  { id_instructivo: 2, label: "Plantilla de currículum Europass", descripcion: "Formato europeo en español, listo para rellenar.", archivo_url: "instructivos/cv-europass.docx", orden: 2 },
  { id_instructivo: 3, label: "Guía para apostillar en el Perú", descripcion: "Pasos en el Ministerio de Relaciones Exteriores y costos.", archivo_url: "instructivos/apostilla-peru.pdf", orden: 3 },
];

const UNIS = {
  uc3m: { sigla: "UC3M", nombre_completo: "Universidad Carlos III de Madrid", ciudad: "Getafe (Madrid)", comunidad: "Comunidad de Madrid", url: "https://www.uc3m.es" },
  ucm: { sigla: "UCM", nombre_completo: "Universidad Complutense de Madrid", ciudad: "Madrid", comunidad: "Comunidad de Madrid", url: "https://www.ucm.es" },
  uv: { sigla: "UV", nombre_completo: "Universitat de València", ciudad: "Valencia", comunidad: "Comunidad Valenciana", url: "https://www.uv.es" },
  ub: { sigla: "UB", nombre_completo: "Universitat de Barcelona", ciudad: "Barcelona", comunidad: "Cataluña", url: "https://www.ub.edu" },
  uab: { sigla: "UAB", nombre_completo: "Universitat Autònoma de Barcelona", ciudad: "Bellaterra (Barcelona)", comunidad: "Cataluña", url: "https://www.uab.cat" },
  uam: { sigla: "UAM", nombre_completo: "Universidad Autónoma de Madrid", ciudad: "Madrid", comunidad: "Comunidad de Madrid", url: "https://www.uam.es" },
};

function master(id, nombre, uni, precio, credito, extra = {}) {
  return {
    id_master: id, nombre_limpio: nombre, modalidad: "Presencial", duracion_anios: 1, tiene_practicas: true,
    es_titulo_oficial: true, precio_total_estimado: precio, precio_final: null, precio_credito: credito,
    tasa_solicitud: null, tasa_estudio_titulo: null, requiere_estudio_titulo: false, proceso_previo: null,
    ects: 60, url_ficha: `${UNIS[uni].url}/masteres/${id}`, sub_area: "Derecho", estado_ficha: "ok",
    afinidad_deseada: "fuerte", coincide_con: "derecho internacional", de_que_va: "contratación internacional · arbitraje · derecho de la Unión Europea",
    acceso_titulo: "directo", es_ancla: false, avisos: [], motivo_descarte: null, solo_con_beca: false,
    baremo: [{ criterio: "Expediente académico", categoria: "academico", escala: "0-10", peso: 60 }, { criterio: "Carta de motivación", categoria: "otros", escala: "0-10", peso: 20 }, { criterio: "Idiomas", categoria: "idiomas", escala: "0-10", peso: 20 }],
    becas: [],
    universidad: UNIS[uni],
    ...extra,
  };
}
const MASTERS = [
  master(1201, "Máster Universitario en Abogacía y Procura", "uc3m", 2100, 35.4),
  master(1305, "Máster Universitario en Derecho Internacional y Relaciones Internacionales", "ucm", 2400, 40.2, { coincide_con: "relaciones internacionales" }),
  master(1410, "Máster Universitario en Derecho de los Negocios", "uv", 1950, 32.5, { afinidad_deseada: "parcial", coincide_con: "derecho de la empresa", de_que_va: "sociedades · contratos mercantiles · fiscalidad" }),
  master(1522, "Máster Universitario en Estudios Jurídicos Avanzados", "ub", 2600, 43.3, { afinidad_deseada: "parcial", tiene_practicas: false, becas: [{ clave: "ub-excelencia", nombre: "Beca de excelencia UB", entidad: "Universitat de Barcelona", curso: "2027-28", cubre: "Matrícula", ayuda_mensual: null, nota_minima: 8, plazo_fin: "2027-06-30", url: "https://www.ub.edu/becas" }] }),
  master(1618, "Máster Universitario en Derechos Humanos y Democratización", "uab", 2300, 38.3, { acceso_titulo: "afin", de_que_va: "derechos humanos · derecho internacional público · cooperación" }),
  master(1733, "Máster Universitario en Derecho Público", "uam", 2050, 34.1, { acceso_titulo: "sin_lista", estado_ficha: "no_hallado", avisos: ["La ficha 2027/28 aún no está publicada: precios del curso anterior."] }),
];
const ventana = (cierra, inicio) => ({ estado: "abierta", dias: diasHasta(cierra), fase: "Fase 2", inicio, fin: cierra, postulacion_inicio: inicio, postulacion_fin: cierra });
const COMPATIBILIDAD = {
  total: 6, curado: true, finalistas: 5, perfil: null,
  resultados: [
    { master: MASTERS[0], score: 92, ventana: ventana(dia(9), dia(-30)), nota_asesor: "Tu mejor opción: admite Derecho directamente y las prácticas cuentan para la colegiación." },
    { master: MASTERS[1], score: 88, ventana: ventana(dia(25), dia(-20)), nota_asesor: "Muy alineado con lo que buscas. Plaza competida: la carta de motivación pesa." },
    { master: MASTERS[2], score: 84, ventana: ventana(dia(40), dia(-10)), nota_asesor: null },
    { master: MASTERS[3], score: 81, ventana: ventana(dia(52), dia(5)), nota_asesor: "Con beca de excelencia sale casi sin coste; pide nota media ≥ 8." },
    { master: MASTERS[4], score: 78, ventana: ventana(dia(60), dia(10)), nota_asesor: null },
    { master: MASTERS[5], score: 74, ventana: ventana(dia(75), dia(20)), nota_asesor: "Lo confirmo con la universidad antes de recomendarlo solo." },
  ],
  solo_con_beca: [],
};

const ELECCIONES = [
  { id_master: 1201, programa: "", nombre_limpio: MASTERS[0].nombre_limpio, universidad: UNIS.uc3m.nombre_completo, ciudad: UNIS.uc3m.ciudad, score: 92, prioridad: 1, comentario: "Es mi primera opción por las prácticas.", plan_incluido: true, manual: false, _nota_asesor: "De acuerdo. Entra en el plan." },
  { id_master: 1305, programa: "", nombre_limpio: MASTERS[1].nombre_limpio, universidad: UNIS.ucm.nombre_completo, ciudad: UNIS.ucm.ciudad, score: 88, prioridad: 2, comentario: "", plan_incluido: true, manual: false, _nota_asesor: "Entra en el plan. Prepara la carta de motivación con el modelo." },
  { id_master: 1410, programa: "", nombre_limpio: MASTERS[2].nombre_limpio, universidad: UNIS.uv.nombre_completo, ciudad: UNIS.uv.ciudad, score: 84, prioridad: 3, comentario: "Me interesa por el precio.", plan_incluido: null, manual: false, _nota_asesor: null },
];

function postulacion(m, prioridad, cierra, extra = {}) {
  return {
    id_master: m.id_master, id_acceso: null, nombre_limpio: m.nombre_limpio, universidad: m.universidad.nombre_completo, ciudad: m.universidad.ciudad,
    precio: m.precio_total_estimado, prioridad, estado: "pendiente",
    fecha_apertura: dia(-30), fecha_cierre: cierra, fecha_resultados: "", fase_nombre: "Fase 2", fase_curso: "2027-28",
    fases_curso: [{ nombre: "Fase 1", inicio: dia(-90), fin: dia(-40) }, { nombre: "Fase 2", inicio: dia(-30), fin: cierra }],
    portal_url: `${m.universidad.url}/admision`, portal_usuario: CLIENTE.email, portal_password: "", portal_notas: "", portal_estado: "abierto",
    expediente: "", portales_cliente: [],
    alertas: [{ tipo: "7d", label: "7 días antes del cierre", activo: true }, { tipo: "3d", label: "3 días", activo: true }, { tipo: "1d", label: "1 día — alerta urgente", activo: true }],
    seguimiento: "", id_universidad: 1, sigla: m.universidad.sigla, id_comunidad: 1, comunidad: m.universidad.comunidad, sistema_postulacion: "Portal propio de la universidad",
    documentos: [], justificantes: [], avisos: [],
    ...extra,
  };
}
const POSTULACIONES = [
  postulacion(MASTERS[0], 1, dia(9), { seguimiento: "Cuenta creada en el portal. Falta adjuntar la carta de motivación." }),
  postulacion(MASTERS[1], 2, dia(25)),
];

// ── Mensajes y novedades ────────────────────────────────────────────────────
let idMsg = 300;
const msg = (autor, hace, texto, leido = true) => ({
  id_mensaje: ++idMsg, autor_tipo: autor, autor_nombre: autor === "ASESOR" ? ASESORA.nombre : CLIENTE.nombre,
  texto, fecha: iso(hace, autor === "ASESOR" ? 11 : 20), leido_at: leido ? iso(hace, 21) : null, leido_por: leido && autor === "ASESOR" ? CLIENTE.nombre : null,
});
const MENSAJES = {
  155: [
    msg("CLIENTE", -8, "Hola Andrea, ya subí mi título apostillado y el certificado de notas. ¿Está bien la apostilla del título?"),
    msg("ASESOR", -8, "Hola Valeria, recibido. Los reviso esta semana y te confirmo por aquí."),
    msg("CLIENTE", -3, "¿Hay novedades sobre el informe de másteres?"),
    msg("ASESOR", -2, `Ya publicamos tu informe en el paso 3. Son seis opciones; la de la UC3M cierra el ${dia(9)}, así que conviene decidir pronto.`, false),
    msg("ASESOR", -1, "Recuerda subir la carta de motivación antes del viernes para que podamos revisarla con tiempo.", false),
  ],
  156: [
    msg("ASESOR", -3, `El consulado pidió un certificado bancario actualizado y la carta de admisión sellada. El plazo vence el ${dia(5)}: súbelos en «Mis documentos» y te confirmo el envío.`),
    msg("CLIENTE", -3, "Entendido, mañana pido el certificado en el banco."),
  ],
  157: [
    msg("ASESOR", -12, "Bienvenida a tu expediente de estancia. Empieza por completar tus datos y revisa la guía de documentos; cualquier duda, por aquí."),
  ],
  158: [
    msg("ASESOR", -9, "Hola Valeria, ya puedes subir tus documentos del PAC. Lo que más tarda son los antecedentes penales con su apostilla: pídelos cuanto antes."),
    msg("CLIENTE", -8, "Gracias, Andrea. Mañana subo el contrato y la foto."),
  ],
  159: [
    msg("ASESOR", -6, "Tu empresa todavía no nos ha enviado la escritura ni el modelo 200. Si puedes, recuérdaselo a Recursos Humanos: es lo que frena el expediente."),
  ],
  160: [
    msg("ASESOR", -9, "La Dra. Méndez aceptó dirigir tu tesis. En cuanto tengamos su aval presentamos la candidatura."),
  ],
  161: [
    msg("ASESOR", -3, "Ya tienes tu informe de carreras en el paso 3. Míralo con calma y dime cuáles te convencen."),
  ],
  162: [
    msg("ASESOR", -20, "Diego, bienvenido. Valeria también puede entrar a este expediente para ayudarte con los documentos."),
  ],
};

const NOVEDADES = {
  155: [
    { clave: "msg-1", tipo: "mensaje", titulo: `${ASESORA.nombre.split(" ")[0]} te escribió 2 mensajes`, fecha: iso(-1, 11), seccion: "mensajes" },
    { clave: "doc-obs-155", tipo: "documento_observado", titulo: "Tu asesor observó «Currículum Europass»", detalle: "Falta tu experiencia en el estudio jurídico y la fecha de fin del grado.", fecha: iso(-1, 16), seccion: "docs" },
    { clave: "etapa-1", tipo: "etapa", titulo: "Tu proceso avanzó: Búsqueda", fecha: iso(-2, 9), seccion: null },
    { clave: "doc-ok-1", tipo: "documento_aprobado", titulo: "Tu asesor aprobó «Pasaporte vigente»", fecha: iso(-6, 16), seccion: "docs" },
    { clave: "doc-in-1", tipo: "documento_inspira", titulo: "Inspira añadió «Nota media convertida»", fecha: iso(-6, 15), seccion: "docs" },
    { clave: "doc-rx-1", tipo: "documento_recibido", titulo: "Recibimos «Título universitario apostillado»", fecha: iso(-8, 20), seccion: "docs" },
  ],
  156: [
    { clave: "req-1", tipo: "requerimiento", titulo: "El consulado pidió documentación adicional", detalle: `Plazo: ${dia(5)}`, fecha: iso(-3, 10), seccion: "estado" },
    { clave: "doc-rx-2", tipo: "documento_recibido", titulo: "Recibimos «Extractos bancarios de los últimos 6 meses»", fecha: iso(-4, 19), seccion: "docs" },
  ],
  158: [
    { clave: "pac-obs-1", tipo: "documento_observado", titulo: "Tu asesor observó «Antecedentes penales apostillados»", detalle: "Es del 2 de junio: al presentar tendrá más de tres meses.", fecha: iso(-1, 12), seccion: "docs" },
    { clave: "pac-rx-1", tipo: "documento_recibido", titulo: "Recibimos «Contrato de trabajo firmado»", fecha: iso(-2, 19), seccion: "docs" },
    { clave: "pac-ok-1", tipo: "documento_aprobado", titulo: "Tu asesor aprobó «Pasaporte completo»", fecha: iso(-5, 10), seccion: "docs" },
  ],
  159: [
    { clave: "mod-obs-1", tipo: "documento_observado", titulo: "Tu asesor observó «Certificado de notas»", detalle: "Es el certificado provisional: falta la nota del Trabajo Fin de Máster.", fecha: iso(-2, 11), seccion: "docs" },
    { clave: "mod-et-1", tipo: "etapa", titulo: "Tu proceso avanzó: Esperando documentos de tu empresa", fecha: iso(-4, 9), seccion: null },
    { clave: "mod-ok-1", tipo: "documento_aprobado", titulo: "Tu asesor aprobó «Precontrato de trabajo»", fecha: iso(-9, 16), seccion: "docs" },
  ],
  160: [
    { clave: "doc-obs-160", tipo: "documento_observado", titulo: "Tu asesor observó «Notas de máster apostilladas»", detalle: "La apostilla tapa la nota media.", fecha: iso(-2, 15), seccion: "docs" },
    { clave: "doc-et-160", tipo: "etapa", titulo: "Tu proceso avanzó: Candidatura", fecha: iso(-6, 9), seccion: null },
    { clave: "doc-rx-160", tipo: "documento_recibido", titulo: "Recibimos «Carta de motivación»", fecha: iso(-2, 20), seccion: "docs" },
  ],
  161: [
    { clave: "gr-obs-1", tipo: "documento_observado", titulo: "Tu asesor observó «Certificado de estudios secundarios»", detalle: "Falta el visado del Minedu en el reverso.", fecha: iso(-1, 10), seccion: "docs" },
    { clave: "gr-et-1", tipo: "etapa", titulo: "Tu proceso avanzó: Informe", fecha: iso(-3, 9), seccion: null },
  ],
  162: [],
  157: [
    { clave: "doc-obs-1", tipo: "documento_observado", titulo: "Tu asesor observó «Seguro médico»", detalle: "La póliza debe cubrir todo el periodo de estudios y sin copagos.", fecha: iso(-2, 12), seccion: "docs" },
    { clave: "doc-rx-3", tipo: "documento_recibido", titulo: "Recibimos «Pasaporte completo»", fecha: iso(-9, 18), seccion: "docs" },
  ],
};

// ── Visado (GET /solicitudes/156/visa-expediente, /sesiones, /visa-documentos) ──
const VISA_EXPEDIENTE = {
  id_expediente: 56, id_solicitud: 156,
  apellidos: "Ramos Quispe", apellidos_nacimiento: "Ramos Quispe", nombres: "Valeria", fecha_nacimiento: "1999-03-14",
  lugar_nacimiento: "Lima", pais_nacimiento: "Perú", nacionalidad: "Peruana", sexo: "F", estado_civil: "Soltero/a", profesion: "Abogada",
  tipo_documento: "Pasaporte", num_pasaporte: "P0000123", exp_pasaporte: "2021-06-30", venc_pasaporte: "2031-06-30", pais_expedicion: "Perú",
  dni: "70000123", telefono: "+51 987 000 123", correo: CLIENTE.email, domicilio: "Av. Ejemplo 123, Miraflores, Lima",
  centro_nombre: UNIS.uc3m.nombre_completo, centro_direccion: "Calle Madrid 126, 28903 Getafe", centro_telefono: "+34 91 624 00 00", centro_correo: "admision@example.es",
  centro_inicio: "2027-09-13", centro_fin: "2028-06-30",
  viaje_fecha_prevista: "2027-08-25", domicilio_espana: "Calle Ejemplo 4, 3.º B, 28903 Getafe", tipo_estudios: "MASTER", semestres_total: 2,
  datos_cliente_at: iso(-20), formulario_estado: "BORRADOR", bls_tiene_cuenta: true, bls_usuario: CLIENTE.email,
  tipo_solvencia: "PROPIOS", aval_nombre: null, aval_vinculo: null, aval_pais: null, aval_monto: null, aval_banco: null,
  medios_calc: null, medios_perfiles: null, medios_especiales: null, dj_datos: null,
  cita_fecha: dia(18), cita_fecha_tentativa: null, cita_hora: "10:30", cita_ref_bls: "BLS-2026-004471", cita_tasa: "", cita_estado: "AGENDADA",
  visado_resultado: null, visado_resultado_fecha: null,
  requerimiento_estado: "SOLICITADO", requerimiento_fecha: dia(-3), requerimiento_plazo: dia(5),
  requerimiento_detalle: "Certificado bancario actualizado de los últimos tres meses y carta de admisión con sello original de la universidad.",
  via_posterior: null, via_posterior_fecha: null, cierre_estado: null,
  dj_doc_nombre: "declaracion-jurada-valeria-ramos.pdf", form_doc_nombre: null,
  updated_at: iso(-1), bls_password: "",
};
const SESIONES = [
  { id_sesion: 1, tipo: "DIAGNOSTICO", estado: "COMPLETADA", fecha: dia(-21), hora: "17:00", plataforma: "Google Meet", canal: "video", enlace_meet: "https://meet.google.com/qa-ficticio", notas: "Vía de medios propios. Preparar extractos de 6 meses y seguro sin copagos." },
  { id_sesion: 2, tipo: "SEGUIMIENTO", estado: "PROGRAMADA", fecha: dia(7), hora: "18:00", plataforma: "Google Meet", canal: "video", enlace_meet: "https://meet.google.com/qa-ficticio-2", notas: null },
  { id_sesion: 3, tipo: "PRECITA", estado: "PENDIENTE", fecha: null, hora: null, plataforma: null, canal: null, enlace_meet: null, notas: null },
];
const VISA_DOCUMENTOS = {
  dj: { nombre: "declaracion-jurada-valeria-ramos.pdf", mime: "application/pdf", etiqueta: "Declaración jurada" },
  formulario: null,
};

// ── Estancia (GET /solicitudes/157/estancia, /documentos, /extranjeria) ─────
const ETAPAS_ESTANCIA = [
  { clave: "DATOS", cliente: "Completando tus datos", explica_cliente: "Rellena tus datos en el primer apartado para que podamos empezar.", tono: "neutral" },
  { clave: "DOCUMENTOS", cliente: "Subiendo tus documentos", explica_cliente: "Sube en el apartado de documentos todo lo que te pedimos en la guía.", tono: "azul" },
  { clave: "REVISION", cliente: "Revisión de documentos", explica_cliente: "Tu asesora está revisando lo que subiste. Si falta algo, te lo dirá por mensaje.", tono: "ambar" },
  { clave: "PRESENTADO", cliente: "Presentado", explica_cliente: "La solicitud ya está en Extranjería. Ahora toca esperar la resolución.", tono: "violeta" },
  { clave: "REQUERIDO", cliente: "Requerido", explica_cliente: "Extranjería pide algo más. Mira el requerimiento y el plazo.", tono: "rojo" },
  { clave: "FAVORABLE", cliente: "Favorable", explica_cliente: "Tu estancia está concedida. Siguiente paso: la TIE.", tono: "verde" },
  { clave: "DESFAVORABLE", cliente: "Desfavorable", explica_cliente: "Resolución desfavorable. Tu asesora te explica las opciones.", tono: "rojo" },
];
const ANTELACION = "2027-07-13", TOPE = "2027-09-12";
const ESTANCIA_EXPEDIENTE = {
  apellido1: "Ramos", apellido2: "Quispe", nombres: "Valeria", fecha_nacimiento: "1999-03-14", lugar_nacimiento: "Lima",
  pais_nacimiento: "Perú", nacionalidad: "Peruana", sexo: "Mujer", estado_civil: "Soltero/a", nombre_padre: "", nombre_madre: "",
  pasaporte_numero: "P0000123", dni: "70000123", pasaporte_emision: "2021-06-30", pasaporte_caducidad: "2031-06-30",
  correo: CLIENTE.email, telefono: "+51 987 000 123",
  fecha_admision: "2027-06-15", fecha_llegada_espana: "2027-08-25", fecha_inicio_clases: "2027-09-13", prog_fin: "2028-06-30", viaje_schengen_180: false,
  uni_denominacion: UNIS.uc3m.nombre_completo, prog_denominacion: MASTERS[0].nombre_limpio, tipo_estudios: "MASTER", tipo_titulo: "OFICIAL", master_tipo: "OFICIAL", creditos: "60",
  prog_modalidad: "PRESENCIAL", prog_codigo: "4312345",
  uni_direccion: "Calle Madrid 126", uni_localidad: "Getafe", uni_cp: "28903", uni_provincia: "Madrid", uni_registro_tipo: "RUCT", uni_registro_num: "4312345",
  dom_usa_universidad: false, dom_direccion: "Calle Ejemplo", dom_numero: "4", dom_piso: "3.º B", dom_localidad: "Getafe", dom_cp: "28903", dom_provincia: "Madrid",
  notas: "", con_acompanantes: false,
  expediente_numero: null, expediente_justificante: null, expediente_nie: null, expediente_fecha: null,
  revision_solicitada_at: null,
  invitados: [],
  revision: {
    faltan: ["Nombre del padre", "Nombre de la madre"],
    completo: false,
    plazos: {
      antelacion: { limite: ANTELACION, dias_restantes: diasHasta(ANTELACION), a_tiempo: true },
      tope: { limite: TOPE, dias_restantes: diasHasta(TOPE), a_tiempo: true },
      avisos: [{ nivel: "medio", texto: `Presenta la solicitud como muy tarde el ${ANTELACION}, dos meses antes del inicio de clases. Extranjería puede tardar hasta tres meses en resolver.` }],
    },
    etapa: ETAPAS_ESTANCIA[1],
    recorrido: ETAPAS_ESTANCIA.slice(0, 6).map((e, i) => ({ ...e, actual: i === 1, pasada: i < 1 })),
  },
};

function ranura(def, archivos = [], estado = null) {
  return { ...def, archivos, estado: estado || (archivos.length ? "PENDIENTE" : "SIN_SUBIR") };
}
const archivo = (id, nombre, extra = {}) => ({ id_documento: id, nombre, mime: "application/pdf", tamano: 980_000, subido_por: "cliente", subido_por_quien: CLIENTE.nombre, observacion: null, ...extra });
const ESTANCIA_DOCUMENTOS = {
  ranuras: {
    antecedentes: ranura({ de: "cliente", obligatorio: true, etiqueta: "Antecedentes penales", requisito: "De todos los países donde hayas residido en los últimos 5 años, apostillados y con menos de 3 meses de antigüedad." }),
    pasaporte: ranura({ de: "cliente", obligatorio: true, etiqueta: "Pasaporte completo", requisito: "Todas las páginas, de la primera a la última, tengan sellos o no, escaneadas en un único PDF." }, [archivo(7001, "pasaporte-completo.pdf")], "APROBADO"),
    seguro: ranura({ de: "cliente", obligatorio: true, etiqueta: "Seguro médico", requisito: "Póliza y condiciones particulares y generales, todo en un único PDF." }, [archivo(7002, "poliza-seguro.pdf", { observacion: "La póliza debe cubrir todo el periodo de estudios y sin copagos; esta vence en marzo de 2028." })], "OBSERVADO"),
    admision: ranura({ de: "cliente", obligatorio: true, etiqueta: "Carta de admisión y matrícula", requisito: "Carta de admisión, matrícula y comprobante de pago de los estudios (o seguro escolar, cuando corresponda)." }),
    medico: ranura({ de: "cliente", obligatorio: true, etiqueta: "Certificado médico", requisito: "Preferiblemente español; vale del país de origen si cumple los requisitos.", modelo: "/modelos/estancia-certificado-medico.html", modelo_nota: "Tiene que ir en el impreso oficial del Colegio de Médicos y decir, con estas palabras, que NO padece ninguna de las enfermedades que pueden tener graves repercusiones de salud pública de conformidad con el Reglamento Sanitario Internacional de 2005." }),
    solvencia: ranura({ de: "cliente", obligatorio: true, etiqueta: "Solvencia económica", requisito: "Extracto de cuenta española con sello y firma del banco, fecha actualizada y saldo mínimo de 7.200 €.", modelo: "/modelos/estancia-extracto-bancario.html", modelo_nota: "Extracto de movimientos de una cuenta española, con el sello y la firma de la oficina en el propio papel." }, [archivo(7003, "extracto-sellado-octubre.pdf")]),
    entrada: ranura({ de: "cliente", obligatorio: true, etiqueta: "Entrada a España", requisito: "Tarjeta de embarque con la fecha de llegada a España." }, [archivo(7004, "tarjeta-embarque.pdf")], "APROBADO"),
    firma: ranura({ de: "cliente", obligatorio: true, etiqueta: "Firma digitalizada", requisito: "Firma sobre papel blanco, escaneada o fotografiada." }, [archivo(7005, "firma.png", { mime: "image/png", tamano: 120_000 })], "APROBADO"),
    otros_cliente: ranura({ de: "cliente", obligatorio: false, varios: true, etiqueta: "Otros documentos", requisito: "Cualquier cosa que creas que suma a tu expediente." }),
    representacion: ranura({ de: "asesor", obligatorio: false, etiqueta: "Carta de representación", requisito: "La firma el abogado." }, [archivo(7006, "carta-representacion.pdf", { subido_por: "asesor", subido_por_quien: ASESORA.nombre })]),
    ex00: ranura({ de: "asesor", obligatorio: false, etiqueta: "Formulario EX-00", requisito: "Lo prepara Inspira." }),
    tasa790: ranura({ de: "asesor", obligatorio: false, etiqueta: "Tasa 790", requisito: "Formulario de pago de la tasa." }),
    declaracion_plazo: ranura({ de: "asesor", obligatorio: false, etiqueta: "Declaración jurada de plazo", requisito: "Sólo si se presenta con menos de dos meses de antelación: explica los motivos." }),
    mejor_resolver: ranura({ de: "asesor", obligatorio: false, etiqueta: "Declaración jurada a mejor resolver", requisito: "Para aclaraciones u observaciones que pida extranjería." }),
    justificante: ranura({ de: "asesor", obligatorio: false, etiqueta: "Justificante de registro", requisito: "El PDF que genera MERCURIO al presentar la solicitud." }),
    otros_asesor: ranura({ de: "asesor", obligatorio: false, varios: true, etiqueta: "Otros documentos (Inspira)", requisito: "" }),
  },
  faltan: ["antecedentes", "admision", "medico"],
  observados: ["seguro"],
};

// ── Fichas copiadas del backend (para que el panel pinte lo mismo que en producción) ──
// GRADO_DEF: tramites/definiciones.js → publica(), con solo los campos `cliente`
// (tramites.service.leer con paraCliente) y sin paquetes, etapas ni
// etapaProgreso, que el panel no lee. ETAPAS_*: pac.flujo.js y modificatoria.flujo.js.
const GRADO_DEF = {
  clave: "grado",
  nombre: "Grado en España",
  etiqueta: "Grado",
  guia: null,
  linea: "Tu carrera universitaria en España, paso a paso",
  pasoDeEtapa: {"Nuevo":0,"Documentación":0,"Homologación":0,"Formulario":1,"Informe":2,"Elección":3,"Postulado":4,"Esperando resultado":4,"Lista de espera":4,"No admitido":4,"Admitido":5,"Matrícula":5,"Finalizado":5,"Suspendido":0},
  pasos: [
    { ...{"id":"documentos","icono":"folder","corto":"Documentos","titulo":"Documentos y homologación","explica":"Dos documentos: el certificado de estudios secundarios de 1.º a 5.º (con QR, firmado y sellado por el director, visado por el Minedu y apostillado) y la primera hoja del pasaporte certificada por Migraciones y apostillada. Con ellos homologamos tu secundaria al Bachillerato español: los subes escaneados, nos envías los originales y nosotros los mandamos a España. Es el trámite que más tarda, por eso va primero.","tuParte":"Sube los dos documentos escaneados nítidos al 100 % y, cuando te lo indiquemos, envía los originales a nuestras oficinas.","proceso":true},
      ruta: {"campo":"he_estado","titulo":"Tu homologación escolar","color":"#8A5A0B","estados":[{"valor":"Subir documentos","icono":"upload","titulo":"Subir documentos","texto":"Sube el certificado de estudios y el pasaporte apostillados, escaneados nítidos al 100 %."},{"valor":"Enviar documentos","icono":"send","titulo":"Enviar documentos","texto":"Envía los originales a las oficinas de Inspira: nosotros los mandamos a España."},{"valor":"Documentos en España","icono":"globe","titulo":"Documentos en España","texto":"Tus originales ya están en España y presentamos la solicitud ante el Ministerio."},{"valor":"Pago de tasa adicional","icono":"euro","titulo":"Pago de tasa adicional","texto":"Toca pagar la tasa oficial de la homologación; te indicamos cómo."},{"valor":"Pago de tasa completado","icono":"filetick","titulo":"Tasa pagada","texto":"La tasa está pagada y el expediente sigue su curso."},{"valor":"Volante de homologación","icono":"scroll","titulo":"Volante de homologación","texto":"Ya tienes el volante: con él puedes matricularte de forma condicional."},{"valor":"Resolución de homologación","icono":"award","titulo":"Resolución","texto":"El Ministerio resolvió tu homologación. La credencial queda guardada aquí."}]},
      campos: [
        {"clave":"he_estado","label":"Estado de la homologación","tipo":"opcion","opciones":["Subir documentos","Enviar documentos","Documentos en España","Pago de tasa adicional","Pago de tasa completado","Volante de homologación","Resolución de homologación"],"cliente":"ver"},
        {"clave":"he_centro","label":"Colegio donde terminó la secundaria","tipo":"texto","cliente":"editar","grupo":"Datos de tu colegio","ayuda":"El nombre oficial, tal como figura en el certificado."},
        {"clave":"he_ciudad","label":"Ciudad del colegio","tipo":"texto","cliente":"editar"},
        {"clave":"he_anio_fin","label":"Año en que terminaste la secundaria","tipo":"numero","cliente":"editar"},
        {"clave":"he_envio_fecha","label":"Originales enviados a Inspira el","tipo":"fecha","cliente":"ver","grupo":"Envío de originales"},
        {"clave":"he_envio_guia","label":"Nº de guía del envío","tipo":"texto","cliente":"ver"},
        {"clave":"he_llegada_espana_fecha","label":"Originales en España el","tipo":"fecha","cliente":"ver"},
        {"clave":"he_min_usuario","label":"Usuario en la sede del Ministerio","tipo":"texto","cliente":"ver","grupo":"Ministerio de Educación","ayuda":"La cuenta que Inspira crea para el asesorado en la sede electrónica."},
        {"clave":"he_min_clave","label":"Clave de la sede","tipo":"secreto","cliente":"ver"},
        {"clave":"he_presentacion_fecha","label":"Fecha de presentación","tipo":"fecha","cliente":"ver"},
        {"clave":"he_expediente","label":"Nº de expediente","tipo":"texto","cliente":"ver"},
        {"clave":"he_tasa_importe","label":"Importe de la tasa (€)","tipo":"numero","cliente":"ver","grupo":"Tasa"},
        {"clave":"he_tasa_pagada","label":"Tasa pagada","tipo":"opcion","opciones":["Sí","No"],"cliente":"ver"},
        {"clave":"he_tasa_fecha","label":"Fecha de pago de la tasa","tipo":"fecha","cliente":"ver"},
        {"clave":"he_volante_fecha","label":"Fecha del volante","tipo":"fecha","cliente":"ver","grupo":"Volante y resolución"},
        {"clave":"he_resolucion","label":"Resolución","tipo":"opcion","opciones":["Pendiente","Favorable","Denegada","Requerimiento"],"cliente":"ver"},
        {"clave":"he_resolucion_fecha","label":"Fecha de la resolución","tipo":"fecha","cliente":"ver"},
        {"clave":"he_credencial_url","label":"Credencial de homologación (enlace)","tipo":"url","cliente":"ver"},
      ] },
    { ...{"id":"formulario","icono":"fileText","corto":"Formulario","titulo":"Formulario","explica":"Nos cuentas qué quieres estudiar en España: carrera universitaria, ciclo de Formación Profesional o las dos opciones, en qué ciudades y con qué presupuesto. Con esto preparamos tu informe.","tuParte":"Responde todas las preguntas. Las ciudades las acotas con tu asesor: tú propones y él te dice dónde conviene."},
      campos: [
        {"clave":"nivel","label":"Qué quiere estudiar","tipo":"opcion","opciones":["Grado universitario","Ciclo de Formación Profesional","Las dos opciones"],"cliente":"editar","grupo":"Qué quieres estudiar"},
        {"clave":"carreras_interes","label":"Carreras universitarias que le interesan","tipo":"textarea","cliente":"editar","ayuda":"Hasta tres, en orden. Por ejemplo: Administración de Empresas, Marketing, Psicología."},
        {"clave":"familia_fp","label":"Ciclos o familias de FP que le interesan","tipo":"textarea","cliente":"editar","ayuda":"Por ejemplo: Administración y finanzas, Desarrollo de aplicaciones web, Cuidados auxiliares de enfermería."},
        {"clave":"motivo","label":"Por qué esa elección y qué espera después","tipo":"textarea","cliente":"editar"},
        {"clave":"nota_secundaria","label":"Promedio de secundaria (0 a 20)","tipo":"numero","cliente":"editar","grupo":"Tu perfil"},
        {"clave":"ingles","label":"Nivel de inglés","tipo":"opcion","opciones":["Básico","Intermedio","Avanzado","Certificado (B2 o más)"],"cliente":"editar"},
        {"clave":"inicio_previsto","label":"Curso en el que quiere empezar","tipo":"opcion","opciones":["2026-2027","2027-2028","2028-2029"],"cliente":"editar"},
        {"clave":"presupuesto_anual","label":"Presupuesto anual para la matrícula (€)","tipo":"numero","cliente":"editar"},
        {"clave":"trabajar","label":"Quiere trabajar mientras estudia","tipo":"opcion","opciones":["Sí","No"],"cliente":"editar"},
        {"clave":"via_migratoria_prevista","label":"Desde dónde solicitará","tipo":"opcion","opciones":["Desde Perú (visado de estudios)","Ya en España (estancia por estudios)","No lo sé"],"cliente":"editar"},
        {"clave":"ciudades_preferidas","label":"Ciudades donde le gustaría vivir","tipo":"textarea","cliente":"editar","grupo":"Ciudades","ayuda":"Escribe las ciudades o comunidades donde te gustaría vivir, en orden de preferencia. Tu asesor las acota contigo."},
        {"clave":"ciudades_delimitadas","label":"Ciudades acotadas por el asesor","tipo":"textarea","cliente":"ver","ayuda":"Las que el asesor fija con el asesorado tras revisar precios, notas de corte y plazas."},
        {"clave":"nota_homologada","label":"Nota media del bachillerato homologado","tipo":"texto","cliente":"ver"},
      ] },
    { ...{"id":"informe","icono":"chart","corto":"Informe","titulo":"Informe","explica":"Con tu formulario buscamos en el RUCT (grados oficiales) y en el Registro Estatal de Centros Docentes (ciclos de FP) y te proponemos tres carreras universitarias y tres ciclos superiores, con universidad o centro, ciudad, nota de corte, plazas, precio y plazos de postulación.","tuParte":"Lee el informe con calma y anota tus dudas: las resolvemos antes de que elijas.","lista":true},
      campos: [
        {"clave":"informe_url","label":"Informe (enlace)","tipo":"url","cliente":"ver"},
        {"clave":"informe_publicado","label":"Informe publicado al asesorado","tipo":"opcion","opciones":["Sí","No"],"cliente":"ver"},
        {"clave":"informe_fecha","label":"Fecha del informe","tipo":"fecha","cliente":"ver"},
      ] },
    { ...{"id":"eleccion","icono":"checkCircle","corto":"Elección","titulo":"Elección","explica":"Revisado el informe, eliges a qué carreras y ciclos quieres postular. Marca tus preferidos; tu asesor confirma la elección final contigo.","tuParte":"Marca «Sí» en las opciones que quieres y cuéntanos tus dudas en el comentario.","lista":true},
      campos: [
        {"clave":"eleccion_comentario","label":"Comentario del asesorado sobre su elección","tipo":"textarea","cliente":"editar"},
        {"clave":"eleccion_cerrada","label":"Elección cerrada por el asesor","tipo":"opcion","opciones":["Sí","No"],"cliente":"ver"},
      ] },
    { ...{"id":"postulacion","icono":"send","corto":"Postular","titulo":"Postulaciones","explica":"Presentamos cada postulación elegida: preinscripción en la universidad o en el distrito único de la comunidad, e inscripción directa en los centros de FP. Si una carrera exige las pruebas PCE de UNEDasiss, gestionamos la inscripción, las materias, la sede y las fechas (no la preparación). Aquí ves cada portal, sus claves, plazos y resguardos.","tuParte":"Revisa aquí el estado de cada postulación. Si una universidad o centro te escribe directamente, cuéntanoslo por mensaje.","lista":true,"proceso":true},
      campos: [
        {"clave":"via_acceso","label":"Vía de acceso a la universidad","tipo":"opcion","opciones":["Sin examen (bachillerato homologado)","Con examen (PCE de UNEDasiss)","No aplica (solo FP)","Por decidir"],"cliente":"ver","grupo":"PCE de UNEDasiss (solo si aplica)"},
        {"clave":"uned_usuario","label":"Usuario en UNEDasiss","tipo":"texto","cliente":"ver"},
        {"clave":"uned_clave","label":"Clave de UNEDasiss","tipo":"secreto","cliente":"ver"},
        {"clave":"uned_inscripcion_fecha","label":"Fecha de inscripción a las PCE","tipo":"fecha","cliente":"ver"},
        {"clave":"uned_materias","label":"Materias de las PCE","tipo":"texto","cliente":"ver"},
        {"clave":"uned_sede","label":"Sede del examen","tipo":"texto","cliente":"ver"},
        {"clave":"uned_examen_fecha","label":"Fecha del examen","tipo":"fecha","cliente":"ver"},
        {"clave":"uned_nota","label":"Nota de acceso obtenida","tipo":"texto","cliente":"ver"},
      ] },
    { ...{"id":"cierre","icono":"flag","corto":"Admisión","titulo":"Admisión y cierre","explica":"Con la carta de admisión o la aceptación de plaza formalizamos la matrícula y arrancamos tu vía migratoria: el visado de estudios desde tu país o la estancia por estudios si ya estás en España.","tuParte":"Guarda la carta de admisión y la matrícula: son la base de tu visado o de tu estancia.","proceso":true},
      campos: [
        {"clave":"admision_centro","label":"Centro o universidad que admite","tipo":"texto","cliente":"ver"},
        {"clave":"admision_programa","label":"Programa admitido","tipo":"texto","cliente":"ver"},
        {"clave":"carta_admision_fecha","label":"Fecha de la carta de admisión","tipo":"fecha","cliente":"ver"},
        {"clave":"matricula_fecha","label":"Fecha de matrícula","tipo":"fecha","cliente":"ver"},
        {"clave":"inicio_clases","label":"Inicio de clases","tipo":"fecha","cliente":"ver"},
        {"clave":"via_migratoria","label":"Vía migratoria","tipo":"opcion","opciones":["Visado de estudios","Estancia por estudios","Por decidir"],"cliente":"ver","ayuda":"Visado si solicita desde tu país; estancia por estudios si ya está en España."},
      ] },
  ],
  lista: { ...{"titulo":"Carreras y ciclos propuestos","singular":"opción","enPasos":{"informe":"todas","eleccion":"todas","postulacion":"elegidas"}},
    campos: [
      {"clave":"tipo","label":"Tipo","tipo":"opcion","opciones":["Grado universitario","Ciclo de FP (grado superior)"]},
      {"clave":"programa","label":"Carrera o ciclo","tipo":"texto"},
      {"clave":"centro","label":"Universidad o centro","tipo":"texto"},
      {"clave":"ciudad","label":"Ciudad","tipo":"texto"},
      {"clave":"comunidad","label":"Comunidad","tipo":"texto"},
      {"clave":"titularidad","label":"Titularidad","tipo":"opcion","opciones":["Pública","Concertada","Privada"]},
      {"clave":"codigo_registro","label":"Código RUCT / RCD","tipo":"texto"},
      {"clave":"nota_corte","label":"Nota de corte","tipo":"texto"},
      {"clave":"plazas","label":"Plazas","tipo":"texto"},
      {"clave":"baremo","label":"Baremo o criterio de admisión","tipo":"textarea"},
      {"clave":"precio","label":"Precio al año (€)","tipo":"texto"},
      {"clave":"plazo_inicio","label":"Abre el plazo","tipo":"fecha"},
      {"clave":"plazo_fin","label":"Cierra el plazo","tipo":"fecha"},
      {"clave":"eleccion_cliente","label":"El asesorado la quiere","tipo":"opcion","opciones":["Sí","No"],"cliente":"editar"},
      {"clave":"estado","label":"Estado","tipo":"opcion","opciones":["Propuesta","Descartada","Elegida","Postulada","Lista de espera","Admitida","No admitida","Matriculada"]},
      {"clave":"portal_url","label":"Portal de postulación","tipo":"url"},
      {"clave":"portal_usuario","label":"Usuario del portal","tipo":"texto"},
      {"clave":"portal_clave","label":"Clave del portal","tipo":"secreto"},
      {"clave":"resultado_fecha","label":"Fecha del resultado","tipo":"fecha"},
      {"clave":"notas","label":"Notas","tipo":"textarea"},
    ] },
  docs: [
    {"clave":"pasaporte","paso":"documentos","nombre":"Pasaporte certificado por Migraciones y apostillado","patron":"pasaporte"},
    {"clave":"certificado","paso":"documentos","nombre":"Certificado de estudios secundarios apostillado","patron":"certificado.*(estudios|secundari|notas)|constancia|bachiller"},
    {"clave":"dni","paso":"documentos","nombre":"DNI","patron":"\\bdni\\b|identidad"},
  ],
  inicial: {"he_estado":"Subir documentos","he_resolucion":"Pendiente","via_acceso":"Por decidir"},
};
const ETAPAS_PAC = [
  {"clave":"DATOS","orden":0,"cliente":"Completando tus datos","explica_cliente":"Rellena tus datos en el primer apartado para que podamos preparar tu solicitud.","tono":"neutral"},
  {"clave":"DOCUMENTOS","orden":1,"cliente":"Subiendo tus documentos","explica_cliente":"Sube en el apartado de documentos todo lo que te pedimos. Los antecedentes penales y la apostilla son lo que más tarda.","tono":"azul"},
  {"clave":"REVISION","orden":2,"cliente":"Revisión de documentos","explica_cliente":"Tenemos tus documentos y los estamos revisando. Si algo hay que corregir, te lo diremos.","tono":"ambar"},
  {"clave":"PRESENTADO","orden":3,"cliente":"Presentado en la UGE","explica_cliente":"Tu solicitud ya está presentada ante la Unidad de Grandes Empresas por Mercurio. La UGE resuelve en veinte días hábiles; si no contesta, se entiende concedida.","tono":"violeta"},
  {"clave":"REQUERIDO","orden":4,"cliente":"Requerido","explica_cliente":"La UGE ha pedido algo más. Míralo en el apartado de la UGE: el plazo de respuesta es corto.","tono":"rojo"},
  {"clave":"FAVORABLE","orden":5,"cliente":"Autorización concedida","explica_cliente":"La UGE concedió tu autorización de residencia. El siguiente paso es el visado en el consulado: te pediremos cita en BLS.","tono":"verde"},
  {"clave":"DESFAVORABLE","orden":5,"cliente":"Denegada","explica_cliente":"La resolución ha sido desfavorable. Tu asesor te explicará las vías que quedan, entre ellas el recurso.","tono":"rojo"},
  {"clave":"CONSULADO","orden":6,"cliente":"Visado en trámite","explica_cliente":"Con la autorización, pedimos tu visado en el consulado. Acude a la cita en BLS con los originales y las copias; el consulado resuelve en unos diez días.","tono":"azul"},
  {"clave":"VISADO","orden":7,"cliente":"Visado concedido","explica_cliente":"Recoge tu visado en BLS dentro del mes. Ya puedes viajar: al llegar, empadronamiento y cita de huellas para la TIE.","tono":"verde"},
  {"clave":"ESPANA","orden":8,"cliente":"En España","explica_cliente":"Ya en España: la TIE se solicita dentro del mes desde la entrada. Te acompañamos con el empadronamiento y la cita de huellas.","tono":"verde"},
];
const ETAPAS_MODIFICATORIA = [
  {"clave":"DATOS","orden":0,"cliente":"Completando tus datos","explica_cliente":"Rellena tus datos, los de la empresa y los del contrato.","tono":"neutral"},
  {"clave":"DOCUMENTOS","orden":1,"cliente":"Subiendo tus documentos","explica_cliente":"Sube lo que te pedimos en el apartado de documentos.","tono":"azul"},
  {"clave":"EMPRESA","orden":2,"cliente":"Esperando documentos de tu empresa","explica_cliente":"Nos faltan documentos que tiene que aportar tu empresa. Si puedes, recuérdaselo: es donde más se retrasa este trámite.","tono":"ambar"},
  {"clave":"REVISION","orden":3,"cliente":"Revisión de documentos","explica_cliente":"Tenemos todo y lo estamos revisando. Si algo hay que corregir, te lo diremos.","tono":"ambar"},
  {"clave":"PRESENTADO","orden":4,"cliente":"Presentado","explica_cliente":"Tu expediente ya está presentado ante la Oficina de Extranjería.","tono":"violeta"},
  {"clave":"REQUERIDO","orden":5,"cliente":"Requerido","explica_cliente":"Extranjería ha pedido algo más. Míralo en el apartado de Extranjería: los plazos de respuesta son cortos.","tono":"rojo"},
  {"clave":"FAVORABLE","orden":6,"cliente":"Favorable","explica_cliente":"¡Resolución favorable! Ya puedes trabajar. El siguiente paso es la TIE.","tono":"verde"},
  {"clave":"DESFAVORABLE","orden":6,"cliente":"Desfavorable","explica_cliente":"La resolución ha sido desfavorable. Tu asesor te explicará las vías que quedan.","tono":"rojo"},
];

// ── PAC (158), modificatoria (159) y estancia ajena (162) ──────────────────
// Misma forma que la estancia: el expediente con su `revision`, documentos por
// ranura y lo que llega de Extranjería (expedientes-extranjeria/*). Las etapas
// y la ficha de grado se copiaron de pac.flujo.js, modificatoria.flujo.js y
// tramites/definiciones.js (sin `asesor`, que no viaja al panel).

/** La etapa y el recorrido con la posición marcada (expedientes-extranjeria/flujo.js). */
function revisionDe(etapas, clave) {
  const actual = etapas.find((e) => e.clave === clave) || etapas[0];
  return {
    etapa: actual,
    recorrido: etapas
      .filter((e) => e.clave !== "DESFAVORABLE" || actual.clave === "DESFAVORABLE")
      .filter((e) => e.clave !== "FAVORABLE" || actual.clave !== "DESFAVORABLE")
      .map((e) => ({ ...e, actual: e.clave === actual.clave, pasada: e.orden < actual.orden })),
  };
}

/** Una ranura como la arma armarEstado: con su clave y el estado del último archivo. */
function ranuraDe(clave, def, archivos = [], estado = null) {
  return { ...def, clave, archivos, estado: estado || (archivos.length ? "PENDIENTE" : "SIN_SUBIR") };
}
const docCliente = (id, nombre, extra = {}) => ({
  id_documento: id, nombre, mime: "application/pdf", tamano: 860_000,
  subido_por: "CLIENTE", subido_por_quien: CLIENTE.nombre, fecha: iso(-6), estado: "PENDIENTE", observacion: null, ...extra,
});
const docInspira = (id, nombre, extra = {}) => docCliente(id, nombre, { subido_por: "ASESOR", subido_por_quien: "Inspira", estado: "APROBADO", ...extra });
/** Las ranuras obligatorias del asesorado: las que faltan y las observadas. */
function cuentasDe(ranuras) {
  const obligatorias = Object.entries(ranuras).filter(([, r]) => r.de === "cliente" && r.obligatorio);
  return {
    faltan: obligatorias.filter(([, r]) => !r.archivos.length).map(([k]) => k),
    observados: obligatorias.filter(([, r]) => r.estado === "OBSERVADO").map(([k]) => k),
  };
}

// ── 158 · Profesional altamente cualificado (GET /solicitudes/158/pac…) ────
const PAC_EXPEDIENTE = {
  rol: "TITULAR", vinculo: null, acompana_a: null,
  titular_nombre: null, titular_pasaporte: null, titular_nie: null, titular_expediente_uge: null, titular_resolucion_fecha: null, titular_empresa: null,
  apellido1: "RAMOS", apellido2: "QUISPE", nombres: "VALERIA", sexo: "Mujer", fecha_nacimiento: "1999-03-14",
  lugar_nacimiento: "LIMA", pais_nacimiento: "PERÚ", nacionalidad: "PERUANA", estado_civil: "Soltero/a",
  nombre_padre: "", nombre_madre: "",
  pasaporte_numero: "P0000123", pasaporte_emision: "2021-06-30", pasaporte_caducidad: "2031-06-30", dni: "70000123",
  correo: CLIENTE.email, telefono: "+51 987 000 123", pais_residencia: "Perú",
  dom_direccion: "AV. EJEMPLO 123, MIRAFLORES", dom_localidad: "LIMA", dom_cp: "15074", dom_provincia: "LIMA",
  esp_direccion: "", esp_localidad: "", esp_cp: "", esp_provincia: "",
  emp_razon_social: "EJEMPLO CONSULTORES S.L.", emp_nif: "", emp_localidad: "MADRID", emp_provincia: "MADRID",
  con_puesto: "ASOCIADA SÉNIOR DE ARBITRAJE", con_retribucion: "48000", con_inicio: "2027-01-11", con_duracion: "Indefinido",
  titulacion: "GRADO EN DERECHO", titulacion_centro: "UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS", profesion_regulada: false, experiencia_anios: "3",
  patria_potestad: null, otro_progenitor_nombre: null, otro_progenitor_doc: null,
  seguro_aseguradora: "", seguro_poliza: "", seguro_hasta: "", cobertura_ss: "POR_CONFIRMAR",
  presentacion_via: "ABOGADO", repr_nombre: ASESORA.nombre,
  expediente_numero: null, expediente_justificante: null, expediente_fecha: null,
  tasa_importe: null, tasa_pagada_fecha: null, resolucion_sentido: null, resolucion_fecha: null,
  consulado: null, bls_cita_fecha: null, bls_cita_hora: null, visado_presentacion_fecha: null,
  visado_resolucion: null, visado_resolucion_fecha: null, visado_recogida_fecha: null, visado_validez_hasta: null,
  entrada_fecha: null, empadronamiento_fecha: null, huellas_fecha: null, nie: null, tie_fecha: null,
  con_acompanantes: false, notas: "",
  revision_solicitada_at: null,
  invitados: [{ correo: "diego.ramos@example.com", quien: "Diego Ramos Quispe" }],
  revision: {
    faltan: ["Nombre del padre", "Nombre de la madre", "NIF de la empresa"],
    avisos: [],
    completo: false,
    menor: false,
    plazos: { uge: null, recogida_visado: null, tie: null, avisos: [] },
    ...revisionDe(ETAPAS_PAC, "DOCUMENTOS"),
  },
};

const PAC_RANURAS = {
  pasaporte: ranuraDe("pasaporte", { de: "cliente", obligatorio: true, etiqueta: "Pasaporte completo", requisito: "TODAS las páginas, de la portada a la contraportada, también las que están en blanco, en un único PDF. Vigente al menos un año." }, [docCliente(7101, "pasaporte-completo.pdf", { estado: "APROBADO", fecha: iso(-15) })], "APROBADO"),
  antecedentes: ranuraDe("antecedentes", { de: "cliente", obligatorio: true, mayores: true, etiqueta: "Antecedentes penales apostillados", requisito: "Del país de origen y de los países donde hayas vivido los últimos 2 años, apostillados y con menos de 3 meses de antigüedad al presentarlos.", modelo: "/modelos/antecedentes-penales.html", modelo_nota: "Un certificado oficial con su apostilla detrás. Fíjate en la fecha de emisión (menos de tres meses) y en la apostilla." }, [docCliente(7102, "antecedentes-penales-apostillados.pdf", { estado: "OBSERVADO", fecha: iso(-8), observacion: "Es del 2 de junio: al presentar tendrá más de tres meses. Pide uno nuevo y apostíllalo." })], "OBSERVADO"),
  declaracion_antecedentes: ranuraDe("declaracion_antecedentes", { de: "cliente", obligatorio: true, mayores: true, etiqueta: "Declaración responsable de antecedentes", requisito: "Firmada por ti: que no tienes antecedentes penales en los últimos 5 años en ningún país. Te damos el modelo en «Lo que preparamos nosotros»." }),
  seguro: ranuraDe("seguro", { de: "cliente", obligatorio: true, etiqueta: "Seguro médico privado en España", requisito: "Póliza con una aseguradora autorizada en España, cobertura completa, sin copagos ni carencias, con condiciones particulares y generales en un único PDF." }),
  foto: ranuraDe("foto", { de: "cliente", obligatorio: true, etiqueta: "Fotografía tamaño carné", requisito: "Reciente, en color, fondo claro, de frente, sin gafas oscuras ni nada que tape la cara." }, [docCliente(7103, "foto-carne.jpg", { mime: "image/jpeg", tamano: 210_000, fecha: iso(-2) })]),
  titulo: ranuraDe("titulo", { de: "cliente", obligatorio: true, solo: ["TITULAR"], etiqueta: "Título superior o acreditación de experiencia", requisito: "Grado, máster o doctorado apostillado o, en su defecto, la acreditación de al menos tres años de experiencia equiparable." }, [docCliente(7104, "titulo-derecho-apostillado.pdf", { estado: "APROBADO", fecha: iso(-15) })], "APROBADO"),
  contrato: ranuraDe("contrato", { de: "cliente", obligatorio: true, solo: ["TITULAR"], etiqueta: "Contrato de trabajo firmado", requisito: "El contrato o la oferta firmada por la empresa, con puesto, salario y fecha de inicio." }, [docCliente(7105, "contrato-ejemplo-consultores.pdf", { fecha: iso(-2) })]),
  cv: ranuraDe("cv", { de: "cliente", obligatorio: true, solo: ["TITULAR"], etiqueta: "Currículum", requisito: "Actualizado, con formación y experiencia." }, [docCliente(7106, "cv-valeria-ramos.pdf", { estado: "APROBADO", fecha: iso(-15) })], "APROBADO"),
  firma: ranuraDe("firma", { de: "cliente", obligatorio: true, etiqueta: "Firma digitalizada", requisito: "Tu firma sobre papel blanco, escaneada o fotografiada, recortada y nítida." }),
  otros_cliente: ranuraDe("otros_cliente", { de: "cliente", obligatorio: false, varios: true, etiqueta: "Otros documentos", requisito: "Cualquier cosa que creas que suma a tu expediente." }),
  representacion: ranuraDe("representacion", { de: "asesor", obligatorio: false, etiqueta: "Documento de representación", requisito: "Firmado por ti: autoriza al abogado a presentar la solicitud en Mercurio con su certificado profesional." }, [docInspira(7107, "documento-representacion.pdf", { fecha: iso(-12) })]),
  modelo_declaracion: ranuraDe("modelo_declaracion", { de: "asesor", obligatorio: false, etiqueta: "Modelo de declaración responsable", requisito: "Descárgalo, fírmalo y súbelo en «Declaración responsable de antecedentes»." }, [docInspira(7108, "modelo-declaracion-responsable.pdf", { fecha: iso(-12) })]),
  formulario_uge: ranuraDe("formulario_uge", { de: "asesor", obligatorio: false, etiqueta: "Formulario MI-T / MI-F", requisito: "El modelo oficial de la UGE cumplimentado con tus datos y tu firma." }),
  tasa: ranuraDe("tasa", { de: "asesor", obligatorio: false, etiqueta: "Justificante de la tasa", requisito: "El comprobante del pago de la tasa de la autorización." }),
  justificante: ranuraDe("justificante", { de: "asesor", obligatorio: false, etiqueta: "Justificante de presentación en Mercurio", requisito: "El resguardo con el número de expediente de la UGE." }),
  resolucion: ranuraDe("resolucion", { de: "asesor", obligatorio: false, etiqueta: "Resolución de la UGE", requisito: "La resolución de la autorización de residencia." }),
  otros_asesor: ranuraDe("otros_asesor", { de: "asesor", obligatorio: false, varios: true, etiqueta: "Otros documentos de Inspira", requisito: "Escritos, requerimientos respondidos y lo que haga falta archivar." }),
};
const PAC_DOCUMENTOS = { ranuras: PAC_RANURAS, ...cuentasDe(PAC_RANURAS) };

// ── 159 · Modificación a residencia por trabajo (GET /solicitudes/159/modificatoria…) ──
const MODIFICATORIA_EXPEDIENTE = {
  apellido1: "RAMOS", apellido2: "QUISPE", nombres: "VALERIA", pasaporte_numero: "P0000123", nie: "Y1234567X",
  sexo: "Mujer", fecha_nacimiento: "1999-03-14", lugar_nacimiento: "LIMA", pais_nacimiento: "PERÚ", nacionalidad: "PERUANA",
  estado_civil: "Soltero/a", nombre_padre: "JORGE", nombre_madre: "ROSA", telefono: "+34 600 000 123", correo: CLIENTE.email,
  dom_direccion: "CALLE EJEMPLO", dom_numero: "4", dom_piso: "3.º B", dom_localidad: "GETAFE", dom_cp: "28903", dom_provincia: "MADRID",
  hijos_escolarizacion: "",
  emp_razon_social: "EJEMPLO CONSULTORES S.L.", emp_nif: "B00000000", emp_actividad: "", emp_cnae: "", emp_direccion: "PASEO DE EJEMPLO",
  emp_numero: "21", emp_piso: "", emp_localidad: "MADRID", emp_cp: "", emp_provincia: "MADRID", emp_telefono: "+34 910 000 000", emp_correo: "rrhh@example.es",
  con_puesto: "ASOCIADA JUNIOR", con_retribucion: "22000", con_jornada_horas: "30", con_duracion: "1 año", con_grupo_cotizacion: "",
  con_cno_sepe: "", con_codigo_convenio: "", con_denom_convenio: "", con_codigo_contrato: "", con_denom_contrato: "", con_cuenta_cotizacion: "",
  con_centro_direccion: "PASEO DE EJEMPLO", con_centro_numero: "21", con_centro_piso: "", con_centro_localidad: "MADRID", con_centro_cp: "28010", con_centro_provincia: "MADRID",
  notas: "",
  expediente_numero: null, expediente_justificante: null, expediente_fecha: null,
  revision_solicitada_at: null,
  invitados: [],
  revision: {
    faltan: ["Actividad de la empresa", "C.P. de la empresa"],
    avisos: ["La jornada declarada es de 30 horas. Extranjería exige jornada completa (40 horas) para este trámite."],
    completo: false,
    smi_referencia: 16576,
    ...revisionDe(ETAPAS_MODIFICATORIA, "EMPRESA"),
  },
};

const ext = (clave, def, ...resto) => ranuraDe(clave, { de: "cliente", grupo: "extranjero", obligatorio: true, ...def }, ...resto);
const emp = (clave, def, ...resto) => ranuraDe(clave, { de: "cliente", grupo: "empresa", obligatorio: true, ...def }, ...resto);
const MODIFICATORIA_RANURAS = {
  precontrato: ext("precontrato", { etiqueta: "Precontrato de trabajo", requisito: "Firmado por las dos partes. Salario igual o superior al SMI, jornada de 40 horas y duración de un año o indefinido." }, [docCliente(7201, "precontrato-firmado.pdf", { estado: "APROBADO", fecha: iso(-30) })], "APROBADO"),
  tie: ext("tie", { etiqueta: "Último TIE o resolución", requisito: "Tu tarjeta actual, o la resolución de la autorización si aún no la tienes." }, [docCliente(7202, "tie-ambas-caras.pdf", { estado: "APROBADO", fecha: iso(-30) })], "APROBADO"),
  pasaporte: ext("pasaporte", { etiqueta: "Pasaporte completo", requisito: "Todas las páginas, de la primera a la última, en un único PDF." }, [docCliente(7203, "pasaporte-completo.pdf", { estado: "APROBADO", fecha: iso(-30) })], "APROBADO"),
  notas_estudios: ext("notas_estudios", { etiqueta: "Certificado de notas", requisito: "Con los estudios ya finalizados." }, [docCliente(7204, "certificado-notas-master.pdf", { estado: "OBSERVADO", fecha: iso(-7), observacion: "Es el certificado provisional: falta la nota del Trabajo Fin de Máster. Pide el definitivo en secretaría." })], "OBSERVADO"),
  no_becado_espana: ext("no_becado_espana", { etiqueta: "No haber sido becado · España", requisito: "Se pide por correo a la AECID desde tu propia dirección. Suele tardar unos 3 días." }, [docCliente(7205, "no-becado-aecid.pdf", { fecha: iso(-1) })]),
  no_becado_peru: ext("no_becado_peru", { etiqueta: "No haber sido becado · Perú", requisito: "Se solicita en línea en Pronabec, con tu DNI y tus datos." }),
  antecedentes: ext("antecedentes", { etiqueta: "Antecedentes penales", requisito: "Apostillados." }),
  cv: ext("cv", { etiqueta: "Currículum", requisito: "" }, [docCliente(7206, "cv-valeria-ramos.pdf", { estado: "APROBADO", fecha: iso(-30) })], "APROBADO"),
  memoria_funciones: ext("memoria_funciones", { etiqueta: "Memoria descriptiva de funciones", requisito: "Qué vas a hacer en el puesto, con detalle." }),
  empadronamiento: ext("empadronamiento", { etiqueta: "Empadronamiento", requisito: "" }, [docCliente(7207, "volante-empadronamiento.pdf", { estado: "APROBADO", fecha: iso(-25) })], "APROBADO"),
  cualificacion: ext("cualificacion", { etiqueta: "Cualificación profesional previa", requisito: "Títulos o experiencia que acrediten que puedes ocupar el puesto." }, [docCliente(7208, "titulo-master-uc3m.pdf", { fecha: iso(-1) })]),
  tasa_062: ext("tasa_062", { obligatorio: false, etiqueta: "Tasa 062 · 203,84 €", requisito: "Sólo cuando extranjería la requiera. No la pagues antes de que te lo digamos." }),
  tasa_052: ext("tasa_052", { obligatorio: false, etiqueta: "Tasa 052 · 10,94 €", requisito: "Sólo cuando extranjería la requiera." }),
  emp_nif: emp("emp_nif", { etiqueta: "Tarjeta acreditativa del NIF", requisito: "La empresa la descarga en línea en la sede de la Agencia Tributaria." }, [docCliente(7209, "nif-empresa.pdf", { estado: "APROBADO", fecha: iso(-20) })], "APROBADO"),
  emp_escritura: emp("emp_escritura", { etiqueta: "Escritura de constitución", requisito: "Copia." }),
  emp_representante: emp("emp_representante", { etiqueta: "Acreditación del representante legal", requisito: "Que demuestre que quien firma puede firmar por la empresa." }),
  emp_autorizacion: emp("emp_autorizacion", { etiqueta: "Autorización del representante legal a Inspira", requisito: "Para que podamos presentar el trámite en su nombre." }),
  emp_modelo_200: emp("emp_modelo_200", { etiqueta: "Modelo 200 · última declaración", requisito: "Se obtiene en la web de la Agencia Tributaria. Acredita la solvencia de la empresa." }),
  emp_seguridad_social: emp("emp_seguridad_social", { etiqueta: "Al corriente con la Seguridad Social", requisito: "Certificado de estar al día en los pagos. Se obtiene en la web de la Seguridad Social." }),
  otros_cliente: ext("otros_cliente", { obligatorio: false, varios: true, etiqueta: "Otros documentos", requisito: "Cualquier cosa que creas que suma." }),
  formulario: ranuraDe("formulario", { de: "asesor", grupo: "inspira", obligatorio: false, etiqueta: "Formulario EX-03", requisito: "Lo preparamos nosotros con los datos que nos das." }, [docInspira(7210, "formulario-ex03-borrador.pdf", { fecha: iso(-3) })]),
  otros_asesor: ranuraDe("otros_asesor", { de: "asesor", grupo: "inspira", obligatorio: false, varios: true, etiqueta: "Otros documentos (Inspira)", requisito: "" }),
  justificante: ranuraDe("justificante", { de: "asesor", grupo: "inspira", obligatorio: false, etiqueta: "Justificante de registro", requisito: "El PDF que genera MERCURIO al presentar la solicitud." }),
};
const MODIFICATORIA_DOCUMENTOS = { ranuras: MODIFICATORIA_RANURAS, ...cuentasDe(MODIFICATORIA_RANURAS) };

// ── 162 · Estancia ajena (Diego): la de 157 recién empezada, con sus datos ──
const ESTANCIA_INVITADO = {
  ...ESTANCIA_EXPEDIENTE,
  apellido1: "Ramos", apellido2: "Quispe", nombres: "Diego", fecha_nacimiento: "2003-11-02", sexo: "Hombre",
  pasaporte_numero: "P0000456", dni: "70000456", correo: "diego.ramos@example.com", telefono: "+51 987 000 456",
  nombre_padre: "", nombre_madre: "", fecha_llegada_espana: "", uni_denominacion: UNIS.uv.nombre_completo,
  prog_denominacion: MASTERS[2].nombre_limpio, uni_localidad: "Valencia", uni_provincia: "Valencia", uni_cp: "46010", uni_direccion: "Av. de Blasco Ibáñez 13",
  dom_direccion: "", dom_numero: "", dom_piso: "", dom_localidad: "", dom_cp: "", dom_provincia: "",
  invitados: [],
  revision: {
    ...ESTANCIA_EXPEDIENTE.revision,
    faltan: ["Nombre del padre", "Nombre de la madre", "Fecha de llegada a España", "Domicilio en España", "Localidad en España", "Código postal en España", "Provincia en España"],
    etapa: ETAPAS_ESTANCIA[0],
    recorrido: ETAPAS_ESTANCIA.slice(0, 6).map((e, i) => ({ ...e, actual: i === 0, pasada: false })),
  },
};
const ESTANCIA_INVITADO_DOCUMENTOS = {
  ranuras: Object.fromEntries(Object.entries(ESTANCIA_DOCUMENTOS.ranuras).map(([k, r]) => [k, { ...r, archivos: [], estado: "SIN_SUBIR" }])),
  faltan: ["antecedentes", "pasaporte", "seguro", "admision", "medico", "solvencia", "entrada", "firma"],
  observados: [],
};

// ── 161 · Grado en España (GET /solicitudes/161/tramite, tramites.service.leer) ──
const TRAMITE_GRADO = {
  servicio: "grado",
  definicion: GRADO_DEF,
  etapa: "Informe",
  paso_actual: 2,
  tramite: {
    he_estado: "Enviar documentos", he_centro: "Colegio Santa Rosa de Lima", he_ciudad: "Lima", he_anio_fin: 2025,
    he_resolucion: "Pendiente",
    nivel: "Grado universitario",
    carreras_interes: "Administración y Dirección de Empresas, Marketing, Economía.",
    motivo: "Quiero trabajar en empresas con proyección internacional y, más adelante, emprender.",
    nota_secundaria: 16, ingles: "Intermedio", inicio_previsto: "2027-2028", presupuesto_anual: 3000,
    trabajar: "Sí", via_migratoria_prevista: "Desde Perú (visado de estudios)",
    ciudades_preferidas: "Valencia, Madrid, Granada.",
    ciudades_delimitadas: "Valencia y Madrid: notas de corte alcanzables y precios públicos.",
    informe_url: "https://example.com/informe-grado-qa.pdf", informe_publicado: "Sí", informe_fecha: dia(-3),
    via_acceso: "Por decidir",
  },
  candidaturas: [
    { id: "c1", tipo: "Grado universitario", programa: "Grado en Administración y Dirección de Empresas", centro: "Universitat de València", ciudad: "Valencia", comunidad: "Comunidad Valenciana", titularidad: "Pública", nota_corte: "9,12", precio: "1.180", plazo_inicio: "2027-06-01", plazo_fin: "2027-07-03", estado: "Propuesta" },
    { id: "c2", tipo: "Grado universitario", programa: "Grado en Marketing", centro: "Universidad Complutense de Madrid", ciudad: "Madrid", comunidad: "Comunidad de Madrid", titularidad: "Pública", nota_corte: "8,45", precio: "1.630", plazo_inicio: "2027-06-15", plazo_fin: "2027-07-01", estado: "Propuesta" },
    { id: "c3", tipo: "Ciclo de FP (grado superior)", programa: "Técnico Superior en Marketing y Publicidad", centro: "IES Lluís Vives", ciudad: "Valencia", comunidad: "Comunidad Valenciana", titularidad: "Pública", precio: "0", plazo_inicio: "2027-06-10", plazo_fin: "2027-06-26", estado: "Propuesta" },
  ],
  // Sin fecha de presentación ante el Ministerio todavía: no hay plazos.
  derivados: [],
};

// ── Pagos (GET /cliente/pagos) ──────────────────────────────────────────────
const CONCEPTO = "Paquete Premium · Máster 2027/2028";
function cuota(n, estado, venc, extra = {}) {
  const d = diasHasta(venc);
  return {
    id_pago: 400 + n, id_plan: 31, nro_cuota: n, total_cuotas: 3, concepto: CONCEPTO, monto: 500, moneda: "EUR",
    estado, estado_visible: estado, vencido: estado === "PENDIENTE" && d < 0, fecha_vencimiento: venc, dias_para_vencer: d,
    fecha_pago: null, metodo: null, tiene_comprobante: false, motivo_rechazo: null,
    puede_subir_comprobante: estado === "PENDIENTE" || estado === "EN_REVISION",
    pago_en_linea: { disponible: estado === "PENDIENTE", monto_pen: estado === "PENDIENTE" ? 2050 : null },
    ...extra,
  };
}
const CUOTAS = [
  cuota(1, "PAGADO", dia(-40), { fecha_pago: iso(-42), metodo: "Transferencia", tiene_comprobante: true }),
  cuota(2, "EN_REVISION", dia(2), { metodo: "Yape", tiene_comprobante: true }),
  cuota(3, "PENDIENTE", dia(20)),
];
const PAGOS = {
  planes: [{
    id_plan: 31, concepto: CONCEPTO, modalidad: "PERSONALIZADO", estado: "VIGENTE", moneda: "EUR",
    total: 1500, pagado: 500, pendiente: 500, en_revision: 500, vencido: 0,
    fecha_limite_postulacion: dia(60), created_at: "2026-09-12T15:30:00.000Z",
    proxima_cuota: CUOTAS[2], cuotas: CUOTAS,
  }],
  resumen: { EUR: { total: 1500, pagado: 500, pendiente: 500, en_revision: 500, vencido: 0 } },
  medios_pago: {
    transferencia: { banco: "Banco de ejemplo", titular: "Inspira Legal S.A.C.", tipo_cuenta: "Cuenta corriente", moneda: "EUR", cuenta: "000-0000000-0-00", cci: "00000000000000000000" },
    plin: { numero: "+51 900 000 000", titular: "Inspira Legal" },
    mercado_pago: true,
    configurado: true,
  },
};

// ── Catálogo (GET /api/catalogo/*) ──────────────────────────────────────────
const CATALOGO = {
  ramas: [
    { valor: "artes_humanidades", etiqueta: "Artes y Humanidades" },
    { valor: "ciencias", etiqueta: "Ciencias" },
    { valor: "ciencias_salud", etiqueta: "Ciencias de la Salud" },
    { valor: "sociales_juridicas", etiqueta: "Ciencias Sociales y Jurídicas" },
    { valor: "ingenieria", etiqueta: "Ingeniería y Arquitectura" },
  ],
  subareas: [
    { valor: "derecho_internacional", etiqueta: "Derecho internacional", rama: "sociales_juridicas" },
    { valor: "derecho_empresa", etiqueta: "Derecho de la empresa", rama: "sociales_juridicas" },
    { valor: "administracion", etiqueta: "Administración y dirección de empresas", rama: "sociales_juridicas" },
  ],
  comunidades: ["Andalucía", "Cataluña", "Comunidad de Madrid", "Comunidad Valenciana", "Galicia", "País Vasco"],
};

// ── Enrutador de fixtures ───────────────────────────────────────────────────
const ok = (cuerpo = {}) => ({ prevista: true, status: 200, cuerpo: { ok: true, ...cuerpo } });

const RUTAS = [
  // La cabecera de la web (AuthContext) pregunta quién ha entrado.
  ["GET", /^\/auth\/me$/, () => ok({ user: { id_cliente: CLIENTE.id_cliente, nombre: CLIENTE.nombre, email: CLIENTE.email, email_contacto: CLIENTE.email, foto: null, rol: "CLIENTE" } })],
  ["GET", /^\/cliente\/me$/, () => ok({ cliente: PERFIL })],
  ["PATCH", /^\/cliente\/me$/, () => ok({ cliente: PERFIL })],
  ["POST", /^\/cliente\/me\/tour$/, () => ok({ cliente: PERFIL })],
  ["GET", /^\/cliente\/pagos$/, () => ok(PAGOS)],
  ["GET", /^\/cliente\/push\/clave$/, () => ok({ clave: null })],
  ["POST", /^\/auth\/renovar$/, () => ({ prevista: true, status: 404, cuerpo: { ok: false } })],
  ["GET", /^\/solicitudes\/mias$/, () => ok({ solicitudes: SOLICITUDES })],
  ["GET", /^\/solicitudes\/(\d+)$/, (m) => (DETALLE[m[1]] ? ok({ solicitud: DETALLE[m[1]] }) : { prevista: true, status: 404, cuerpo: { ok: false, message: "No encontrada" } })],
  ["GET", /^\/checklist\/(\d+)$/, (m) => ok({ checklist: CHECKLIST[m[1]] || [] })],
  ["GET", /^\/solicitudes\/(\d+)\/formulario$/, (m) => ok({ datos: m[1] === "155" ? FORMULARIO : null })],
  ["GET", /^\/solicitudes\/(\d+)\/instructivos$/, (m) => ok({ instructivos: m[1] === "155" ? INSTRUCTIVOS : [] })],
  ["GET", /^\/solicitudes\/(\d+)\/eleccion-masters$/, (m) => ok({ elecciones: m[1] === "155" ? ELECCIONES : [] })],
  ["GET", /^\/solicitudes\/(\d+)\/compatibilidad$/, (m) => (m[1] === "155" ? ok(COMPATIBILIDAD) : ok({ estado: "en_creacion" }))],
  ["GET", /^\/solicitudes\/(\d+)\/postulaciones$/, (m) => ok({ postulaciones: m[1] === "155" ? POSTULACIONES : [] })],
  ["GET", /^\/solicitudes\/(\d+)\/mensajes$/, (m) => ok({ mensajes: MENSAJES[m[1]] || [] })],
  ["POST", /^\/solicitudes\/(\d+)\/mensajes$/, () => ok({})],
  ["GET", /^\/solicitudes\/(\d+)\/novedades$/, (m) => ok({ dias: 30, novedades: NOVEDADES[m[1]] || [] })],
  ["GET", /^\/solicitudes\/156\/visa-expediente$/, () => ok({ expediente: VISA_EXPEDIENTE })],
  ["GET", /^\/solicitudes\/156\/sesiones$/, () => ok({ sesiones: SESIONES })],
  ["GET", /^\/solicitudes\/156\/visa-documentos$/, () => ok({ documentos: VISA_DOCUMENTOS })],
  ["GET", /^\/solicitudes\/(157|162)\/estancia$/, (m) => ok({ expediente: m[1] === "162" ? ESTANCIA_INVITADO : ESTANCIA_EXPEDIENTE })],
  ["GET", /^\/solicitudes\/(157|162)\/estancia\/documentos$/, (m) => ok(m[1] === "162" ? ESTANCIA_INVITADO_DOCUMENTOS : ESTANCIA_DOCUMENTOS)],
  ["GET", /^\/solicitudes\/(157|162)\/estancia\/extranjeria$/, () => ok({ registros: [] })],
  ["GET", /^\/solicitudes\/(157|162)\/estancia\/acompanantes$/, () => ok({ con_acompanantes: false, acompanantes: [], ranuras: {} })],
  ["GET", /^\/solicitudes\/158\/pac$/, () => ok({ expediente: PAC_EXPEDIENTE })],
  ["GET", /^\/solicitudes\/158\/pac\/documentos$/, () => ok(PAC_DOCUMENTOS)],
  ["GET", /^\/solicitudes\/158\/pac\/extranjeria$/, () => ok({ registros: [] })],
  ["GET", /^\/solicitudes\/158\/pac\/acompanantes$/, () => ok({ acompanantes: [] })],
  ["GET", /^\/solicitudes\/159\/modificatoria$/, () => ok({ expediente: MODIFICATORIA_EXPEDIENTE })],
  ["GET", /^\/solicitudes\/159\/modificatoria\/documentos$/, () => ok(MODIFICATORIA_DOCUMENTOS)],
  ["GET", /^\/solicitudes\/159\/modificatoria\/extranjeria$/, () => ok({ registros: [] })],
  ["GET", /^\/solicitudes\/161\/tramite$/, () => ok(TRAMITE_GRADO)],
  ["GET", /^\/api\/catalogo\/ramas$/, () => ok({ ramas: CATALOGO.ramas })],
  ["GET", /^\/api\/catalogo\/subareas$/, () => ok({ subareas: CATALOGO.subareas })],
  ["GET", /^\/api\/catalogo\/comunidades$/, () => ok({ comunidades: CATALOGO.comunidades })],
  ["GET", /^\/api\/catalogo\/titulaciones$/, () => ok({ titulaciones: [] })],
  ["GET", /^\/portales\/panel\/.*documentos-proceso$/, () => ok({ documentos: [] })],
  ["GET", /^\/cierre-master\/panel\/solicitudes\/\d+\/bloque8$/, () => ok({ plan_nombre: "Paquete Premium", admitido: false, masters: [], master_final: null, derivacion: { via: null, contratacion: null }, opciones_derivacion: {}, cierre: { archivado: false }, encuesta: null })],
  ["POST", /^\/api\/errores-web$/, () => ok({})],
];

// Variantes por captura: cada una responde antes que RUTAS y devuelve null
// para lo que no cambia.
// Recién registrada: sin el perfil académico que pide quien no tiene servicios
// (usePerfilIncompletoBool, ACADEMICOS).
const ACADEMICOS = ["carrera_titulo", "area_carrera", "universidad_origen", "inicio_estudios", "fin_estudios", "inicio_previsto", "presupuesto_hasta"];
const PERFIL_NUEVO = {
  ...PERFIL,
  datos_extra: Object.fromEntries(Object.entries(PERFIL.datos_extra).filter(([k]) => !ACADEMICOS.includes(k))),
};

const ESCENARIOS = {
  // Nadie le ha dado de alta todavía y el perfil está incompleto: el panel
  // cierra el paso con el asistente del perfil (PanelCliente: mostrarWizard).
  "sin-servicios": (method, path) => {
    if (method !== "GET") return null;
    if (path === "/cliente/me") return ok({ cliente: PERFIL_NUEVO });
    if (path === "/solicitudes/mias") return ok({ solicitudes: [] });
    if (path === "/cliente/pagos") return ok({ planes: [], resumen: {}, medios_pago: PAGOS.medios_pago });
    return null;
  },
  // El servidor falla al dar la solicitud del máster: el expediente enseña el
  // error de carga con «Reintentar» (DetalleSolicitud.jsx). Lo demás, igual.
  "error-155": (method, path) => (
    method === "GET" && path === "/solicitudes/155"
      ? { prevista: true, status: 500, cuerpo: { ok: false, message: "Error interno" } }
      : null
  ),
};
export const NOMBRES_ESCENARIOS = Object.keys(ESCENARIOS);

/**
 * @returns {{ responder: (method: string, path: string, search: string) => {prevista: boolean, status: number, cuerpo: object}, noPrevistas: () => Set<string>, usarEscenario: (nombre: string|null) => void }}
 */
export function crearFixtures() {
  const noPrevistas = new Set();
  let escenario = null;
  return {
    usarEscenario(nombre) {
      if (nombre && !ESCENARIOS[nombre]) throw new Error(`escenario de fixtures desconocido: ${nombre}`);
      escenario = nombre || null;
    },
    responder(method, path, search = "") {
      const limpio = path.replace(/\/+$/, "") || "/";
      const variante = escenario ? ESCENARIOS[escenario](method, limpio, search) : null;
      if (variante) return variante;
      for (const [metodo, re, fn] of RUTAS) {
        if (metodo !== method) continue;
        const m = re.exec(limpio);
        if (m) return fn(m, search);
      }
      noPrevistas.add(`${method} ${limpio}${search}`);
      return { prevista: false, status: 200, cuerpo: { ok: true } };
    },
    noPrevistas: () => noPrevistas,
  };
}
