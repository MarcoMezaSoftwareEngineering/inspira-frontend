// src/pages/mapa/indice.js
// Índices, búsqueda y filtros del mapa: funciones puras sobre la respuesta de
// GET /api/mapa. La página no hace cuentas por su lado: los recuentos y los
// precios llegan hechos del servidor y aquí solo se filtran y se suman.
//
// Al crear el índice se normaliza lo que la API puede ir añadiendo con otro
// nombre: la titularidad (`titularidad` o `tipo`), el precio aproximado de un
// máster por año y sus ejemplos. Si un dato no viene, queda en null y la
// página no lo pinta.

import { leerPlazos, topeAbre } from "./plazos";
import { presupuestoAnual } from "./vida";

export const SIN_RAMA = "SIN_CLASIFICAR";

// Filtro «Abre antes de…»: mes (del primer año del curso) de cada opción.
export const ABRE_MESES = { feb: 2, abr: 4 };

/** Becas vinculadas a sus másteres: [{ nombre, entidad, curso, masteres }]. */
export function leerBecas(u) {
  if (!Array.isArray(u?.becas)) return [];
  return u.becas
    .map((b) => ({
      nombre: String(b?.nombre || "").trim(),
      entidad: b?.entidad ? String(b.entidad).trim() : null,
      curso: b?.curso ? String(b.curso).trim() : null,
      masteres: Number.isFinite(Number(b?.masteres)) && Number(b.masteres) > 0 ? Number(b.masteres) : null,
    }))
    .filter((b) => b.nombre);
}

// Deslizador de matrícula máxima (euros al año) cuando no hay datos para
// calcular sus límites. En el tope, «sin límite».
export const MATRICULA_SLIDER = { min: 600, max: 5100, paso: 100 };

export const prefiereMenosMovimiento = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Minúsculas, sin tildes y sin signos: «Alcalá de Henares» → «alcala de henares». */
export function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const numeroValido = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));

/** Precio aproximado de un máster por año: { desde, tipico, hasta, n, confianza } o null. */
export function leerPrecioAnual(e) {
  // Forma definitiva de la API: `precios` { desde, tipico, hasta, n, precio_confianza, ejemplos }.
  const p = e?.precios ?? e?.precioAnual ?? e?.precio_anual ?? e?.precioAproximado ?? e?.precio_aproximado ?? e?.precioPorAnio ?? e?.precio ?? null;
  if (p == null) return null;
  if (typeof p === "number") return p > 0 ? { desde: p, tipico: p, hasta: p, n: null, confianza: null } : null;
  if (typeof p !== "object") return null;
  const desde = numeroValido(p.desde ?? p.min ?? p.minimo);
  const tipico = numeroValido(p.tipico ?? p["típico"] ?? p.mediana ?? p.medio ?? p.habitual);
  const hasta = numeroValido(p.hasta ?? p.max ?? p.maximo);
  const valores = [desde, tipico, hasta].filter((v) => v != null && v > 0);
  if (!valores.length) return null;
  const confianza = p.precio_confianza ?? p.confianza ?? e?.precio_confianza ?? e?.precioConfianza ?? null;
  return {
    desde: desde ?? Math.min(...valores),
    tipico: tipico ?? desde ?? hasta,
    hasta: hasta ?? Math.max(...valores),
    n: numeroValido(p.n ?? p.conPrecio ?? p.con_precio ?? p.nConPrecio ?? p.muestras),
    confianza: confianza ? normalizar(confianza) : null,
  };
}

/** Hasta 3 ejemplos { nombre, rama, precio, universidad } con precio. */
export function leerEjemplos(e) {
  const lista = e?.precios?.ejemplos ?? e?.ejemplos ?? e?.ejemplosMasteres ?? e?.ejemplos_masteres ?? e?.masteresEjemplo ?? null;
  if (!Array.isArray(lista)) return [];
  return lista
    .map((x) => ({
      nombre: String(x?.nombre ?? x?.master ?? x?.titulo ?? "").trim(),
      rama: x?.rama ?? null,
      precio: numeroValido(x?.por_anio ?? x?.porAnio ?? x?.precioAnual ?? x?.precio_anual ?? x?.precioAproximado ?? x?.precio ?? x?.eur),
      universidad: typeof x?.universidad === "string" ? x.universidad : x?.sigla ?? null,
    }))
    .filter((x) => x.nombre && x.precio != null && x.precio > 0)
    .slice(0, 3);
}

