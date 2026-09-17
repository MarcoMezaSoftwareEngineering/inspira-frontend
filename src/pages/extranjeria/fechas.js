// src/pages/extranjeria/fechas.js
// Datos y cálculos de «¿Por qué fecha va Extranjería?».
//
// La lista de oficinas NO se escribe aquí: viene entera de
// GET /api/extranjeria/fechas. Cuando otra subdelegación empiece a publicar
// sus fechas, el equipo la da de alta en Core y aparece sola en la página
// (encargo de la clienta, 17/09/2026). Este archivo solo sabe leer la
// respuesta, agruparla por familias y hacer las cuentas del calendario.
//
// Dos fechas que NO son lo mismo y que en la competencia se confunden:
//   · fecha_dato      → a qué día se refiere el folleto oficial de la oficina.
//   · actualizado_en  → cuándo lo cargamos nosotros en Core.
// Se leen y se enseñan por separado.

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

/** Orden y rótulos de las tres fases. El orden es el del expediente real. */
export const FASES = [
  {
    id: "grabacion",
    etiqueta: "Grabación",
    // Lo que significa de verdad, en cristiano.
    explicacion: "Tu solicitud entra en el sistema y ya tiene número de expediente.",
  },
  {
    id: "instruccion",
    etiqueta: "Instrucción",
    explicacion: "Un instructor la estudia, comprueba requisitos y puede pedirte papeles.",
  },
  {
    id: "resolucion",
    etiqueta: "Resolución",
    explicacion: "Sale la decisión: concedida, denegada o archivada.",
  },
];

export const GRUPOS = [
  {
    id: "solicitudes",
    etiqueta: "Solicitudes",
    icono: "documento",
    intro: "Autorizaciones que se piden por primera vez o se renuevan.",
  },
  {
    id: "recursos",
    etiqueta: "Recursos",
    icono: "balanza",
    intro: "Lo presentado contra una resolución anterior: reposición y alzada.",
  },
];

/** Familia a la que va lo que llega sin clasificar. */
export const FAMILIA_OTROS = "Otros trámites";

const ordenFase = (id) => {
  const i = FASES.findIndex((f) => f.id === id);
  return i === -1 ? FASES.length : i;
};

const esFecha = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

/* ── Peticiones ──────────────────────────────────────────────────────── */

/**
 * Pide las fechas a la API.
 *
 * Aborta a los 15 s: si el servidor tarda, preferimos enseñar el aviso con los
 * enlaces oficiales antes que dejar el esqueleto girando sin fin.
 */
export async function pedirFechas() {
  const j = await pedirJson("/api/extranjeria/fechas", 15000);
  if (!j?.ok || !Array.isArray(j.oficinas)) throw new Error(j?.msg || "respuesta inesperada");
  return {
    actualizado: j.actualizado || null,
    aviso: typeof j.aviso === "string" ? j.aviso : "",
    oficinas: j.oficinas.map(normalizarOficina),
  };
}

/**
 * Histórico de una oficina. Es un extra: si el endpoint aún no existe, si
 * falla o si devuelve algo que no sabemos leer, se devuelve null y la página
 * simplemente no enseña el bloque de evolución.
 */
export async function pedirHistorial(oficinaId) {
  try {
    const j = await pedirJson(
      `/api/extranjeria/fechas/historial?oficina=${encodeURIComponent(oficinaId)}`,
      10000,
    );
    const bruto = j?.historial || j?.registros || j?.puntos || (Array.isArray(j) ? j : null);
    if (!Array.isArray(bruto) || bruto.length === 0) return null;
    return normalizarHistorial(bruto);
  } catch {
    return null;
  }
}

async function pedirJson(ruta, ms) {
  const control = new AbortController();
  const tope = setTimeout(() => control.abort(), ms);
  try {
    const r = await fetch(`${API_URL}${ruta}`, {
      signal: control.signal,
      headers: { Accept: "application/json" },
    });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.msg || `HTTP ${r.status}`);
    return j;
  } finally {
    clearTimeout(tope);
  }
}

/* ── Normalización ───────────────────────────────────────────────────── */

