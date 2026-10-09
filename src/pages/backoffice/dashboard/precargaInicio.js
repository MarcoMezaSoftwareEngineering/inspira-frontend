// Las rutas que pide el Inicio de Core (Dashboard y la barra «Hoy»), en un
// archivo aparte y diminuto: BackofficeApp las adelanta mientras comprueba la
// sesión y descarga el código del Inicio, sin tener que cargar el Inicio para
// saber qué pedir (09/10/2026). Si cambia una ruta, cambia aquí y en los dos
// sitios a la vez.
export const RUTA_STATS = "/backoffice/dashboard/stats";

// «Solo lo mío» / «Todo el equipo» de la barra Hoy: se recuerda en este navegador.
export const CLAVE_MIO_HOY = "bo_hoy_mio";

export function leerMioHoy() {
  try { return localStorage.getItem(CLAVE_MIO_HOY) === "1"; } catch { return false; }
}

export const rutaHoy = (mio) => `/backoffice/hoy${mio ? "?mio=1" : ""}`;

/** Lo que el Inicio pedirá en cuanto se monte. */
export function peticionesDelInicio() {
  return [RUTA_STATS, rutaHoy(leerMioHoy())];
}