/** Precio con el que filtra el deslizador: el «desde» de la universidad o, si no, el de su comunidad. */
export function precioParaFiltro(indice, u) {
  const com = indice.comunidades.get(u?.comunidad);
  const v = u?.precioAnual?.desde ?? com?.precioAnual?.desde ?? com?.matricula?.min ?? null;
  return Number.isFinite(v) ? v : null;
}

/** Precio habitual de una universidad (el suyo o el de su comunidad). */
export const precioDeUniversidad = (indice, u) => u?.precioAnual || indice.comunidades.get(u?.comunidad)?.precioAnual || null;

/** Ejemplos de la comunidad o, si no trae, uno de cada una de sus 3 universidades con más másteres. */
export function ejemplosDeComunidad(indice, c) {
  if (c?.ejemplos?.length) return c.ejemplos;
  return (c?.universidadesIds || [])
    .map((id) => indice.universidades.get(id))
    .filter((u) => u?.ejemplos?.length)
    .sort((a, b) => b.masteres - a.masteres)
    .slice(0, 3)
    .map((u) => ({ ...u.ejemplos[0], universidad: u.ejemplos[0].universidad || u.sigla }));
}

function limitesPrecio(indice) {
  const valores = indice.datos.universidades.map((u) => precioParaFiltro(indice, u)).filter((v) => v != null);
  if (!valores.length) return MATRICULA_SLIDER;
  const paso = 100;
  const min = Math.max(0, Math.floor(Math.min(...valores) / paso) * paso);
  const max = Math.ceil(Math.max(...valores) / paso) * paso + paso;
  return { min, max, paso };
}

export function crearIndice(datosApi) {
  const raizPrecios = datosApi.precios || {};
  // `masteresConPrecio` es el «n» del rango; la nota de confianza baja la redacta la API.
  const conPrecio = (e) => {
    const p = leerPrecioAnual(e);
    if (!p) return null;
    if (p.n == null) p.n = numeroValido(e?.precios?.masteresConPrecio);
    if (p.confianza === "baja" && raizPrecios.confianzaBaja) p.nota = raizPrecios.confianzaBaja;
    return p;
  };
  const datos = {
    ...datosApi,
    // `sinPublicar` llega como [{ comunidad, motivo }]: se deja en ids de comunidad.
    precios: {
      ...raizPrecios,
      sinPublicar: (raizPrecios.sinPublicar || []).map((s) => (typeof s === "string" ? s : s?.comunidad)).filter(Boolean),
    },
    universidades: datosApi.universidades.map((u) => ({
      ...u,
      titularidad: u.titularidad ?? u.tipo ?? null,
      precioAnual: conPrecio(u),
      ejemplos: leerEjemplos(u),
    })),
    comunidades: datosApi.comunidades.map((c) => ({ ...c, precioAnual: conPrecio(c), ejemplos: leerEjemplos(c) })),
  };

  const comunidades = new Map(datos.comunidades.map((c) => [c.id, c]));
  const ciudades = new Map(datos.ciudades.map((c) => [c.id, c]));
  const universidades = new Map(datos.universidades.map((u) => [u.id, u]));
  const listas = new Map(datos.listas.map((l) => [l.id, l]));

  const busqueda = [
    ...datos.universidades.map((u) => ({
      tipo: "universidad",
      id: u.id,
      titulo: u.nombre,
      detalle: [u.sigla, ciudades.get(u.ciudad)?.nombre].filter(Boolean).join(" · "),
      clave: normalizar(`${u.nombre} ${u.sigla} ${u.sedes.join(" ")}`),
      sigla: normalizar(u.sigla),
    })),
    ...datos.ciudades.map((c) => ({
      tipo: "ciudad",
      id: c.id,
      titulo: c.nombre,
      detalle: comunidades.get(c.comunidad)?.nombre || "",
      clave: normalizar(c.nombre),
      sigla: "",
    })),
    ...datos.comunidades.map((c) => ({
      tipo: "comunidad",
      id: c.id,
      titulo: c.nombre,
      detalle: "Comunidad autónoma",
      clave: normalizar(c.nombre),
      sigla: "",
    })),
  ];

  const indice = { datos, comunidades, ciudades, universidades, listas, ramas: datos.ramas, busqueda };
  indice.limitesPrecio = limitesPrecio(indice);
  indice.hayPrecios = datos.comunidades.some((c) => c.precioAnual) || datos.universidades.some((u) => u.precioAnual);

  // Campos que la API va sumando: cada filtro solo se ofrece si llega su dato.
  indice.hayPlazos = datos.universidades.some((u) => leerPlazos(u));
  indice.cursoPlazos = datos.universidades.map((u) => leerPlazos(u)?.curso).find(Boolean) || null;
  indice.hayBecas = datos.universidades.some((u) => leerBecas(u).length > 0);
  indice.presupuestos = new Map(
    datos.comunidades.map((c) => [c.id, presupuestoAnual(c, datos.precios.sinPublicar.includes(c.id))]).filter(([, p]) => p)
  );
  const totales = [...indice.presupuestos.values()].map((p) => p.total);
  indice.limitesPresupuesto = totales.length
    ? { min: Math.floor(Math.min(...totales) / 500) * 500, max: Math.ceil(Math.max(...totales) / 500) * 500 + 500, paso: 500 }
    : null;
  return indice;
}