/** Deja cada oficina con sus trámites agrupados por grupo y familia. */
function normalizarOficina(o, i) {
  const tramites = Array.isArray(o?.tramites) ? o.tramites : [];
  const limpios = tramites
    .filter((t) => t && t.tramite)
    .map((t, j) => ({
      id: t.id || `${o?.id || i}-${j}`,
      grupo: t.grupo === "recursos" ? "recursos" : "solicitudes",
      familia: String(t.familia || "").trim() || FAMILIA_OTROS,
      tramite: String(t.tramite),
      fase: t.fase || null,
      fecha: esFecha(t.fecha) ? t.fecha : null,
      texto: t.texto || "",
      nota: t.nota || "",
      // Día al que se refiere el folleto oficial de esta fila, si la API lo
      // detalla por trámite; si no, manda el de la oficina.
      fecha_dato: t.fecha_dato || null,
      actualizado_en: t.actualizado_en || null,
    }))
    .sort(
      (a, b) =>
        a.familia.localeCompare(b.familia, "es") ||
        a.tramite.localeCompare(b.tramite, "es") ||
        ordenFase(a.fase) - ordenFase(b.fase),
    );

  return {
    id: o?.id || `oficina-${i}`,
    nombre: o?.nombre || o?.provincia || "Oficina de Extranjería",
    provincia: o?.provincia || "",
    comunidad: o?.comunidad || "",
    fuente_url: o?.fuente_url || "",
    fuente_nombre: o?.fuente_nombre || "Publicación oficial de la oficina",
    nota: o?.nota || "",
    // Día del folleto oficial. Si la API no lo trae a nivel de oficina, se
    // toma el más reciente de sus filas: es el dato de referencia real.
    fecha_dato: o?.fecha_dato || masReciente(limpios.map((t) => t.fecha_dato)),
    actualizado_en: o?.actualizado_en || null,
    tramites: limpios,
    // «Aún no publicado»: la oficina está dada de alta pero ninguna de sus
    // filas trae fecha todavía.
    publicada: limpios.some((t) => t.fecha),
  };
}

/** Puntos del histórico que sepamos leer, ordenados del más viejo al más nuevo. */
function normalizarHistorial(bruto) {
  const puntos = bruto
    .map((p) => {
      const cuando = primeraFecha([p?.fecha_dato, p?.capturado_en, p?.actualizado_en, p?.en, p?.dia]);
      const iban = primeraFecha([p?.fecha, p?.resolviendo_hasta, p?.hasta]);
      if (!cuando || !iban) return null;
      return {
        cuando,
        iban,
        fase: p?.fase || null,
        grupo: p?.grupo || null,
        tramite: p?.tramite || null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.cuando < b.cuando ? -1 : 1));
  return puntos.length >= 2 ? puntos : null;
}

/** El primero de la lista que sea una fecha ISO o un instante legible. */
function primeraFecha(valores) {
  for (const v of valores) {
    if (esFecha(v)) return v;
    if (typeof v === "string" && v.length >= 10) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) {
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      }
    }
  }
  return null;
}

const masReciente = (lista) => {
  const validas = lista.filter(esFecha).sort();
  return validas.length ? validas[validas.length - 1] : null;
};

/* ── Agrupación y búsqueda ───────────────────────────────────────────── */

/**
 * Filas de un grupo, repartidas por familia y filtradas por el buscador.
 * Devuelve [] si no queda nada: quien llama decide qué enseñar entonces.
 */
export function familiasDe(oficina, grupoId, consulta = "") {
  const q = normalizar(consulta);
  const filas = (oficina?.tramites || []).filter(
    (t) => t.grupo === grupoId && (!q || coincide(t, q)),
  );
  const mapa = new Map();
  for (const f of filas) {
    if (!mapa.has(f.familia)) mapa.set(f.familia, []);
    mapa.get(f.familia).push(f);
  }
  return [...mapa.entries()]
    .map(([familia, lista]) => ({ familia, filas: lista }))
    .sort((a, b) => {
      // «Otros trámites» siempre al final: es el cajón de lo que no encaja.
      if (a.familia === FAMILIA_OTROS) return 1;
      if (b.familia === FAMILIA_OTROS) return -1;
      return a.familia.localeCompare(b.familia, "es");
    });
}

