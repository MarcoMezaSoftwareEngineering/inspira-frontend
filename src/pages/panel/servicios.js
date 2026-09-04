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
  OTRO: "otro",
};

// El identificador del tipo manda: es lo que decide el backend. El texto es el
// respaldo para los expedientes antiguos, que no lo llevaban.
const POR_TIPO = {
  15: SERVICIO.VISADO,
  18: SERVICIO.ESTANCIA,
  20: SERVICIO.MODIFICATORIA,
};

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

  const txt = textoDe(s);
  if (/modificatoria|modificaci/.test(txt)) return SERVICIO.MODIFICATORIA;
  if (txt.includes("estancia")) return SERVICIO.ESTANCIA;
  if (txt.includes("visado") || String(s?.codigo_servicio || "") === "017") return SERVICIO.VISADO;
  if (/formaci[oó]n profesional|\bfp\b|grado/.test(txt)) return SERVICIO.FP;
  if (/m[aá]ster|maestr[ií]a|postgrado|posgrado/.test(txt)) return SERVICIO.MASTER;
  // El paquete de máster es el servicio por defecto del recorrido genérico.
  return SERVICIO.MASTER;
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
  [SERVICIO.MASTER]: ["guia", "becas", "apostilla"],
  [SERVICIO.VISADO]: ["apostilla"],
  [SERVICIO.ESTANCIA]: ["estancia", "apostilla"],
  [SERVICIO.MODIFICATORIA]: ["modificatoria"],
  [SERVICIO.FP]: ["becas", "apostilla"],
  [SERVICIO.OTRO]: ["apostilla"],
};

/** Servicios en los que el perfil académico del asesorado significa algo. */
const DE_ESTUDIOS = [SERVICIO.MASTER, SERVICIO.ESTANCIA, SERVICIO.FP];

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
