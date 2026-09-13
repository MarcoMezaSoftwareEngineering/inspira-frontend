// Etapas, orígenes y formatos compartidos por la bandeja de leads.
// Los valores coinciden con ETAPAS y ORIGENES de
// inspira-backend/src/modules/leads/leads.service.js.

export const ETAPAS = [
  { valor: "NUEVO", etiqueta: "Nuevo", color: "#4e9ee8", tono: "cielo" },
  { valor: "CONTACTADO", etiqueta: "Contactado", color: "#02506b", tono: "petrol" },
  { valor: "SESION_AGENDADA", etiqueta: "Sesión agendada", color: "#7d3c98", tono: "morado" },
  { valor: "PROPUESTA_ENVIADA", etiqueta: "Propuesta enviada", color: "#b9770e", tono: "ambar" },
  { valor: "NEGOCIACION", etiqueta: "Negociación", color: "#fa943a", tono: "ambar" },
  { valor: "CONTRATADO", etiqueta: "Contratado", color: "#1d6a4a", tono: "verde" },
  { valor: "DESCARTADO", etiqueta: "Descartado", color: "#8aa0ad", tono: "gris" },
];

export const ETAPA = Object.fromEntries(ETAPAS.map((e) => [e.valor, e]));

export const ORIGENES = {
  RESERVA_SESION: "Reserva de sesión",
  ASISTENTE_PLAN: "Asistente (plan)",
  WHATSAPP: "WhatsApp",
  PDF: "PDF",
  CALCULADORA: "Calculadora",
  PRESUPUESTO_WEB: "Presupuesto web",
  MANUAL: "Manual",
};

export const TIPO_EVENTO = {
  CAPTURA: "Captación",
  NOTA: "Nota",
  CONTACTO: "Contacto",
  ETAPA: "Etapa",
  ASESOR: "Responsable",
  PROXIMA_ACCION: "Próxima acción",
  CONVERSION: "Conversión",
  ANONIMIZADO: "Anonimizado",
};

export function fechaHora(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-PE", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).replace(".", "");
}

/** «hace 3 h», «hace 2 d», «12 ago». */
export function haceCuanto(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.round(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d < 15) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" }).replace(".", "");
}

/** Para <input type="datetime-local"> en la hora del navegador. */
export function aInputLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const enlaceWhatsapp = (num) => {
  const digitos = String(num || "").replace(/\D/g, "");
  return digitos ? `https://wa.me/${digitos}` : null;
};

export const nombreDe = (l) => l?.nombre || l?.email || l?.whatsapp || "(sin nombre)";
