// Áreas, estados, prioridades y formatos compartidos por las tareas.
// Los valores coinciden con los de
// inspira-backend/src/modules/tareas/tareas.service.js.
import { Megaphone, TrendingUp, Briefcase, Layers, ClipboardList } from "lucide-react";

export { fechaHora, haceCuanto } from "../leads/leadsComun";

export const CATEGORIAS = [
  { valor: "REDES_MARKETING", etiqueta: "Redes y Marketing", corto: "Redes", color: "#7d3c98", tono: "morado", icono: Megaphone },
  { valor: "LEADS", etiqueta: "Leads", corto: "Leads", color: "#4e9ee8", tono: "cielo", icono: TrendingUp },
  { valor: "SERVICIOS", etiqueta: "Servicios", corto: "Servicios", color: "#02506b", tono: "petrol", icono: Briefcase },
  { valor: "SUBSERVICIOS", etiqueta: "Sub servicios", corto: "Sub servicios", color: "#1d6a4a", tono: "verde", icono: Layers },
  { valor: "GENERAL", etiqueta: "Pendientes generales", corto: "Generales", color: "#b9770e", tono: "ambar", icono: ClipboardList },
];
export const CATEGORIA = Object.fromEntries(CATEGORIAS.map((c) => [c.valor, c]));
export const CON_SERVICIO = new Set(["SERVICIOS", "SUBSERVICIOS"]);

export const ESTADOS = [
  { valor: "PENDIENTE", etiqueta: "Pendiente", color: "#4e9ee8", tono: "cielo" },
  { valor: "EN_CURSO", etiqueta: "En curso", color: "#fa943a", tono: "ambar" },
  { valor: "HECHA", etiqueta: "Hecha", color: "#1d6a4a", tono: "verde" },
  { valor: "DESCARTADA", etiqueta: "Descartada", color: "#8aa0ad", tono: "gris" },
];
export const ESTADO = Object.fromEntries(ESTADOS.map((e) => [e.valor, e]));

export const PRIORIDADES = [
  { valor: "BAJA", etiqueta: "Baja", tono: "gris" },
  { valor: "MEDIA", etiqueta: "Media", tono: "petrol" },
  { valor: "ALTA", etiqueta: "Alta", tono: "ambar" },
  { valor: "URGENTE", etiqueta: "Urgente", tono: "rojo" },
];
export const PRIORIDAD = Object.fromEntries(PRIORIDADES.map((p) => [p.valor, p]));

// Para las tarjetas, donde no cabe «Postulación a Máster».
export const SERVICIO_CORTO = {
  master: "Máster", visa: "Visado", ee: "Estancia", mod: "Modificatoria", fp: "FP / Grado", legal: "Extranjería",
};

/** «18 sept», para un día "YYYY-MM-DD". */
export function fechaDia(dia) {
  if (!dia) return "";
  return new Date(`${dia}T12:00:00`).toLocaleDateString("es-PE", { day: "numeric", month: "short" }).replace(".", "");
}

/** «vencida hace 3 d», «vence hoy», «mañana», «en 4 d» o la fecha. */
export function textoVence(t) {
  if (!t?.dia_vence) return "";
  if (!t.abierta || t.dias === null || t.dias === undefined) return fechaDia(t.dia_vence);
  if (t.dias < -1) return `vencida hace ${-t.dias} d`;
  if (t.dias === -1) return "venció ayer";
  if (t.dias === 0) return "vence hoy";
  if (t.dias === 1) return "mañana";
  if (t.dias < 7) return `en ${t.dias} d`;
  return fechaDia(t.dia_vence);
}

/** "YYYY-MM-DD" de hoy más `dias`, en la hora del navegador. */
export function diaDesdeHoy(dias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Avisa al contador del menú de que algo cambió en esta pestaña. */
export function avisarCambioTareas() {
  window.dispatchEvent(new Event("inspira:tareas-cambio"));
}
