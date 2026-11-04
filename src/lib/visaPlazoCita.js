// Plazo de la cita en BLS para el visado de estudios (regla de Carina, 04/11/2026).
//
//  · Regla general: la cita, como mínimo dos meses antes del inicio de clases.
//    Hay excepciones justificadas, pero si se presenta después de ese límite
//    hace falta una declaración jurada de plazo.
//  · Regla interna de Inspira: la cita, entre el día 7 y el 15 del mes, para que
//    el asesorado ya tenga el cierre de cuentas (estado de cuenta) del mes anterior.
//
// Todo con fechas de calendario "AAAA-MM-DD", sin horas ni zonas.

export const DIA_VENTANA_DESDE = 7;
export const DIA_VENTANA_HASTA = 15;
export const MESES_ANTES = 2;

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const diasDelMes = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** "2027-09-15", "15/09/2027" o "15-09-2027" → { y, m, d } (m de 1 a 12), o null. */
export function leerFecha(valor) {
  const s = String(valor || "").trim();
  let y, m, d;
  let r = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (r) [, y, m, d] = r.map(Number);
  else if ((r = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/))) [, d, m, y] = r.map(Number);
  else return null;
  if (m < 1 || m > 12 || d < 1 || d > diasDelMes(y, m)) return null;
  return { y, m, d };
}

/** Resta meses; si el día no existe en el mes de destino, el último día de ese mes. */
function restarMeses({ y, m, d }, n) {
  const total = y * 12 + (m - 1) - n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return { y: ny, m: nm, d: Math.min(d, diasDelMes(ny, nm)) };
}

const comparar = (a, b) => (a.y - b.y) || (a.m - b.m) || (a.d - b.d);
const aIso = (f) => iso(f.y, f.m, f.d);

/** "15 de julio de 2027" */
export function fechaLarga(valor) {
  const f = typeof valor === "string" ? leerFecha(valor) : valor;
  return f ? `${f.d} de ${MESES[f.m - 1]} de ${f.y}` : "";
}

/** Mes anterior al de la fecha: el que debe estar cerrado en el estado de cuenta. */
function mesAnterior({ y, m }) {
  return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
}
const nombreMes = ({ y, m }) => `${MESES[m - 1]} de ${y}`;

/** Ventana 7–15 de un mes, recortada para no pasar del límite. null si no cabe. */
function ventanaDelMes(y, m, limite) {
  const desde = { y, m, d: DIA_VENTANA_DESDE };
  let hasta = { y, m, d: DIA_VENTANA_HASTA };
  if (comparar(desde, limite) > 0) return null;
  if (comparar(hasta, limite) > 0) hasta = { ...limite };
  return {
    desde: aIso(desde),
    hasta: aIso(hasta),
    recortada: hasta.d < DIA_VENTANA_HASTA,
    mes: nombreMes({ y, m }),
    cuentasHasta: nombreMes(mesAnterior({ y, m })),
  };
}

/**
 * @param {{ inicioClases: string, citaFecha?: string, hoy?: string }} p
 * @returns {null | {
 *   inicio, limite,                  // ISO
 *   ventana, ventanaAnterior,        // { desde, hasta, recortada, mes, cuentasHasta } | null
 *   hoyFueraDePlazo: boolean,        // hoy ya pasó el límite: toda cita nueva lleva DJ de plazo
 *   cita: null | { fecha, tono: "ok"|"aviso"|"mal", texto, requiereDJ: boolean }
 * }}
 */
export function plazoCitaBls({ inicioClases, citaFecha = null, hoy = null }) {
  const inicio = leerFecha(inicioClases);
  if (!inicio) return null;
  const limite = restarMeses(inicio, MESES_ANTES);

  // La última ventana 7–15 que cabe antes del límite, y la del mes anterior a esa.
  let ventana = ventanaDelMes(limite.y, limite.m, limite);
  let base = { y: limite.y, m: limite.m };
  if (!ventana) {
    base = mesAnterior(base);
    ventana = ventanaDelMes(base.y, base.m, limite);
  }
  const previo = mesAnterior(base);
  const ventanaAnterior = ventanaDelMes(previo.y, previo.m, limite);

  const h = leerFecha(hoy);
  const hoyFueraDePlazo = Boolean(h && comparar(h, limite) > 0);

  let cita = null;
  const c = leerFecha(citaFecha);
  if (c) {
    const enVentana = c.d >= DIA_VENTANA_DESDE && c.d <= DIA_VENTANA_HASTA;
    if (comparar(c, limite) > 0) {
      cita = {
        fecha: aIso(c), tono: "mal", requiereDJ: true,
        texto: `Es después del límite (${fechaLarga(limite)}): hay que preparar la declaración jurada de plazo.`,
      };
    } else if (!enVentana) {
      cita = {
        fecha: aIso(c), tono: "aviso", requiereDJ: false,
        texto: c.d < DIA_VENTANA_DESDE
          ? `Está dentro del plazo, pero antes del día ${DIA_VENTANA_DESDE}: puede que aún no tenga el estado de cuenta de ${nombreMes(mesAnterior(c))} cerrado.`
          : `Está dentro del plazo, pero fuera de la ventana interna del ${DIA_VENTANA_DESDE} al ${DIA_VENTANA_HASTA}.`,
      };
    } else {
      cita = {
        fecha: aIso(c), tono: "ok", requiereDJ: false,
        texto: `En regla: dentro del plazo y en la ventana del ${DIA_VENTANA_DESDE} al ${DIA_VENTANA_HASTA}. Lleva estados de cuenta cerrados hasta ${nombreMes(mesAnterior(c))}.`,
      };
    }
  }

  return { inicio: aIso(inicio), limite: aIso(limite), ventana, ventanaAnterior, hoyFueraDePlazo, cita };
}

/** "7 al 15 de julio de 2027" o "7 al 10 de julio de 2027" */
export function textoVentana(v) {
  if (!v) return "";
  const a = leerFecha(v.desde);
  const b = leerFecha(v.hasta);
  return `${a.d} al ${b.d} de ${MESES[a.m - 1]} de ${a.y}`;
}
