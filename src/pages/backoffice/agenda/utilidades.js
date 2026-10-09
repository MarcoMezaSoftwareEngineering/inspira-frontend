// Utilidades puras de la Agenda (fechas, claves y estados). Salieron de
// Agenda.jsx al partirlo en piezas (09/10/2026); el código es el mismo, salvo
// el nombre del mes de rangeLabel, que ahora sale de los formatos compartidos.
import { mesCorto } from "../../../lib/formatos";
import { HOUR_START, PAGO_IMPLICITO_POR_ESTADO } from "./constantes";

export function getUserRole() {
  try { return JSON.parse(localStorage.getItem("bo_user") || "{}").rol || ""; }
  catch { return ""; }
}

/* ── Mi calendario ────────────────────────────────────────────── */

export function toISODate(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
export function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); r.setHours(0, 0, 0, 0); return r; }
export function startOfDay(d) { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; }
export function rowLabel(row) {
  const totalMin = HOUR_START * 60 + row * 30;
  return `${String(Math.floor(totalMin / 60)).padStart(2, "0")}:${String(totalMin % 60).padStart(2, "0")}`;
}
export function rangeLabel(weekDays) {
  const a = weekDays[0], b = weekDays[6];
  const mesA = mesCorto(a);
  const mesB = mesCorto(b);
  const anio = b.getFullYear();
  return mesA === mesB
    ? `${a.getDate()} – ${b.getDate()} de ${mesB} ${anio}`
    : `${a.getDate()} ${mesA} – ${b.getDate()} ${mesB} ${anio}`;
}

export function iniciales(nombre) {
  if (!nombre) return "?";
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] || "") + (partes[1]?.[0] || "")).toUpperCase();
}

export function pagoTone(estado) {
  return { APROBADO: "green", PENDIENTE: "amber", RECHAZADO: "red", REEMBOLSADO: "neutral" }[estado] || "neutral";
}
export function pagoEsRedundante(estadoReserva, pagoEstado) {
  return PAGO_IMPLICITO_POR_ESTADO[estadoReserva] === pagoEstado;
}

/* ── Reuniones (Calendly) ─────────────────────────────────────── */

export function toDateKey(date) { return date.toISOString().slice(0, 10); }
export function groupByDay(events) {
  const groups = {};
  events.forEach((ev) => {
    const key = toDateKey(new Date(ev.start_time));
    if (!groups[key]) groups[key] = [];
    groups[key].push(ev);
  });
  return groups;
}
