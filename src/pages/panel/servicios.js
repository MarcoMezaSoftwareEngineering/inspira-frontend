// src/pages/panel/servicios.js
//
// Qué es cada servicio del asesorado y qué le corresponde ver por tenerlo.
//
// La detección estaba repetida —y con criterios distintos— en PanelCliente y
// en MisServicios: cada servicio nuevo obligaba a acordarse de los dos sitios,
// y ya se coló una guía en el menú de quien no la había contratado. Aquí vive
// una sola vez, y el menú se arma a partir de ella.

export const SERVICIO = {
  MASTER: "master",
  VISADO: "visado",
  ESTANCIA: "estancia",
  MODIFICATORIA: "modificatoria",
  FP: "fp",
  DOCTORADO: "doctorado",
  OTRO: "otro",
};

// El identificador del tipo manda: es lo que decide el backend. El texto es el
// respaldo para los expedientes antiguos, que no lo llevaban.
const POR_TIPO = {
  15: SERVICIO.VISADO,
  18: SERVICIO.ESTANCIA,
  20: SERVICIO.MODIFICATORIA,
};

// Los tipos de máster son los paquetes (Full Económico, Andalucía, Premium…),
// cuyo nombre casi nunca dice «máster». Es la misma lista con la que el
// backend arma el checklist del máster (prisma/sql/checklist_master_2026_09_08.sql);
// la 19 es homologación. Se miran después del texto de visado, estancia y
// modificatoria, igual que en el backend (esVisado, propioDe).
const TIPOS_MASTER = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17];
const TIPO_HOMOLOGACION = 19;

// `resumen.servicio_propio` lo pone el servidor para los que tienen expediente
// propio (estancia, modificatoria).
const POR_CLAVE_PROPIA = {
  estancia: SERVICIO.ESTANCIA,
  modificatoria: SERVICIO.MODIFICATORIA,
};

function textoDe(s) {
  return String(
    s?.tipo?.nombre || s?.tipo_solicitud || s?.tipo || s?.titulo ||
    s?.nombre_servicio || s?.categoria || ""
  ).toLowerCase();
}

/** A qué servicio pertenece una solicitud del panel. */
export function servicioDe(s) {
  const porTipo = POR_TIPO[Number(s?.id_tipo_solicitud)];
  if (porTipo) return porTipo;

  const propia = POR_CLAVE_PROPIA[s?.resumen?.servicio_propio];
  if (propia) return propia;

  // Doctorado (18/09/2026): su tipo puede ser uno genérico de máster, así que
  // se mira el título («Doctorado en España · …») antes que el tipo.
  if (s?.panel_servicio === "doc" || /doctorado/i.test(String(s?.titulo || ""))) return SERVICIO.DOCTORADO;

  const txt = textoDe(s);
  if (/modificatoria|modificaci/.test(txt)) return SERVICIO.MODIFICATORIA;
  if (txt.includes("estancia")) return SERVICIO.ESTANCIA;
  // «Visa de estudios» también es visado: sin el \bvisa\b caía al máster por
  // defecto y al asesorado de visado se le exigía el perfil académico entero.
  if (txt.includes("visado") || /\bvisa\b/.test(txt) || String(s?.codigo_servicio || "") === "017") return SERVICIO.VISADO;
  const idTipo = Number(s?.id_tipo_solicitud);
  if (TIPOS_MASTER.includes(idTipo)) return SERVICIO.MASTER;
  if (idTipo === TIPO_HOMOLOGACION || /homologa/.test(txt)) return SERVICIO.OTRO;
  // El máster antes que la FP: «posgrado» contiene «grado» y caía en FP.
  if (/m[aá]ster|maestr[ií]a|postgrado|posgrado/.test(txt)) return SERVICIO.MASTER;
  if (/formaci[oó]n profesional|\bfp\b|grado/.test(txt)) return SERVICIO.FP;
  // Lo que no se reconoce NO se hace pasar por máster (14/09/2026). Antes caía
  // ahí por defecto: a un cliente de nacionalidad o de arraigo se le abrían la
  // guía del máster y las becas y se le exigía el perfil completo. Sigue
  // viendo su expediente con el recorrido genérico (MisServicios) y la guía de
  // apostilla (ACCESOS).
  return SERVICIO.OTRO;
}

