// src/utils/formatters.js — Funciones de formateo canónicas

// ── Fechas ────────────────────────────────────────────────────────────────────

export function fmtFecha(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export function fmtHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit", minute: "2-digit",
  });
}

export function fmtFechaHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-ES", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Precios ───────────────────────────────────────────────────────────────────

export function formatPrecio(val) {
  if (val == null || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  return n.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0 });
}

// ── Duración de másters ───────────────────────────────────────────────────────

// "1 año" / "1.5 años" / "2 años" — para catálogo y formularios
export function duracionLabel(anios) {
  if (!anios) return "—";
  const n = Number(anios);
  if (n === 1)   return "1 año";
  if (n === 1.5) return "1.5 años";
  return "2 años";
}

// "1 año" / "18 meses" / "N años" — para informes (nulo si sin dato)
export function durLabel(anios) {
  if (anios === 1)   return "1 año";
  if (anios === 1.5) return "18 meses";
  if (anios)         return `${anios} años`;
  return null;
}

// ── Scores de compatibilidad ───────────────────────────────────────────────────

// Retorna clases y colores según score (0-100)
export function scoreColors(score) {
  if (score == null) return {
    text:   "text-neutral-400",
    bar:    "#d1d5db",
    stroke: "#e5e7eb",
    tag:    "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  if (score >= 80) return {
    text:   "text-emerald-600",
    bar:    "#10b981",
    stroke: "#10b981",
    tag:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  if (score >= 60) return {
    text:   "text-amber-600",
    bar:    "#f59e0b",
    stroke: "#f59e0b",
    tag:    "bg-amber-50 text-amber-700 border-amber-200",
  };
  return {
    text:   "text-red-500",
    bar:    "#ef4444",
    stroke: "#ef4444",
    tag:    "bg-red-50 text-red-600 border-red-200",
  };
}

// Shorthands para código que solo necesita una propiedad
export const scoreColor  = (s) => scoreColors(s).text;
export const scoreStroke = (s) => scoreColors(s).stroke;
export const scoreChip   = (s) => scoreColors(s).tag;

// ── Texto ─────────────────────────────────────────────────────────────────────

// Normaliza texto para búsqueda: quita tildes, minúsculas, trim
export function norm(s) {
  if (!s) return "";
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// ── Archivos ──────────────────────────────────────────────────────────────────

export function formatBytes(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