/** Sin acentos ni mayúsculas: se busca «dana» y encuentra «DANA». */
export const normalizar = (t) =>
  String(t || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const coincide = (t, q) =>
  normalizar(t.tramite).includes(q) ||
  normalizar(t.familia).includes(q) ||
  normalizar(t.texto).includes(q);

/** Cuántas filas de esta oficina pasan el filtro del buscador. */
export function cuentaCoincidencias(oficina, consulta) {
  const q = normalizar(consulta);
  if (!q) return (oficina?.tramites || []).length;
  return (oficina?.tramites || []).filter((t) => coincide(t, q)).length;
}

/* ── Fechas ──────────────────────────────────────────────────────────── */

/** "2026-03-12" → objeto Date local (sin saltos de zona horaria). */
export function aFecha(iso) {
  if (!esFecha(iso)) return null;
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

const FORMATO_LARGO = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" });
const FORMATO_MES = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" });

/** "2026-03-12" → "12 de marzo de 2026". */
export function fechaLarga(iso) {
  const d = aFecha(iso);
  return d ? FORMATO_LARGO.format(d) : "";
}

/** "2026-03-12" → "marzo de 2026". */
export function mesAnio(iso) {
  const d = aFecha(iso);
  return d ? FORMATO_MES.format(d) : "";
}

/** Fecha que llega como ISO completo o como día suelto. */
export function fechaDeActualizacion(valor) {
  if (!valor) return "";
  if (esFecha(valor)) return fechaLarga(valor);
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : FORMATO_LARGO.format(d);
}

/** Hoy, en "YYYY-MM-DD" local: sirve de tope del <input type="date">. */
export function hoyISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Meses y días entre dos fechas (b - a). `signo` es 1 si b es posterior.
 *
 * Se cuenta por meses de calendario y no dividiendo días entre 30: lo que la
 * oficina publica avanza mes a mes, y «los expedientes de marzo» es la unidad
 * con la que trabaja Extranjería.
 */
export function distancia(isoA, isoB) {
  const a = aFecha(isoA);
  const b = aFecha(isoB);
  if (!a || !b) return null;
  const signo = b >= a ? 1 : -1;
  const [ini, fin] = signo === 1 ? [a, b] : [b, a];
  let meses = (fin.getFullYear() - ini.getFullYear()) * 12 + (fin.getMonth() - ini.getMonth());
  let dias = fin.getDate() - ini.getDate();
  if (dias < 0) {
    meses -= 1;
    dias += new Date(fin.getFullYear(), fin.getMonth(), 0).getDate();
  }
  return { signo, meses, dias, totalMeses: meses + dias / 30 };
}

/** «unos 6 meses», «algo más de un mes», «12 días». */
export function textoDistancia(d) {
  if (!d) return "";
  const { meses, dias } = d;
  if (meses === 0 && dias === 0) return "justo esa fecha";
  if (meses === 0) return dias === 1 ? "un día" : `${dias} días`;
  const base = meses === 1 ? "un mes" : `${meses} meses`;
  if (dias === 0) return base;
  if (dias <= 10) return `algo más de ${base}`;
  return `cerca de ${meses + 1} meses`;
}

/* ── Histórico: una frase, no un gráfico ─────────────────────────────── */

/**
 * Compara el punto más antiguo con el más reciente y devuelve lo necesario
 * para escribir «hace tres meses iban por marzo; ahora, por mayo».
 * Devuelve null si los dos puntos son del mismo día o falta algo.
 */
export function resumenHistorial(puntos) {
  if (!Array.isArray(puntos) || puntos.length < 2) return null;
  const viejo = puntos[0];
  const nuevo = puntos[puntos.length - 1];
  const haceCuanto = distancia(viejo.cuando, nuevo.cuando);
  if (!haceCuanto || (haceCuanto.meses === 0 && haceCuanto.dias === 0)) return null;
  const avance = distancia(viejo.iban, nuevo.iban);
  return {
    antes: viejo.iban,
    ahora: nuevo.iban,
    hace: haceCuanto,
    // signo 1 = la fecha publicada avanzó (van por expedientes más nuevos).
    avanzo: avance ? avance.signo === 1 && !(avance.meses === 0 && avance.dias === 0) : false,
    avance,
  };
}

/** ["Madrid","Valencia","Mallorca"] → "Madrid, Valencia y Mallorca". */
export function enumerar(lista) {
  const l = lista.filter(Boolean);
  if (l.length === 0) return "";
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(", ")} y ${l[l.length - 1]}`;
}

/**
 * Nombre corto de la oficina para las frases seguidas («Madrid, Valencia y
 * Mallorca»). Quita los prefijos administrativos que se repiten en todas.
 */
export function nombreCorto(oficina) {
  const bruto = String(oficina?.nombre || oficina?.provincia || "").trim();
  const limpio = bruto
    .replace(/^(oficina|oficinas)\s+de\s+extranjer[ií]a\s+(de|en|del)\s+/i, "")
    .replace(/^subdelegaci[óo]n\s+del\s+gobierno\s+(de|en|del)\s+/i, "")
    .replace(/^delegaci[óo]n\s+del\s+gobierno\s+(de|en|del)\s+/i, "")
    .replace(/^extranjer[ií]a\s+(de|en|del)\s+/i, "")
    .trim();
  return limpio || oficina?.provincia || bruto;
}
