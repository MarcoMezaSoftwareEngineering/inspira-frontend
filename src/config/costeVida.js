// src/config/costeVida.js
// Coste de vida mensual de un estudiante por ciudad, para /grado-en-espana
// (simulador y sección «Vivir en España»).
//
// Datos: costeVida.datos.json, copia de
// entregables/investigacion/coste-vida-2026.json (elaborado el 14/09/2026:
// habitación en piso compartido de Fotocasa julio 2026 e idealista 2.º
// trimestre 2026, transporte joven de cada operador y gasto bajo–medio
// estimado por Inspira). Se regenera con extraer_vida.py (scratchpad de la
// sesión cdfb231e, grado-web). No escribas cifras a mano.
//
// Reglas de uso (coordinador, 14/09/2026): siempre «orientativo» y con la nota
// del método; `verificado: false` se muestra como «aprox.» y nunca en una
// cifra destacada; recordar que el mínimo legal es el IPREM 2026 (600 €/mes)
// y que en las ciudades caras el gasto real lo supera.
import DATOS from "./costeVida.datos.json";

export const FUENTE_VIDA = {
  documento: DATOS.meta.titulo,
  fecha: DATOS.meta.fecha,
  metodo: DATOS.meta.metodo,
  noIncluye: DATOS.meta.noIncluye,
};

export const IPREM_REFERENCIA = DATOS.iprem;
export const FUENTES_VIDA = DATOS.fuentes;

/** [{ id, nombre, comunidadId, comunidad, mensual: {min, max}, habitacion, transporte, verificado, nota, fuentes }] */
export const CIUDADES = DATOS.ciudades;

export const hayCosteVida = () => CIUDADES.length > 0;

/** «Zaragoza (aprox.)» cuando alguna cifra de la ciudad no está verificada. */
export const nombreCiudad = (c) => (c ? `${c.nombre}${c.verificado ? "" : " (aprox.)"}` : "");
