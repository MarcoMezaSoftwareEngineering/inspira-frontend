// Cómo se dicen los pagos en el panel del asesorado. Lo usan «Mis pagos» y
// la lista «Hoy» de Inicio, para que una cuota se llame igual en los dos.
//
// Los vencimientos llegan como día ("AAAA-MM-DD") y se formatean con
// fechaLegible, que no los pasa por new Date(dia): a medianoche UTC en Lima
// saldría el día anterior. El estado (vencida, días que faltan) lo calcula el
// servidor con el día de Lima; aquí solo se redacta.
import { fechaCorta } from "../../lib/horas";

export { fechaLegible as diaPago } from "./queMeFalta";

const SIMBOLO = { PEN: "S/", USD: "US$" };

/** «150 €», «S/ 300», «US$ 28,50». */
export function importe(monto, moneda = "EUR") {
  const n = Number(monto);
  if (!Number.isFinite(n)) return "—";
  const texto = n.toLocaleString("es-ES", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 });
  const m = String(moneda || "EUR").toUpperCase();
  return m === "EUR" ? `${texto} €` : `${SIMBOLO[m] || m} ${texto}`;
}

/** «Cuota 1 de 2», o «Pago único». */
export const nombreCuota = (c) => (c?.total_cuotas > 1 ? `Cuota ${c.nro_cuota} de ${c.total_cuotas}` : "Pago único");

/**
 * El estado de una cuota tal como lo lee el asesorado.
 * @returns {{ etiqueta: string, tono: "ok"|"info"|"alto"|"aviso"|"tipo", texto: string|null }}
 */
export function estadoCuota(c) {
  if (c.estado === "PAGADO") {
    return { etiqueta: "Pagada", tono: "ok", texto: c.fecha_pago ? `Pagada el ${fechaCorta(c.fecha_pago)}${c.metodo ? ` · ${c.metodo}` : ""}` : null };
  }
  if (c.estado === "EN_REVISION") {
    return { etiqueta: "En revisión", tono: "info", texto: "Recibimos tu comprobante. Tu asesor lo está revisando." };
  }
  if (c.estado === "ANULADO") return { etiqueta: "Anulada", tono: "tipo", texto: null };
  if (c.motivo_rechazo) {
    return { etiqueta: "Rechazada", tono: "alto", texto: `Tu comprobante no se aceptó: ${c.motivo_rechazo}` };
  }
  const d = c.dias_para_vencer;
  if (c.vencido) return { etiqueta: "Vencida", tono: "alto", texto: d === -1 ? "Venció ayer" : `Venció hace ${-d} días` };
  if (d === 0) return { etiqueta: "Vence hoy", tono: "alto", texto: null };
  if (d === 1) return { etiqueta: "Vence mañana", tono: "aviso", texto: null };
  if (d !== null && d !== undefined && d <= 7) return { etiqueta: `Vence en ${d} días`, tono: "aviso", texto: null };
  return { etiqueta: "Pendiente", tono: "tipo", texto: null };
}

/**
 * La cuota pendiente que vence antes (las que no tienen fecha, al final).
 * La usan el resumen y la barra fija de «Mis pagos», para que las dos hablen
 * de la misma cuota.
 */
export function proximaCuota(planes) {
  return (planes || [])
    .flatMap((p) => p.cuotas || [])
    .filter((c) => c.estado === "PENDIENTE")
    .sort((a, b) => String(a.fecha_vencimiento || "9999").localeCompare(String(b.fecha_vencimiento || "9999")))[0] || null;
}

/** «S/ 300,00»: lo que cobrará Mercado Pago, que siempre va en soles. */
export function importeSoles(c) {
  const n = Number(c?.pago_en_linea?.monto_pen);
  return Number.isFinite(n) && n > 0 ? `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2 })}` : null;
}

/**
 * Las cuotas que piden algo al asesorado ya: vencidas, que vencen en siete
 * días o menos, o con el comprobante rechazado. Lo que está en revisión
 * espera al equipo, no a él.
 */
export function cuotasPorAtender(planes) {
  const lista = [];
  for (const plan of planes || []) {
    for (const c of plan.cuotas || []) {
      if (c.estado !== "PENDIENTE") continue;
      const d = c.dias_para_vencer;
      const cerca = c.vencido || (d !== null && d !== undefined && d <= 7);
      if (cerca || c.motivo_rechazo) lista.push({ cuota: c, plan });
    }
  }
  return lista;
}
