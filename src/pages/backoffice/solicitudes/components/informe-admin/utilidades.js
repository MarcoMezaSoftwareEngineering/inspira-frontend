// Utilidades puras del informe de compatibilidad (InformeAdmin). Salieron de
// InformeAdmin.jsx al partirlo en piezas (09/10/2026).

// ── Helpers ───────────────────────────────────────────────────────────────────

export function scoreColor(s) {
  if (s == null) return "text-neutral-400";
  if (s >= 80) return "text-emerald-600";
  if (s >= 60) return "text-amber-600";
  return "text-red-500";
}

export function scoreStroke(s) {
  if (s == null) return "#e5e7eb";
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#f59e0b";
  return "#ef4444";
}

export function scoreChip(s) {
  if (s == null) return "bg-neutral-100 text-neutral-500 border-neutral-200";
  if (s >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-600 border-red-200";
}

export function durLabel(anios) {
  if (anios === 1) return "1 año";
  if (anios === 1.5) return "18 meses";
  if (anios) return `${anios} años`;
  return null;
}

export const sinAcentos = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// El filtro del panel de «los que no entraron»: por nombre, universidad,
// comunidad o con qué coincide, sin acentos ni mayúsculas.
export const filtrarRelacionados = (items, q) => {
  const t = sinAcentos(q).trim();
  if (!t) return items;
  return items.filter((r) => sinAcentos([
    r.master?.nombre_limpio,
    r.master?.universidad?.sigla,
    r.master?.universidad?.nombre_completo,
    r.master?.universidad?.comunidad?.nombre ?? r.master?.universidad?.comunidad,
    r.master?.coincide_con,
  ].join(" ")).includes(t));
};
