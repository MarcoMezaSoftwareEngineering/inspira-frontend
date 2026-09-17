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

export const cargarNovedades = (idSolicitud) => apiGET(`/solicitudes/${idSolicitud}/novedades`);

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
