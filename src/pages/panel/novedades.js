// Cuándo viste por última vez las novedades de un expediente, y cuántas hay
// desde entonces. Aparte del componente para que la tarjeta de un servicio
// pueda contar sin pintar la lista (y porque un .jsx que exporta funciones
// rompe el refresco en caliente de Vite).
//
// La marca vive en este navegador (`inspira:visto:<id>`). No es un dato que
// haya que conservar: si el almacenamiento falla o se borra, cuenta como nuevo
// lo de la última semana.
import { apiGET } from "../../services/api";

const SEMANA = 7 * 86400000;
const claveVisto = (id) => `inspira:visto:${id}`;

export function leerVisto(id) {
  try {
    const t = Date.parse(localStorage.getItem(claveVisto(id)) || "");
    return Number.isFinite(t) ? t : null;
  } catch {
    return null;
  }
}

export function guardarVisto(id) {
  try {
    localStorage.setItem(claveVisto(id), new Date().toISOString());
  } catch { /* sin almacenamiento: la próxima vez se marca la última semana */ }
}

/** Desde cuándo algo es «nuevo»: la última visita o, sin ella, hace una semana. */
export const desdeVisto = (id) => leerVisto(id) ?? Date.now() - SEMANA;

// Las novedades las piden a la vez el expediente, su línea de tiempo y el
// centro de avisos de la barra de arriba. Un minuto de memoria evita pedir
// tres veces lo mismo al abrir un expediente; un fallo no se recuerda.
const MEMORIA_MS = 60 * 1000;
const memoria = new Map(); // id → { t, promesa }

export function cargarNovedades(idSolicitud) {
  const previa = memoria.get(idSolicitud);
  if (previa && Date.now() - previa.t < MEMORIA_MS) return previa.promesa;
  const promesa = apiGET(`/solicitudes/${idSolicitud}/novedades`).then((r) => {
    if (!r?.ok) memoria.delete(idSolicitud);
    return r;
  }, (e) => {
    memoria.delete(idSolicitud);
    throw e;
  });
  memoria.set(idSolicitud, { t: Date.now(), promesa });
  return promesa;
}

/** Olvida lo guardado (tirar para recargar, «Actualizar»). */
export function olvidarNovedades() {
  memoria.clear();
}

/** El icono de cada tipo de novedad (nombres de components/common/Icono). */
export const ICONO_NOVEDAD = {
  documento_recibido: "documento",
  documento_inspira: "documento",
  documento_aprobado: "escudo",
  documento_observado: "documento",
  documento_proceso: "birrete",
  mensaje: "chat",
  etapa: "brujula",
  requerimiento: "balanza",
  extranjeria: "balanza",
  pago: "euro",
  plazo: "calendario",
};

/** El tono con que se pinta: lo que pide algo, en naranja; lo bueno, en verde. */
export const TONO_NOVEDAD = {
  documento_aprobado: "ok",
  documento_observado: "alto",
  requerimiento: "alto",
  pago: "ok",
  plazo: "aviso",
};

/**
 * Cuántas novedades hay desde la última visita, sin marcar nada como visto.
 * Para un contador en la tarjeta del servicio. Si algo falla, 0.
 * @returns {Promise<number>}
 */
export async function contarNovedades(idSolicitud) {
  if (!idSolicitud) return 0;
  try {
    const r = await cargarNovedades(idSolicitud);
    if (!r?.ok) return 0;
    const desde = desdeVisto(idSolicitud);
    return (r.novedades || []).filter((n) => Date.parse(n.fecha) > desde).length;
  } catch {
    return 0;
  }
}
