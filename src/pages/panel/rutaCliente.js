// «Mi ruta»: por dónde va el asesorado entre todos sus servicios.
//
// Se calcula SOLO con lo que ya trae /solicitudes/mias (el `resumen` de cada
// servicio y los campos de la solicitud que el backend manda enteros, como
// `postulaciones_data`). Lo que no llega aquí no se adivina: la etapa queda
// como pendiente y se remite al expediente, donde está el detalle.
import { rutaDe } from "./ruta";
import { SERVICIO, servicioDe } from "./servicios";

export const ESTADO_ETAPA = {
  HECHO: "hecho",
  ACTUAL: "actual",
  PENDIENTE: "pendiente",
  SIGUIENTE: "siguiente",       // aún no contratado: se habla con el asesor
  PROXIMAMENTE: "proximamente", // llegará cuando se cumpla lo anterior
};

const ENVIADAS = ["postulado", "admitido", "denegado"];

/** Cuentas de las postulaciones del máster, si el backend las mandó. */
export function cuentaPostulaciones(s) {
  const posts = Array.isArray(s?.postulaciones_data) ? s.postulaciones_data : null;
  if (!posts) return null;
  const enviadas = posts.filter((p) => ENVIADAS.includes(p?.estado)).length;
  const admitidas = posts.filter((p) => p?.estado === "admitido").length;
  return { total: posts.length, enviadas, preparacion: posts.length - enviadas, admitidas };
}

const esLlegada = (s) =>
  /empadron|\btie\b|llegada a espa|tarjeta de identidad de extranjero/i.test(
    String(s?.tipo?.nombre || s?.titulo || ""),
  );

// Las etapas de la estancia que manda el servidor (`flujo.etapa().cliente`).
const ETAPA_ESTANCIA = [
  [/datos/i, 0], [/subiendo|documento/i, 1], [/revisi/i, 1],
  [/presentad/i, 3], [/requerid/i, 3], [/favorable|resuel|concedid/i, 4],
];
function indiceEstancia(r) {
  const t = String(r?.etapa_propia || "");
  for (const [rx, i] of ETAPA_ESTANCIA) if (rx.test(t)) return i;
  if (r?.datos_faltan > 0) return 0;
  return null;
}

function pasosMaster(s) {
  const r = s.resumen || {};
  const ir = (seccion) => rutaDe({ idServicio: s.id_solicitud, seccion });
  const post = cuentaPostulaciones(s);
  // Hecho solo si está completo; en curso si hay actividad real; si no, pendiente.
  const estado = (completo, activo) =>
    completo ? ESTADO_ETAPA.HECHO : activo ? ESTADO_ETAPA.ACTUAL : ESTADO_ETAPA.PENDIENTE;
  const docsSabidos = r.docs_pendientes != null;
  const docsCompletos = docsSabidos && r.docs_pendientes === 0 && !(r.docs_observados > 0);
  return [
    {
      clave: "docs", titulo: "Documentos",
      detalle: r.docs_observados > 0 ? `${r.docs_observados} por corregir` : null,
      estado: estado(docsCompletos, r.docs_observados > 0), href: ir("docs"),
    },
    { clave: "form", titulo: "Formulario académico", estado: estado(r.formulario_completo === true, false), href: ir("form") },
    {
      clave: "informe", titulo: "Informe de másteres",
      detalle: r.informe_disponible ? "Disponible" : r.formulario_completo ? "Lo prepara tu asesor" : null,
      estado: estado(r.informe_disponible === true, r.formulario_completo === true), href: ir("informe"),
    },
    { clave: "eleccion", titulo: "Elección de másteres", estado: estado(r.eleccion_completa === true, false), href: ir("eleccion") },
    {
      clave: "post", titulo: "Postulaciones",
      detalle: post && post.total ? `${post.enviadas} ${post.enviadas === 1 ? "enviada" : "enviadas"} · ${post.preparacion} en preparación` : null,
      estado: estado(Boolean(post && post.admitidas > 0), Boolean(post && post.total > 0)), href: ir("post"),
    },
    {
      clave: "cierre", titulo: "Cierre y visado",
      detalle: post && post.admitidas > 0 ? "Con admisión: toca elegir visa o estancia" : null,
      estado: estado(false, Boolean(post && post.admitidas > 0)), href: ir("cierre"),
    },
  ];
}

