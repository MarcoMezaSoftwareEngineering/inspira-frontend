// src/pages/alcanza/ciudades.js
//
// Las cartas del juego, una por ciudad. Funciones puras: entra el índice del
// mapa (GET /api/mapa ya cruzado) y la lista de másteres de ejemplo, salen
// las cartas. Sin React, para poder probarlas.
//
// El juego es un gancho, no una calculadora: cada carta enseña una ciudad con
// lo que la hace distinta, sus universidades, UN máster de ejemplo con su
// matrícula, y cuántos más hay. Lo bastante concreto para creérselo y lo
// bastante corto para querer más. El gasto anual no sale en la carta —asusta
// antes de tiempo—; la matrícula sí, porque es la cifra que sorprende.
import ejemplos from "./ejemplos.json";

/** Ciudades con dibujo propio en IlustracionesMapa; el resto usa el genérico. */
const CON_DIBUJO = new Set([
  "madrid", "barcelona", "valencia", "sevilla", "granada", "bilbao",
  "salamanca", "santiago-de-compostela", "zaragoza", "malaga", "alicante", "cordoba",
]);

/** El orden en que se enseñan los tres campos de ejemplo. */
const CAMPOS = [
  { clave: "mba", etiqueta: "MBA" },
  { clave: "ia", etiqueta: "Inteligencia artificial" },
  { clave: "proyectos", etiqueta: "Gestión de proyectos" },
];

const numeroRanking = (u) => {
  const p = u?.ranking?.posicion;
  const n = Number(String(p || "").replace(/[^\d]/g, "").slice(0, 4));
  return n > 0 ? n : null;
};

/**
 * La frase que caracteriza a la ciudad: la línea de `vida.estilo` de su
 * comunidad que la nombra; si ninguna la nombra, el clima. Es texto de la
 * API, escrito por una persona; aquí solo se elige cuál.
 */
export function rasgoDe(ciudad, comunidad) {
  const v = comunidad?.vida || {};
  const nombre = String(ciudad?.nombre || "").toLowerCase();
  const estilo = Array.isArray(v.estilo) ? v.estilo : [];
  const propia = estilo.find((t) => String(t).toLowerCase().includes(nombre));
  if (propia) return String(propia);
  if (v.clima) return String(v.clima).split(";")[0].replace(/\.$/, "");
  return null;
}

/** El gasto mensual medio de vivir en la ciudad, si la API lo trae. */
export function vidaMes(ciudad, comunidad) {
  const lista = comunidad?.vida?.ciudades || [];
  const nombre = String(ciudad?.nombre || "").toLowerCase();
  const fila = lista.find((x) => String(x.nombre || "").toLowerCase() === nombre) || null;
  const g = fila?.gasto_mes;
  const medio = typeof g === "object" && g ? Number(g.medio ?? g.max ?? g.alto) : Number(g);
  return Number.isFinite(medio) && medio > 0 ? Math.round(medio) : null;
}

/**
 * Una carta por ciudad.
 *
 * @param {object} indice   crearIndice(GET /api/mapa)
 * @param {object} [lista]  másteres de ejemplo por universidad (ejemplos.json)
 * @returns {object[]}      ordenadas por número de másteres, de más a menos
 */
export function cartasCiudad(indice, lista = ejemplos) {
  const cartas = [];
  for (const c of indice.ciudades.values()) {
    const unis = (c.universidades || []).map((id) => indice.universidades.get(id)).filter(Boolean);
    if (!unis.length) continue;
    const comunidad = indice.comunidades.get(c.comunidad);

    // La universidad que abre la carta: la mejor situada en el ranking.
    const conRanking = unis.filter(numeroRanking).sort((a, b) => numeroRanking(a) - numeroRanking(b));
    const principal = conRanking[0] || unis[0];

    // El máster de ejemplo: el primero de los tres campos que exista en
    // alguna universidad de la ciudad, empezando por la principal.
    let ejemplo = null;
    for (const campo of CAMPOS) {
      for (const u of [principal, ...unis.filter((x) => x !== principal)]) {
        const e = lista[u.id]?.[campo.clave];
        if (e) {
          ejemplo = { campo: campo.etiqueta, nombre: e.nombre, universidad: u, url: e.url || null };
          break;
        }
      }
      if (ejemplo) break;
    }

    // La matrícula: la de la comunidad para 60 créditos, que es lo que cuesta
    // un año de máster oficial. Cataluña no publica una única —cada universidad
    // fija la suya—, así que ahí vale el precio típico de la universidad
    // principal, que la API calcula sobre sus másteres con precio. Sin ninguna
    // de las dos, la carta no enseña cifra.
    const m = comunidad?.matricula || {};
    // Orden de confianza: la norma de la comunidad; el precio típico de una
    // universidad de la ciudad; y, si nadie trae nada, el típico de la
    // comunidad calculado sobre sus másteres con precio.
    const pc = comunidad?.precios || {};
    const candidatos = [
      m.min,
      ...[principal, ...unis.filter((x) => x !== principal)].flatMap((u) => [u.precios?.tipico, u.precios?.desde]),
      pc.tipico,
      pc.desde,
    ]
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0);
    const matricula = candidatos.length ? Math.round(candidatos[0]) : null;

    cartas.push({
      id: c.id,
      nombre: c.nombre,
      comunidad: comunidad?.nombre || "",
      comunidadId: c.comunidad,
      dibujo: CON_DIBUJO.has(c.id) ? c.id : "CAMPUS",
      universidades: unis.map((u) => ({ id: u.id, sigla: u.sigla, nombre: u.nombre })),
      principal: { id: principal.id, sigla: principal.sigla, nombre: principal.nombre, ranking: numeroRanking(principal) },
      masteres: Number(c.masteres) || 0,
      ejemplo,
      matricula,
      vidaMes: vidaMes(c, comunidad),
      rasgo: rasgoDe(c, comunidad),
    });
  }
  return cartas.sort((a, b) => b.masteres - a.masteres);
}

/**
 * Las cartas de una partida: seis, con ejemplo y dibujo propio cuando se
 * puede, repartidas entre comunidades distintas para que no salgan tres de
 * Andalucía seguidas. Mismo orden siempre: el juego se comparte y dos personas
 * que lo juegan deben ver lo mismo.
 */
export function partida(cartas, n = 6) {
  const conTodo = cartas.filter((c) => c.ejemplo && c.matricula && c.dibujo !== "CAMPUS");
  const elegidas = [];
  const vistas = new Set();
  // 1) Una por comunidad, entre las completas.
  for (const c of conTodo) {
    if (elegidas.length >= n) break;
    if (vistas.has(c.comunidadId)) continue;
    elegidas.push(c);
    vistas.add(c.comunidadId);
  }
  // 2) Si no llegó, se repite comunidad antes que bajar a una carta sin
  //    ejemplo o sin dibujo: una carta completa de Andalucía vale más que una
  //    genérica de otra parte.
  for (const c of conTodo) {
    if (elegidas.length >= n) break;
    if (!elegidas.includes(c)) elegidas.push(c);
  }
  // 3) Y solo en último caso, el resto.
  for (const c of cartas) {
    if (elegidas.length >= n) break;
    if (!elegidas.includes(c)) elegidas.push(c);
  }
  return elegidas.slice(0, n);
}
