// src/pages/backoffice/panel-asesoras/partes/utilidades.js
// Ayudantes del Panel asesoras (salieron de PanelAsesoras.jsx el 09/10/2026).
import { dialog } from "../../../../services/dialogService";
import { FASES_VE } from "./constantes";

// El backoffice enruta por pathname + popstate (ver BackofficeApp.navigate).
export function irAExpediente(idSolicitud) {
  window.history.pushState({}, "", `/backoffice/solicitudes/${idSolicitud}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
export function estadoLabel(e) { return e === "NO_ACTIVO" ? "NO ACTIVO" : e; }
export function ini(name) { return (name || "?").split(" ").slice(0,2).map(w => w[0]).join("").toUpperCase(); }
export function miss(v) { return !v || !String(v).trim(); }
export function fv(v) { return miss(v) ? "—" : v; }
export function mkFases() { return FASES_VE.map(l => ({ label: l, done: false, pendiente: "" })); }
export function mkPagos() { return { tipo: "", total: "", pagadas: "", pendiente: "", cuotas: "" }; }

export function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

export async function copyValue(value, label) {
  if (miss(value)) return;
  try {
    await navigator.clipboard.writeText(String(value));
    dialog.toast(`${label} copiado`, "success");
  } catch {
    dialog.toast("No se pudo copiar", "error");
  }
}

export function estadoBadgeCls(e) {
  if (e === "ACTIVO")   return "bg-green-100 text-green-800";
  if (e === "ACTIVAR")  return "bg-amber-100 text-amber-800";
  return "bg-neutral-100 text-neutral-600";
}

export function uniEstCls(e) {
  if (e === "ADMITIDO") return "text-emerald-700 font-semibold";
  if (e?.includes("ESPERA")) return "text-amber-700";
  if (e === "POSTULADO" || e === "POSTULAR") return "text-blue-700";
  if (e === "EXCLUIDO") return "text-red-700";
  if (e === "NO POSTULAR AUN" || e === "NO_POSTULAR_AUN") return "text-neutral-400";
  return "text-neutral-500";
}

export function exportJSON(data) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  a.download = `inspira_panel_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

// Clave de fila: el mismo expediente puede estar en dos servicios.
export const keyFor = c => `${c._id}_${c._svc}`;
