// src/pages/mapa/mapaTextos.js
// Textos, formato y SEO del «Mapa para estudiar en España»
// (/mapa-estudiar-en-espana).
//
// Ningún importe se escribe aquí: la matrícula y los planes llegan de
// GET /api/mapa, que los saca de la tabla de matrícula ya publicada y del
// catálogo de precios del backend.
//
// Reglas de contenido:
// - Las listas 2027/2028 se presentan tal cual, sin compararlas con otros cursos.
// - No se promete admisión.
// - El asesorado no accede al catálogo de másteres: aquí solo hay recuentos.
import { eur, numero, rangoEur, SESION_PRECIOS } from "../../config/paqueteMaster2027Resumen";

export { eur, numero };

export const RUTA = "/mapa-estudiar-en-espana";

// Mismos textos que scripts/rutas-compartir.mjs (vista previa al compartir).
export const SEO = {
  title: "Mapa para estudiar en España: comunidades, ciudades y universidades",
  description:
    "Mapa interactivo de las comunidades, ciudades y universidades españolas con másteres oficiales: matrícula orientativa, cómo se postula en cada una y el plan de Inspira que las cubre.",
  path: RUTA,
  imagen: "/og/inspira-general.jpg",
};

export const HERO = {
  etiqueta: "Mapa interactivo",
  icono: "mapa",
  titulo: "Mapa para estudiar",
  destacado: "en España",
  descripcion:
    "Comunidades, ciudades y universidades con másteres oficiales: cuánto cuesta la matrícula, cómo se postula en cada una y qué plan de Inspira la cubre.",
  accesos: [
    { icono: "euro", label: "Calculadora de costos", href: "/calculadora-master" },
    { icono: "birrete", label: "Paquete Máster 2027/2028", href: "/servicios/master" },
    { icono: "estrella", label: "Casos de éxito", href: "/casos-de-exito" },
  ],
};

export const SESION = `Reservar sesión diagnóstico · ${eur(SESION_PRECIOS.eur)}`;

export const plural = (n, uno, varios) => `${numero(n)} ${n === 1 ? uno : varios}`;
export const mayus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const etiquetaLista = (lista) => (lista ? `Lista ${lista.numero} · ${lista.nombre}` : "Fuera de las listas");

/** «821 €», «591–836 €*», «desde 2.227 €*» o «lo fija cada universidad». */
export function importeMatricula(m) {
  if (!m) return "sin dato";
  if (m.cadaUniversidad) return "lo fija cada universidad";
  const base = m.max ? rangoEur(m.min, m.max) : eur(m.min);
  return `${m.desde ? "desde " : ""}${base}${m.puedeVariar ? "*" : ""}`;
}

export function notasMatricula(m) {
  if (!m) return [];
  const notas = [];
  if (m.segunRama) notas.push("Varía según la rama del máster.");
  if (m.puedeVariar) notas.push("* La universidad puede fijar otro precio para no residentes extracomunitarios.");
  if (m.cadaUniversidad) {
    notas.push("La norma autonómica fija el precio del residente; el del estudiante extracomunitario lo fija cada universidad.");
  }
  notas.push(m.norma ? `Norma: ${m.norma}.` : "Norma en verificación.");
  return notas;
}

/**
 * «QS World University Rankings 2027 · puesto 171». Un ranking sin su fuente
 * no se publica; si la universidad no aparece en él, no se pinta nada.
 * Posiciones como las publica QS: «=165» (empate), «701-710» (banda), «1401+».
 */
export function textoRanking(r) {
  if (!r || !r.fuente) return null;
  const nombre = [r.fuente, r.edicion].filter(Boolean).join(" ");
  const pos = r.posicion == null ? "" : String(r.posicion).trim();
  if (pos) {
    if (/^\d+$/.test(pos)) return `${nombre} · puesto ${numero(Number(pos))}`;
    if (pos.startsWith("=")) return `${nombre} · puesto ${pos.slice(1)} (empatado)`;
    if (pos.includes("-")) return `${nombre} · puestos ${pos.replace("-", "–")}`;
    return `${nombre} · puesto ${pos}`;
  }
  return r.texto ? `${nombre} · ${r.texto}` : null;
}