/**
 * Qué recursos abre cada servicio.
 *
 * Se enseña lo que hace falta para ESE trámite y nada más: un cliente de
 * modificatoria no tiene por qué ver la guía de becas, y ver guías que no le
 * tocan le hace dudar de si ha contratado lo correcto. La apostilla es la
 * excepción común: casi todos los expedientes piden documentos apostillados.
 */
const ACCESOS = {
  [SERVICIO.MASTER]: ["portal", "guia", "becas", "apostilla"],
  [SERVICIO.VISADO]: ["portal", "apostilla"],
  [SERVICIO.ESTANCIA]: ["portal", "estancia", "apostilla"],
  [SERVICIO.MODIFICATORIA]: ["modificatoria", "apostilla"],
  [SERVICIO.FP]: ["portal", "becas", "apostilla"],
  // Recorrido propio (DetalleSolicitudDoctorado) y su guía en PDF en
  // «Mis guías» (GUIAS_PORTAL): sin "portal" la pestaña no se abría.
  [SERVICIO.DOCTORADO]: ["portal", "apostilla"],
  [SERVICIO.OTRO]: ["apostilla"],
};

/**
 * Las guías en PDF de cada servicio (public/guias/): la de su TRÁMITE y la de
 * USO DEL PORTAL. Son las mismas dos que recibe por correo al darle de alta
 * (backend: core/email/guiasServicio.js). FP no tiene recorrido propio en el
 * panel, así que su guía de servicio ya cuenta el uso común del portal. El
 * peso se enseña junto al botón porque en el teléfono van con datos móviles.
 */
const GUIAS_PORTAL = [
  { servicio: SERVICIO.MASTER, tipo: "servicio", titulo: "Guía del servicio Máster en España", descripcion: "Los seis pasos, calendario de postulación, documentos, becas y pagos.", href: "/guias/guia-servicio-master.pdf", peso: null },
  { servicio: SERVICIO.MASTER, tipo: "portal", titulo: "Guía del Expediente Digital · Máster", descripcion: "Perfil, formulario académico, informe, elección de másteres, documentos y postulaciones.", href: "/guias/guia-portal-master.pdf", peso: "2,6 MB" },
  { servicio: SERVICIO.VISADO, tipo: "servicio", titulo: "Guía del Visado de estudios", descripcion: "Cada documento del consulado, medios económicos, tasas y plazos.", href: "/guias/guia-servicio-visado.pdf", peso: null },
  { servicio: SERVICIO.VISADO, tipo: "portal", titulo: "Guía del Expediente Digital · Visado", descripcion: "Tus datos, medios económicos, documentos, cita y seguimiento del visado.", href: "/guias/guia-portal-visado.pdf", peso: "2,3 MB" },
  { servicio: SERVICIO.ESTANCIA, tipo: "servicio", titulo: "Guía de la Estancia por estudios", descripcion: "EX-00, tasa, empadronamiento, documentos y plazos ante Extranjería.", href: "/guias/guia-servicio-estancia.pdf", peso: null },
  { servicio: SERVICIO.ESTANCIA, tipo: "portal", titulo: "Guía del Expediente Digital · Estancia", descripcion: "Datos, plazos, documentos, acompañantes y seguimiento en Extranjería.", href: "/guias/guia-portal-estancia.pdf", peso: "2,2 MB" },
  { servicio: SERVICIO.DOCTORADO, tipo: "servicio", titulo: "Guía del servicio de Doctorado en España", descripcion: "Programa y director, candidatura, admisión, residencia para investigación y cómo usar tu portal.", href: "/guias/guia-servicio-doctorado.pdf", peso: null },
  { servicio: SERVICIO.FP, tipo: "servicio", titulo: "Guía del servicio de Formación Profesional", descripcion: "Homologación, centros, postulación, matrícula y cómo usar tu portal.", href: "/guias/guia-servicio-fp.pdf", peso: null },
];