const ORDEN_TIPO = { ciudad: 0, comunidad: 1, universidad: 2 };

function puntuar(entrada, q) {
  if (entrada.sigla && entrada.sigla === q) return 0;
  const titulo = normalizar(entrada.titulo);
  if (titulo === q) return 1;
  if (titulo.startsWith(q)) return 2;
  if (entrada.clave.split(" ").some((w) => w.startsWith(q))) return 3;
  return 4;
}

/** Autocompletado: universidades, ciudades y comunidades que contienen todas las palabras. */
export function buscar(indice, consulta, max = 8) {
  const q = normalizar(consulta);
  if (q.length < 2) return [];
  const palabras = q.split(" ");
  return indice.busqueda
    .filter((e) => palabras.every((p) => e.clave.includes(p)))
    .map((e) => ({ e, p: puntuar(e, q) * 10 + ORDEN_TIPO[e.tipo] }))
    .sort((a, b) => a.p - b.p || a.e.titulo.localeCompare(b.e.titulo, "es"))
    .slice(0, max)
    .map((x) => x.e);
}

export const masteresDe = (entidad, rama) => (rama ? entidad?.ramas?.[rama] || 0 : entidad?.masteres || 0);

/* ── Ranking QS ─────────────────────────────────────────────────────── */

// Filtro «Ranking QS»: tope de puesto de cada opción («con» = cualquier puesto).
export const RANKING_TOPES = { top200: 200, top500: 500, top1000: 1000, con: Infinity };

/**
 * Puesto numérico con el que se filtra y se ordena. QS publica «=165»
 * (empate), «851-900» (banda) o «1401+»: se toma el límite inferior.
 * Sin ranking, null.
 */
export function posicionRanking(u) {
  const pos = u?.ranking?.posicion;
  if (pos == null || !u?.ranking?.fuente) return null;
  const m = String(pos).replace(/\./g, "").match(/\d+/);
  return m ? Number(m[0]) : null;
}

/** El filtro de ranking solo se ofrece si alguna universidad lo trae. */
export const hayRanking = (indice) => indice.datos.universidades.some((u) => posicionRanking(u) != null);

/**
 * Orden de una lista de universidades: «ranking» pone primero las que tienen
 * mejor puesto (las que no aparecen en QS, al final); si no, más másteres
 * primero. En empate, más másteres.
 */
export function ordenarUniversidades(unis, orden, rama) {
  const porMasteres = (a, b) => masteresDe(b, rama) - masteresDe(a, rama) || a.nombre.localeCompare(b.nombre, "es");
  if (orden !== "ranking") return [...unis].sort(porMasteres);
  return [...unis].sort((a, b) => {
    const pa = posicionRanking(a);
    const pb = posicionRanking(b);
    if (pa == null && pb == null) return porMasteres(a, b);
    if (pa == null) return 1;
    if (pb == null) return -1;
    return pa - pb || porMasteres(a, b);
  });
}

/** La universidad con mejor puesto entre unos ids (o null). */
export function mejorRanking(indice, ids = []) {
  let mejor = null;
  for (const id of ids) {
    const u = indice.universidades.get(id);
    const p = posicionRanking(u);
    if (p != null && (!mejor || p < mejor.posicion)) mejor = { u, posicion: p };
  }
  return mejor;
}

/** «Pública» / «Privada» → «publica» / «privada»; sin dato, null. */
export function claveTitularidad(u) {
  const t = normalizar(u?.titularidad);
  return t === "publica" || t === "privada" ? t : null;
}