// Precio aproximado de un máster por año (lo calcula la API por universidad y
// por comunidad). Siempre con su etiqueta: es una referencia, no un precio.
export const PRECIO = {
  titulo: "¿Cuánto cuesta un máster aquí?",
  etiqueta: "Aproximado por año · puede variar por máster y universidad",
  habitual: "lo habitual",
  confianzaBaja: "Pocos másteres con precio publicado: tómalo solo como referencia.",
  ejemplos: "Ejemplos",
  deLaComunidad: (nombre) => `Referencia de ${nombre}: esta universidad aún no tiene precio propio cargado.`,
  // Comunidades en `precios.sinPublicar` de la API (Cataluña).
  sinPublicar: "La matrícula la fija cada universidad",
  sinPublicarDetalle: "Aquí no damos precios de ejemplo: cada universidad fija el importe del estudiante extracomunitario. Te lo concretamos para tu máster.",
};

// Filtro por titularidad («Pública» / «Privada», dato del RUCT que da la API).
export const TITULARIDAD = {
  etiqueta: "Titularidad",
  todas: "Públicas y privadas",
  opciones: [
    { id: "publica", nombre: "Solo públicas" },
    { id: "privada", nombre: "Solo privadas" },
  ],
};

export const T = {
  cargando: "Cargando el mapa…",
  errorTitulo: "No pudimos cargar el mapa",
  errorTexto: "Puede ser un corte de conexión o que el servidor esté ocupado. Vuelve a intentarlo en un momento.",
  reintentar: "Reintentar",
  errorWhatsapp: "El mapa no me cargó y quiero orientación para elegir dónde estudiar.",

  ariaMapa:
    "Mapa de España por comunidades autónomas, coloreadas por lista. Las burbujas son ciudades con universidades; las estrellas, casos de éxito.",
  todaEspana: "Ver toda España",
  canarias: "Canarias",
  fuera: "Fuera de las listas",
  noCumple: "No cumple los filtros",

  buscar: "Busca una universidad o una ciudad",
  buscarVacio: "Sin resultados. Prueba con la sigla (UGR) o con la ciudad.",
  tipoBusqueda: { universidad: "Universidad", ciudad: "Ciudad", comunidad: "Comunidad" },
  filtroListas: "Filtrar por lista",
  filtroRama: "Rama de conocimiento",
  todasRamas: "Todas las ramas",
  filtroMatricula: "Matrícula máxima",
  sinLimite: "Sin límite",
  limpiar: "Quitar filtros",
  capaCiudades: "Ciudades",
  capaCasos: "Casos de éxito",
  verComparador: "Ver comparador",

  leyendaBurbuja: "Ciudad: el tamaño es su número de másteres oficiales",
  leyendaCampus: "Campus (los másteres se cuentan en la sede principal)",
  leyendaCaso: "Caso de éxito real",

  comparar: "Comparar",
  quitarComparar: "Quitar",
  comparadorLleno: "Ya hay 3",
  calculadora: "Calcular costos",
  webOficial: "Web oficial de sus másteres",
  verPlanes: "Ver qué incluye cada plan",
  descargo: "Datos orientativos. La admisión la decide cada universidad.",
  planCubre: "Cubre la asesoría y la gestión de Inspira. La matrícula y las tasas se pagan aparte a cada organismo.",

  comparadorAhoraComunidades: "El comparador ahora compara comunidades: no se mezclan con universidades.",
  comparadorAhoraUniversidades: "El comparador ahora compara universidades: no se mezclan con comunidades.",
};

export const PIE = {
  matricula: "Matrícula orientativa según la norma de cada comunidad para extracomunitarios; la fija cada universidad.",
  geografia: "Geografía: Natural Earth (dominio público).",
  admision: "La admisión la decide cada universidad: Inspira no garantiza la admisión, el visado ni la beca.",
};

export const CTA = {
  titulo: "¿Ya tienes en mente dónde estudiar?",
  texto:
    "En la sesión diagnóstico revisamos tu perfil con un abogado especialista y te decimos en qué comunidades y universidades tiene sentido postular. Sales con un plan escrito.",
  whatsapp: "Escríbenos por WhatsApp",
  whatsappDetalle: "Estuve viendo el mapa y quiero orientación para elegir dónde postular.",
};
