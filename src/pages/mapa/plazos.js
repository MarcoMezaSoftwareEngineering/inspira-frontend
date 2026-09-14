// src/pages/mapa/plazos.js
// Plazos de postulación por universidad (`universidad.plazos` en GET /api/mapa):
//   { curso: "2027-2028", fases: [{ nombre, inicio, fin }], proxima: { nombre, inicio, fin } | null }
// Fechas «AAAA-MM-DD». Se formatean desde el texto, sin new Date(iso): así un
// huso horario no mueve el día. Siempre se publican como fechas estimadas.

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const ISO = /^(\d{4})-(\d{2})-(\d{2})/;

function partes(iso) {
  const m = ISO.exec(String(iso || ""));
  if (!m) return null;
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31 ? { a: m[1], m: mes, d: dia } : null;
}

/** «2027-01-13» → «13 ene 2027». */
export function fechaCorta(iso) {
  const p = partes(iso);
  return p ? `${p.d} ${MESES[p.m - 1]} ${p.a}` : null;
}

/** «13–29 ene 2027», «20 ene – 5 feb 2027» o «15 dic 2026 – 10 ene 2027». */
export function rangoFechas(inicio, fin) {
  const a = partes(inicio);
  const b = partes(fin);
  if (!a && !b) return null;
  if (!b) return `desde el ${fechaCorta(inicio)}`;
  if (!a) return `hasta el ${fechaCorta(fin)}`;
  if (a.a === b.a && a.m === b.m) return a.d === b.d ? fechaCorta(inicio) : `${a.d}–${b.d} ${MESES[a.m - 1]} ${a.a}`;
  if (a.a === b.a) return `${a.d} ${MESES[a.m - 1]} – ${b.d} ${MESES[b.m - 1]} ${a.a}`;
  return `${fechaCorta(inicio)} – ${fechaCorta(fin)}`;
}

/** «2027-2028» → «2027/28». */
export const cursoCorto = (curso) => String(curso || "").replace(/^(\d{4})-\d{2}(\d{2})$/, "$1/$2");

function leerFase(f) {
  if (!f || typeof f !== "object") return null;
  const inicio = partes(f.inicio) ? String(f.inicio).slice(0, 10) : null;
  const fin = partes(f.fin) ? String(f.fin).slice(0, 10) : null;
  if (!inicio && !fin) return null;
  return { nombre: String(f.nombre || "").trim() || "Plazo", inicio, fin };
}

/** Plazos normalizados de una universidad; null si no trae ninguna fecha. */
export function leerPlazos(u) {
  const p = u?.plazos;
  if (!p || typeof p !== "object") return null;
  const fases = (Array.isArray(p.fases) ? p.fases : []).map(leerFase).filter(Boolean);
  const proxima = leerFase(p.proxima);
  if (!fases.length && !proxima) return null;
  return { curso: p.curso ? String(p.curso) : null, fases, proxima };
}

/** Entre varias universidades, la próxima fase que abre antes: { u, fase, curso } o null. */
export function plazoMasTemprano(unis) {
  let mejor = null;
  for (const u of unis) {
    const p = leerPlazos(u);
    const f = p?.proxima;
    const orden = f?.inicio || f?.fin;
    if (!orden) continue;
    if (!mejor || orden < (mejor.fase.inicio || mejor.fase.fin)) mejor = { u, fase: f, curso: p.curso };
  }
  return mejor;
}

/** Tope del filtro «Abre antes de…»: día 1 del mes pedido en el primer año del curso. */
export function topeAbre(mes, curso) {
  const anio = Number(String(curso || "").slice(0, 4)) || 2027;
  return `${anio}-${String(mes).padStart(2, "0")}-01`;
}
