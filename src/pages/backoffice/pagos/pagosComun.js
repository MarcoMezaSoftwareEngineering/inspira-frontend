// Estados, importes y fechas del portal de Pagos de Inspira Core.
//
// Los valores coinciden con inspira-backend/src/modules/pagos/estado.js y
// planes.service.js. La regla de cuotas NO se copia aquí: la vista previa del
// plan la calcula el servidor (/backoffice/pagos/planes/simular).
//
// Fechas: los vencimientos llegan como día ("AAAA-MM-DD"). Nunca se pasan por
// new Date(dia): eso es medianoche UTC y en Lima pinta el día anterior. Se
// formatean a mediodía UTC, que es el mismo día en Lima y en España.
import { fechaCorta, fechaHoraDoble } from "../../../lib/horas";

export const ESTADO = {
  PENDIENTE: { etiqueta: "Pendiente", tono: "ambar" },
  VENCIDO: { etiqueta: "Vencido", tono: "rojo" },
  EN_REVISION: { etiqueta: "Por validar", tono: "cielo" },
  PAGADO: { etiqueta: "Pagado", tono: "verde" },
  ANULADO: { etiqueta: "Anulado", tono: "gris" },
};

export const ESTADO_PLAN = {
  ACTIVO: { etiqueta: "Activo", tono: "petrol" },
  PAGADO: { etiqueta: "Pagado", tono: "verde" },
  ANULADO: { etiqueta: "Anulado", tono: "gris" },
};

export const MODALIDAD = {
  CONTADO: "Al contado",
  DOS_CUOTAS: "Dos cuotas",
  PERSONALIZADO: "Personalizado",
};

export const TIPO_CATALOGO = {
  sesion: "Sesión diagnóstico",
  asesoria: "Asesoría",
  master: "Máster",
  "master-avanzado": "Máster · paquetes combinados",
  individual: "Servicios individuales",
  visado: "Visado",
  estancia: "Estancia",
  "cita-espana": "Citas en España",
};

export const LISTA_CATALOGO = {
  economicas: "Económicas",
  intermedias: "Intermedias",
  premium: "Premium",
};

const SIMBOLO = { EUR: "€", PEN: "S/", USD: "US$" };

/** «1.250 €», «S/ 300», «US$ 28,50». */
export function dinero(importe, moneda = "EUR") {
  const n = Number(importe);
  if (!Number.isFinite(n)) return "—";
  const texto = n.toLocaleString("es-ES", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const m = String(moneda || "EUR").toUpperCase();
  if (m === "EUR") return `${texto} €`;
  return `${SIMBOLO[m] || m} ${texto}`;
}

/**
 * Una bolsa por moneda ({ EUR: { importe } , PEN: {…} }) en una línea:
 * «1.250 € · S/ 300». Euros y soles no se suman nunca.
 */
export function bolsaTexto(bolsa, campo = "importe") {
  const partes = Object.entries(bolsa || {})
    .filter(([, v]) => Number(v?.[campo]) > 0)
    .map(([m, v]) => dinero(v[campo], m));
  return partes.length ? partes.join(" · ") : "0 €";
}

/** Cuántos cobros hay en una bolsa, sumando monedas. */
export const cobrosDe = (bolsa) => Object.values(bolsa || {}).reduce((t, v) => t + (Number(v?.cobros) || 0), 0);

/** «15 oct 2026» a partir de "2026-10-15". */
export function dia(valor) {
  if (!valor) return "—";
  const t = String(valor);
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return fechaCorta(`${t}T12:00:00Z`);
  return fechaCorta(t) || t;
}

/** La fecha de un instante (fecha de pago, alta) en Lima. */
export const diaDe = (iso) => (iso ? fechaCorta(iso) : "—");

/** Fecha y hora en las dos orillas, para validaciones y recordatorios. */
export const momento = (iso) => (iso ? fechaHoraDoble(iso) : "");

/** "AAAA-MM-DD" de hoy en Lima: el valor por defecto de los <input type="date">. */
export function hoyLima() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
}

/** "AAAA-MM" del mes en curso en Lima. */
export const mesLima = () => hoyLima().slice(0, 7);

/** Mueve un "AAAA-MM" n meses. */
export function sumarMes(mes, n) {
  const [a, m] = mes.split("-").map(Number);
  const d = new Date(Date.UTC(a, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Primer y último día de un "AAAA-MM". */
export function limitesMes(mes) {
  const [a, m] = mes.split("-").map(Number);
  const ultimo = new Date(Date.UTC(a, m, 0)).getUTCDate();
  return { desde: `${mes}-01`, hasta: `${mes}-${String(ultimo).padStart(2, "0")}` };
}

/** «septiembre de 2026». */
export function nombreMes(mes) {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, 15)).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** Qué le pasa al vencimiento, dicho corto. */
export function textoVence(c) {
  if (!c?.fecha_vencimiento) return "sin vencimiento";
  const d = c.dias_para_vencer;
  if (c.estado === "PAGADO" || c.estado === "ANULADO" || d === null || d === undefined) {
    return `vence ${dia(c.fecha_vencimiento)}`;
  }
  if (d < 0) return `venció hace ${-d} d · ${dia(c.fecha_vencimiento)}`;
  if (d === 0) return "vence hoy";
  if (d === 1) return "vence mañana";
  return `vence en ${d} d · ${dia(c.fecha_vencimiento)}`;
}

/** «cuota 1 de 2», o nada si es un pago único. */
export function textoCuota(c) {
  if (!c?.nro_cuota || !c?.total_cuotas || c.total_cuotas < 2) return "";
  return `cuota ${c.nro_cuota} de ${c.total_cuotas}`;
}

export const estadoDe = (c) => ESTADO[c?.estado_visible] || ESTADO[c?.estado] || ESTADO.PENDIENTE;

/* ── La URL de la pantalla ─────────────────────────────────────────────── */

const VISTAS = ["pendientes", "por-validar", "cobrados", "planes"];

export function leerUrl() {
  const p = new URLSearchParams(window.location.search);
  const id = (k) => {
    const n = Number(p.get(k));
    return Number.isInteger(n) && n > 0 ? n : null;
  };
  const vista = p.get("vista");
  return {
    vista: VISTAS.includes(vista) ? vista : null,
    cliente: id("cliente"),
    pago: id("pago"),
    plan: id("plan"),
  };
}

/** Escribe en la URL lo que se ve, sin añadir entradas al historial. */
export function escribirUrl(cambios) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(cambios)) {
    if (v === null || v === undefined || v === "" || (k === "vista" && v === "pendientes")) url.searchParams.delete(k);
    else url.searchParams.set(k, String(v));
  }
  window.history.replaceState(window.history.state, "", url.pathname + url.search);
}
