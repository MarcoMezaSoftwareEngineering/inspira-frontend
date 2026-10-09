// src/pages/backoffice/panel-asesoras/partes/constantes.js
// Constantes del Panel asesoras (salieron de PanelAsesoras.jsx el 09/10/2026).

/* ─── Constantes ─────────────────────────────────────────────────────────── */
export const SVC_KEYS = ["master", "visa", "ee", "fp", "legal", "doc"];
export const SVC_LABELS = { master: "Máster", visa: "Visa estudios", ee: "Estancia est.",
  mod: "Modificatoria", fp: "FP / Grado", legal: "Legal / RR", doc: "Doctorado" };
export const TABS = [{ id: "all", label: "Todos" }, ...SVC_KEYS.map(s => ({ id: s, label: SVC_LABELS[s] }))];
export const FASES_VE = ["Estrategia realizada", "Preparación documentaria", "Cita programada", "Documentos listos"];
export const UNI_EST = ["ADMITIDO","LISTA DE ESPERA ALTA","LISTA DE ESPERA MEDIA","LISTA DE ESPERA BAJA","POSTULADO","POSTULAR","NO POSTULAR AUN","PROCESO PREVIO","PENDIENTE","EXCLUIDO","FINALIZADO"];
export const ESTADOS = ["ACTIVO","NO_ACTIVO","ACTIVAR"];
export const PAGE_SIZE = 15;

export const SVC_COLORS = {
  master: { bg: "#EEEDFE", text: "#3C3489" },
  visa:   { bg: "#E6F1FB", text: "#0C447C" },
  ee:     { bg: "#E1F5EE", text: "#085041" },
  fp:     { bg: "#FAEEDA", text: "#633806" },
  legal:  { bg: "#FBEAF0", text: "#72243E" },
  doc:    { bg: "#E6F4F6", text: "#0E5E6B" },
};