/** Las guías que le tocan por sus servicios propios: trámite y portal, en orden fijo. */
export function guiasPortalDe(solicitudes = []) {
  const suyos = new Set(solicitudes.filter((s) => !s?.invitado).map(servicioDe));
  return GUIAS_PORTAL.filter((g) => suyos.has(g.servicio));
}

/**
 * Las pestañas de «Mis guías», en orden: primero los PDF (trámite y portal),
 * luego la guía interactiva de cada servicio y al final la apostilla, que es
 * la común. Cada pestaña es su ruta de siempre (/panel/portal, /panel/guia…):
 * la entrada del menú es una sola (14/09/2026) y dentro se cambia de guía.
 */
export const PESTANAS_GUIAS = [
  { clave: "portal", label: "Guías en PDF", icono: "mapa" },
  { clave: "guia", label: "Máster", icono: "libro" },
  { clave: "estancia", label: "Estancia", icono: "bandera" },
  { clave: "modificatoria", label: "Residencia y Trabajo", icono: "laptop" },
  { clave: "apostilla", label: "Apostilla", icono: "documento" },
];

export const CLAVES_GUIAS = PESTANAS_GUIAS.map((p) => p.clave);

/** Las pestañas de «Mis guías» que abren sus servicios (los PDF, solo si hay alguno). */
export function pestanasGuiasDe(accesos, guiasPortal = []) {
  return PESTANAS_GUIAS.filter(
    (p) => accesos?.has(p.clave) && (p.clave !== "portal" || guiasPortal.length > 0)
  );
}

/**
 * Servicios en los que se le EXIGE el perfil académico (carrera, universidad,
 * años de estudio, inicio previsto, presupuesto): los que buscan programa por
 * él. Visado, estancia y modificatoria no lo piden (12/09/2026): la estancia
 * ya pregunta sus estudios en España dentro de su propio expediente.
 *
 * Máster, FP (que incluye el grado: servicioDe manda «grado» a FP) y
 * doctorado (18/09/2026): el doctorado no tiene formulario académico propio,
 * pero su candidatura parte de la carrera y la universidad de origen.
 */
const DE_ESTUDIOS = [SERVICIO.MASTER, SERVICIO.FP, SERVICIO.DOCTORADO];

/**
 * Recursos que abren los servicios PROPIOS de la lista. Los expedientes a los
 * que solo se le invitó no cuentan: son de otra persona y sus guías también.
 */
export function accesosDe(solicitudes = []) {
  const abiertos = new Set();
  for (const s of solicitudes) {
    if (s?.invitado) continue;
    for (const acceso of ACCESOS[servicioDe(s)] || []) abiertos.add(acceso);
  }
  return abiertos;
}

/**
 * ¿Tiene contratado el paquete de máster? Entonces el perfil entero es
 * condición del servicio y se le recuerda hasta que esté.
 */
export function pideCompleto(solicitudes = []) {
  return solicitudes.some((s) => !s?.invitado && servicioDe(s) === SERVICIO.MASTER);
}

/** ¿Alguno de sus servicios necesita su historial académico? */
export function pideAcademico(solicitudes = []) {
  return solicitudes.some((s) => !s?.invitado && DE_ESTUDIOS.includes(servicioDe(s)));
}

/** Solo ve expedientes ajenos: viene a ayudar con el trámite de otra persona. */
export function esSoloInvitado(solicitudes = []) {
  return solicitudes.length > 0 && solicitudes.every((s) => s?.invitado);
}
