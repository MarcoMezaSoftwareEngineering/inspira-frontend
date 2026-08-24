// src/pages/backoffice/checklist/checklistUtils.js
//
// Utilidades del buscador de servicios del checklist: agrupación por familia
// de plan, puntuación de búsqueda y etiquetas cortas. Los servicios vienen del
// backend sin metadatos de agrupación, así que se derivan del nombre.

/** Minúsculas sin tildes, para comparar sin importar acentos. */
export function normalizar(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export const FILTROS_SERVICIO = [
  { id: "all",     label: "Todos" },
  { id: "premium", label: "Premium" },
  { id: "basico",  label: "Básicos" },
  { id: "comfort", label: "Comfort" },
  { id: "full",    label: "Full económico" },
  { id: "otros",   label: "Otros" },
];

/** Familia (grupo visible) y filtro rápido de un servicio, según su nombre. */
export function metaServicio(servicio) {
  const n = normalizar(servicio?.nombre);
  const esPremium = n.includes("premium");

  if (n.startsWith("paquete")) return { grupo: "Planes avanzados", filtro: "premium" };
  if (n.startsWith("plan a"))  return { grupo: "Plan A",           filtro: esPremium ? "premium" : "otros" };
  if (n.startsWith("plan basico")) return { grupo: "Plan Básico",  filtro: "basico" };
  if (n.startsWith("plan comfort")) return { grupo: "Plan Comfort", filtro: "comfort" };
  if (n.startsWith("plan full")) return { grupo: "Full Económico",  filtro: "full" };
  if (n.startsWith("programa")) return { grupo: "Programa",         filtro: "otros" };
  if (n.startsWith("plan"))     return { grupo: "Otros planes",     filtro: esPremium ? "premium" : "otros" };
  return { grupo: "Otros servicios", filtro: "otros" };
}

/** Etiqueta corta que se muestra en el cuadradito de cada resultado. */
export function inicialServicio(servicio) {
  const n = normalizar(servicio?.nombre);
  if (n.startsWith("paquete")) return "PK";
  if (n.startsWith("plan")) return "PL";
  if (n.startsWith("programa")) return "360";
  if (n.startsWith("reservar")) return "CI";
  if (n.startsWith("visado")) return "VI";
  return servicio?.codigo || "—";
}

/**
 * Puntúa un servicio contra la búsqueda escrita.
 * Devuelve -1 si no coincide; a mayor puntuación, más arriba aparece.
 */
export function puntuarServicio(servicio, consulta, grupo = "") {
  const q = normalizar(consulta);
  if (!q) return 1;

  const terminos = q.split(/\s+/).filter(Boolean);
  const codigo = String(servicio.codigo || "");
  const pajar = normalizar(`${codigo} ${servicio.nombre} ${grupo} ${servicio.id_servicio}`);
  if (!terminos.every((t) => pajar.includes(t))) return -1;

  const nombre = normalizar(servicio.nombre);
  let puntos = 10;
  if (normalizar(codigo) === q || String(servicio.id_servicio) === q) puntos += 120;
  if (nombre === q) puntos += 100;
  if (nombre.startsWith(q)) puntos += 55;
  else if (nombre.includes(q)) puntos += 30;

  terminos.forEach((t) => {
    if (normalizar(codigo).startsWith(t)) puntos += 25;
    if (nombre.startsWith(t)) puntos += 12;
  });

  return puntos;
}

const CLAVE_RECIENTES = "bo_checklist_servicios_recientes";

export function leerRecientes() {
  try {
    const raw = localStorage.getItem(CLAVE_RECIENTES);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

export function guardarReciente(id) {
  const previos = leerRecientes().filter((x) => x !== id);
  const siguiente = [id, ...previos].slice(0, 4);
  try {
    localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(siguiente));
  } catch {
    /* localStorage no disponible: los recientes solo viven en memoria */
  }
  return siguiente;
}