/**
 * La ruta del asesorado. Devuelve las etapas grandes y, dentro del máster,
 * sus seis pasos.
 */
export function rutaDelCliente(servicios = []) {
  const propios = (servicios || []).filter((s) => !s?.invitado);
  if (!propios.length) return { etapas: [], modo: null };

  const master = propios.find((s) => servicioDe(s) === SERVICIO.MASTER && !esLlegada(s));
  const visado = propios.find((s) => servicioDe(s) === SERVICIO.VISADO);
  const estancia = propios.find((s) => servicioDe(s) === SERVICIO.ESTANCIA);
  const migratoria = visado || estancia || null;
  const llegada = propios.find(esLlegada);

  const diagnostico = {
    clave: "diagnostico", titulo: "Diagnóstico", detalle: "Hecho con tu asesor",
    estado: ESTADO_ETAPA.HECHO, icono: "check",
  };

  const etapaLlegada = llegada
    ? {
        clave: "llegada", titulo: "Llegada a España", detalle: llegada.estado?.nombre || "En curso",
        estado: llegada.estado?.es_final ? ESTADO_ETAPA.HECHO : ESTADO_ETAPA.ACTUAL,
        href: rutaDe({ idServicio: llegada.id_solicitud }),
      }
    : {
        clave: "llegada", titulo: "Llegada a España",
        detalle: "Empadronamiento y TIE. Por contratar", estado: ESTADO_ETAPA.SIGUIENTE, contacto: true,
      };

  const etapaMigratoria = (s) => {
    if (!s) {
      return {
        clave: "via", titulo: "Vía migratoria", detalle: "Visado o estancia por estudios",
        estado: ESTADO_ETAPA.SIGUIENTE, contacto: true,
      };
    }
    const r = s.resumen || {};
    const esEst = servicioDe(s) === SERVICIO.ESTANCIA;
    const fin = esEst && indiceEstancia(r) === 4;
    const partes = [
      esEst ? r.etapa_propia : null,
      r.docs_observados > 0 ? `${r.docs_observados} documento(s) por corregir` : null,
    ].filter(Boolean);
    return {
      clave: "via", titulo: esEst ? "Estancia por estudios" : "Visado de estudios",
      detalle: partes.join(" · ") || "En curso",
      estado: fin ? ESTADO_ETAPA.HECHO : ESTADO_ETAPA.ACTUAL,
      href: rutaDe({ idServicio: s.id_solicitud }),
    };
  };

  if (master) {
    const pasos = pasosMaster(master);
    const post = cuentaPostulaciones(master);
    const conAdmision = Boolean(post && post.admitidas > 0);
    const masterHecho = pasos.every((p) => p.estado === ESTADO_ETAPA.HECHO);
    const masterActivo = pasos.some((p) => p.estado !== ESTADO_ETAPA.PENDIENTE);
    const etapas = [
      diagnostico,
      {
        clave: "master", titulo: "Máster", detalle: master.titulo, pasos,
        estado: masterHecho ? ESTADO_ETAPA.HECHO : masterActivo ? ESTADO_ETAPA.ACTUAL : ESTADO_ETAPA.PENDIENTE,
        href: rutaDe({ idServicio: master.id_solicitud }),
      },
      {
        clave: "admision", titulo: "Admisión y carta",
        detalle: conAdmision ? `${post.admitidas} admisión(es) recibida(s)` : "Cuando llegue tu primera admisión",
        estado: conAdmision ? ESTADO_ETAPA.ACTUAL : ESTADO_ETAPA.PROXIMAMENTE,
        href: conAdmision ? rutaDe({ idServicio: master.id_solicitud, seccion: "cierre" }) : null,
      },
      etapaMigratoria(migratoria),
      etapaLlegada,
    ];
    return { etapas, modo: "master" };
  }

  // Solo visado o estancia: su propio recorrido.
  const s = migratoria || propios[0];
  const r = s.resumen || {};
  const ir = rutaDe({ idServicio: s.id_solicitud });
  const esEst = servicioDe(s) === SERVICIO.ESTANCIA;
  let pasos;
  if (esEst) {
    const i = indiceEstancia(r);
    const est = (n) => (i == null ? ESTADO_ETAPA.PENDIENTE : n < i ? ESTADO_ETAPA.HECHO : n === i ? ESTADO_ETAPA.ACTUAL : ESTADO_ETAPA.PENDIENTE);
    pasos = [
      {
        clave: "datos", titulo: "Tus datos", detalle: r.datos_faltan > 0 ? `Faltan ${r.datos_faltan}` : null,
        estado: r.datos_faltan > 0 ? ESTADO_ETAPA.ACTUAL : est(0), href: ir,
      },
      {
        clave: "docs", titulo: "Documentos",
        detalle: [r.docs_pendientes > 0 ? `${r.docs_pendientes} por subir` : null, r.docs_observados > 0 ? `${r.docs_observados} por corregir` : null].filter(Boolean).join(" · ") || null,
        // Con documentos por subir o corregir no está hecho, vaya por donde vaya el trámite.
        estado: r.docs_pendientes > 0 || r.docs_observados > 0 ? ESTADO_ETAPA.ACTUAL : est(1),
        href: ir,
      },
      { clave: "presentacion", titulo: "Presentación en Extranjería", estado: est(2), href: ir },
      {
        clave: "resolucion", titulo: "Resolución", detalle: (r.requerimientos || []).length ? "Requerimiento abierto" : null,
        estado: (r.requerimientos || []).length ? ESTADO_ETAPA.ACTUAL : est(3), href: ir,
      },
    ];
  } else {
    // El visado no manda su etapa en la lista: lo que se sabe son los documentos.
    const docsTarea = r.docs_observados > 0 || r.docs_pendientes > 0;
    pasos = [
      { clave: "datos", titulo: "Tus datos", detalle: "El detalle está en tu expediente", estado: ESTADO_ETAPA.PENDIENTE, href: rutaDe({ idServicio: s.id_solicitud, seccion: "datos" }) },
      { clave: "docs", titulo: "Documentos", detalle: r.docs_observados > 0 ? `${r.docs_observados} por corregir` : null, estado: docsTarea ? ESTADO_ETAPA.ACTUAL : ESTADO_ETAPA.PENDIENTE, href: rutaDe({ idServicio: s.id_solicitud, seccion: "docs" }) },
      { clave: "cita", titulo: "Cita en el consulado", detalle: "El detalle está en tu expediente", estado: ESTADO_ETAPA.PENDIENTE, href: rutaDe({ idServicio: s.id_solicitud, seccion: "estado" }) },
      { clave: "resolucion", titulo: "Resolución", estado: ESTADO_ETAPA.PENDIENTE, href: rutaDe({ idServicio: s.id_solicitud, seccion: "estado" }) },
    ];
  }
  const etapas = [
    diagnostico,
    ...pasos,
    { ...etapaLlegada, estado: etapaLlegada.estado === ESTADO_ETAPA.SIGUIENTE ? ESTADO_ETAPA.SIGUIENTE : etapaLlegada.estado },
  ];
  return { etapas, modo: esEst ? "estancia" : "visado", servicio: s };
}

/** La etapa en curso y la que viene después, para Inicio. */
export function puntoDeRuta(servicios) {
  const { etapas } = rutaDelCliente(servicios);
  const plano = etapas.flatMap((e) => (e.pasos ? e.pasos.map((p) => ({ ...p, de: e.titulo })) : [e]));
  const i = plano.findIndex((e) => e.estado === ESTADO_ETAPA.ACTUAL);
  const actual = i >= 0 ? plano[i] : null;
  const siguiente = plano.slice(i + 1).find((e) => e.estado !== ESTADO_ETAPA.HECHO)
    || plano.find((e) => e.estado === ESTADO_ETAPA.SIGUIENTE) || null;
  const hechas = plano.filter((e) => e.estado === ESTADO_ETAPA.HECHO).length;
  return { actual, siguiente, hechas, total: plano.length, plano };
}