/** El filtro de titularidad solo se ofrece si la API trae ese dato. */
export const hayTitularidad = (indice) => indice.datos.universidades.some((u) => claveTitularidad(u));

/**
 * Qué cumple los filtros. Una universidad cumple si su comunidad está en las
 * listas elegidas, si es de la titularidad pedida, si tiene al menos un máster
 * oficial de la rama, si su puesto en QS entra en el tope pedido y si su
 * precio aproximado por año (o, sin él, la matrícula orientativa de su
 * comunidad) no pasa del máximo. Una comunidad o una ciudad cumplen si alguna
 * de sus universidades cumple.
 */
export function aplicarFiltros(
  indice,
  { listas = [], rama = null, max = null, titularidad = null, ranking = null, abre = null, becas = false, presupuesto = null } = {}
) {
  const activos = listas.length > 0 || !!rama || max != null || !!titularidad || !!ranking || !!abre || !!becas || presupuesto != null;
  const tope = abre ? topeAbre(ABRE_MESES[abre], indice.cursoPlazos) : null;
  const universidades = new Set();
  let masteres = 0;

  for (const u of indice.datos.universidades) {
    if (listas.length && !listas.includes(u.lista)) continue;
    if (titularidad && claveTitularidad(u) !== titularidad) continue;
    if (rama && !(masteresDe(u, rama) > 0)) continue;
    if (ranking) {
      const p = posicionRanking(u);
      if (p == null || p > (RANKING_TOPES[ranking] ?? Infinity)) continue;
    }
    if (tope) {
      // Las fechas son «AAAA-MM-DD»: se comparan como texto.
      const inicio = leerPlazos(u)?.proxima?.inicio;
      if (!inicio || inicio >= tope) continue;
    }
    if (becas && !leerBecas(u).length) continue;
    if (presupuesto != null) {
      const p = indice.presupuestos?.get(u.comunidad);
      if (!p || p.total > presupuesto) continue;
    }
    if (max != null) {
      const precio = precioParaFiltro(indice, u);
      if (precio == null || precio > max) continue;
    }
    universidades.add(u.id);
    masteres += masteresDe(u, rama);
  }

  const comunidades = new Set([...universidades].map((id) => indice.universidades.get(id).comunidad));
  const ciudades = new Set(
    indice.datos.ciudades
      .filter((c) => [...c.universidades, ...c.campus].some((id) => universidades.has(id)))
      .map((c) => c.id)
  );
  // Comunidades sin ninguna cifra con la que filtrar: el filtro de precio las deja fuera.
  const sinCifra =
    max == null
      ? []
      : indice.datos.comunidades
          .filter(
            (c) =>
              (!listas.length || listas.includes(c.lista)) &&
              c.universidadesIds.every((id) => precioParaFiltro(indice, indice.universidades.get(id)) == null)
          )
          .map((c) => c.nombre);

  // Comunidades sin presupuesto con el que sumar: el filtro de presupuesto las deja fuera.
  const sinPresupuesto =
    presupuesto == null
      ? []
      : indice.datos.comunidades
          .filter((c) => (!listas.length || listas.includes(c.lista)) && !indice.presupuestos?.has(c.id))
          .map((c) => c.nombre);

  return { activos, rama, ranking, abre, becas, presupuesto, universidades, comunidades, ciudades, masteres, sinCifra, sinPresupuesto };
}

/** Ramas con másteres, de más a menos; «sin rama asignada» siempre al final. */
export function ramasOrdenadas(conteo, ramas) {
  return ramas
    .map((r) => ({ ...r, n: conteo?.[r.id] || 0 }))
    .filter((r) => r.n > 0)
    .sort((a, b) => (a.id === SIN_RAMA) - (b.id === SIN_RAMA) || b.n - a.n);
}

export const ramaPrincipal = (conteo, ramas) => ramasOrdenadas(conteo, ramas).find((r) => r.id !== SIN_RAMA) || null;

export const nombreRama = (indice, id) => indice.ramas.find((r) => r.id === id)?.nombre || "";

/** Casos de éxito de config/casos.js con la ciudad del mapa en la que se pintan. */
export function casosEnMapa(indice, casos) {
  const porNombre = new Map(indice.datos.ciudades.map((c) => [normalizar(c.nombre), c]));
  return casos
    .map((caso) => {
      const ciudad = porNombre.get(normalizar(caso.ciudad));
      return ciudad ? { ...caso, ciudadId: ciudad.id, comunidadId: ciudad.comunidad } : null;
    })
    .filter(Boolean);
}
