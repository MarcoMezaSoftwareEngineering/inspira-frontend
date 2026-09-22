// src/pages/mapa/vida.js
// Coste de vida por comunidad (`comunidad.vida` en GET /api/mapa), en funciones
// puras: lo usan la sección «Vivir aquí», el comparador y el filtro de
// presupuesto total.
//
//   vida = { ciudades: [{ nombre, habitacion_mes, estudio_mes, transporte_mes,
//                         gasto_mes: { bajo, medio }, verificado }],
//            clima, estilo: [], idioma_cooficial, fuente_resumen, actualizado }
//
// Los importes pueden llegar como número, rango ({ min, max }, { desde, hasta },
// { bajo, medio }, [a, b]) o texto. Sin cifra utilizable, null: no se pinta.
import { numero } from "./mapaTextos";

const NBSP = " ";
const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const clave = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** [bajo, alto] de un importe en cualquiera de sus formas; null si no hay cifra. */
export function rangoImporte(v) {
  if (v == null) return null;
  if (typeof v === "number" || (typeof v === "string" && num(v) != null)) {
    const n = num(v);
    return n > 0 ? [n, n] : null;
  }
  if (Array.isArray(v)) {
    const ns = v.map(num).filter((n) => n != null && n > 0);
    return ns.length ? [Math.min(...ns), Math.max(...ns)] : null;
  }
  if (typeof v === "object") {
    const a = num(v.bajo ?? v.min ?? v.desde ?? v.minimo);
    const b = num(v.medio ?? v.max ?? v.hasta ?? v.maximo ?? v.alto);
    const ns = [a, b].filter((n) => n != null && n > 0);
    return ns.length ? [Math.min(...ns), Math.max(...ns)] : null;
  }
  return null;
}

/** «≈ 350 €/mes» o «300–450 €/mes»; un texto de la API se respeta tal cual. */
export function textoMes(v) {
  if (typeof v === "string" && num(v) == null) return v.trim() || null;
  const r = rangoImporte(v);
  if (!r) return null;
  const [a, b] = r.map(Math.round);
  return a === b ? `≈ ${numero(a)}${NBSP}€/mes` : `${numero(a)}–${numero(b)}${NBSP}€/mes`;
}

/** La vida de una comunidad con solo las ciudades que traen alguna cifra; null si no hay. */
export function leerVida(c) {
  const v = c?.vida;
  if (!v || typeof v !== "object") return null;
  const ciudades = (Array.isArray(v.ciudades) ? v.ciudades : [])
    .filter((x) => x && String(x.nombre || "").trim())
    .filter((x) => [x.habitacion_mes, x.estudio_mes, x.transporte_mes, x.gasto_mes].some((i) => textoMes(i)));
  if (!ciudades.length) return null;
  return { ...v, ciudades, estilo: (Array.isArray(v.estilo) ? v.estilo : []).filter(Boolean).slice(0, 3) };
}

export const mismaCiudad = (a, b) => clave(a) === clave(b);

/** Gasto mensual para el comparador: el de la ciudad pedida o, si no, el rango de todas. */
export function gastoMensual(c, nombreCiudad = null) {
  const vida = leerVida(c);
  if (!vida) return null;
  const propia = nombreCiudad && vida.ciudades.find((x) => mismaCiudad(x.nombre, nombreCiudad));
  const fuentes = propia ? [propia] : vida.ciudades;
  const rangos = fuentes.map((x) => rangoImporte(x.gasto_mes)).filter(Boolean);
  if (!rangos.length) return null;
  const bajo = Math.min(...rangos.map((r) => r[0]));
  const medio = Math.max(...rangos.map((r) => r[1]));
  return {
    bajo,
    medio,
    texto: textoMes({ bajo, medio }),
    detalle: propia ? propia.nombre : fuentes.length > 1 ? `según la ciudad (${fuentes.length})` : fuentes[0].nombre,
  };
}

/**
 * Presupuesto anual orientativo de una comunidad: matrícula típica de un
 * máster + gasto de vida medio × 12 en su ciudad más económica con dato.
 * Sin matrícula publicable (`sinPublicar`, o «lo fija cada universidad») o
 * sin coste de vida, null.
 */
export function presupuestoAnual(c, sinPublicar = false) {
  const vida = leerVida(c);
  if (!vida || sinPublicar) return null;
  const matricula = c.precioAnual?.tipico ?? (c.matricula && !c.matricula.cadaUniversidad ? c.matricula.min : null);
  if (!Number.isFinite(matricula)) return null;
  const conGasto = vida.ciudades.map((x) => ({ x, r: rangoImporte(x.gasto_mes) })).filter((o) => o.r);
  if (!conGasto.length) return null;
  const barata = conGasto.sort((a, b) => a.r[1] - b.r[1])[0];
  const vidaAnual = Math.round(barata.r[1] * 12);
  return {
    matricula: Math.round(matricula),
    vida: vidaAnual,
    mes: Math.round(barata.r[1]),
    // Lo que de verdad pregunta la gente: cuánto cuesta el piso.
    habitacion: mensual(barata.x.habitacion_mes),
    estudio: mensual(barata.x.estudio_mes),
    total: Math.round(matricula) + vidaAnual,
    ciudad: barata.x.nombre,
  };
}

/** El extremo alto de un importe mensual, redondeado; null si no hay dato. */
function mensual(v) {
  const r = rangoImporte(v);
  return r ? Math.round(r[1]) : null;
}

/**
 * El mismo presupuesto, pero con el gasto de vida de una ciudad concreta
 * cuando esa ciudad trae dato propio. En la ficha de una ciudad, hablar del
 * gasto de otra (la más barata de la comunidad) despistaba.
 */
export function presupuestoEnCiudad(c, nombreCiudad, sinPublicar = false) {
  const base = presupuestoAnual(c, sinPublicar);
  if (!base || !nombreCiudad) return base;
  const g = gastoMensual(c, nombreCiudad);
  if (!g || !mismaCiudad(g.detalle, nombreCiudad)) return base;
  const vida = Math.round(g.medio * 12);
  const ficha = leerVida(c)?.ciudades.find((x) => mismaCiudad(x.nombre, nombreCiudad));
  return {
    matricula: base.matricula,
    vida,
    mes: Math.round(g.medio),
    habitacion: mensual(ficha?.habitacion_mes),
    estudio: mensual(ficha?.estudio_mes),
    total: base.matricula + vida,
    ciudad: nombreCiudad,
  };
}
