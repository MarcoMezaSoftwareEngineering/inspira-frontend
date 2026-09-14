// src/pages/mapa/proyeccion.js
// Latitud y longitud → coordenadas del viewBox de
// pages/landing/master2027/mapaEspana.data.js.
//
// Esa geometría se generó (build_mapa.py, 10/09/2026) con una proyección
// equirectangular corregida por cos(40°) para la península, Baleares, Ceuta y
// Melilla, y otra aparte para Canarias, a escala 0,8 y corregida por
// cos(28,3°), colocada en su recuadro. Las constantes de abajo son las de aquel
// script, recalculadas sobre el mismo archivo de Natural Earth, así que un
// punto proyectado aquí cae donde cae en el dibujo. Comprobado a ojo con
// Madrid, Barcelona, Sevilla, Santander y Las Palmas.
//
// Si se regenera la geometría con otros márgenes o escala, hay que recalcular
// estas constantes a la vez.

const ESCALA = 94.63173169197005;
const ESCALA_CANARIAS = 75.70538535357603;

const PENINSULA = {
  lon0: -9.291981574999909,
  lat0: 43.79344310100004,
  kx: 0.766044443118978 * ESCALA,
  ky: ESCALA,
  x0: 6,
  y0: 6,
};

const CANARIAS = {
  lon0: -18.167225714999915,
  lat0: 29.289455471000053,
  kx: 0.880477353509162 * ESCALA_CANARIAS,
  ky: ESCALA_CANARIAS,
  x0: 663.4178045131503,
  y0: 684.0861618407389,
};

/** [x, y] en unidades del viewBox. Canarias va a su recuadro. */
export function proyectar(lat, lon) {
  const p = lat < 30.5 && lon < -12 ? CANARIAS : PENINSULA;
  return [p.x0 + (lon - p.lon0) * p.kx, p.y0 + (p.lat0 - lat) * p.ky];
}
