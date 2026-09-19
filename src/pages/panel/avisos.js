// Avisos del panel: lo que ha pasado y lo que viene, sin pintar nada.
//
// Lo usan la línea de tiempo de cada expediente (LineaTiempoExpediente) y el
// centro de avisos de la barra de arriba (CentroAvisos). Solo junta datos que
// el servidor ya expone al asesorado:
//   · novedades   GET /solicitudes/:id/novedades (lista blanca del backend:
//                 documentos, mensajes del asesor, etapa, pagos confirmados,
//                 Extranjería; nunca notas internas)
//   · plazos      resumen.plazos / requerimientos / agenda de /solicitudes/mias
//   · cuotas      planes de GET /cliente/pagos
//
// La «última visita» del centro de avisos vive en este navegador
// (localStorage), como la de cada expediente (novedades.js). Si se borra,
// cuenta como nuevo lo de la última semana.
import { rutaDe } from "./ruta";
import { recorta } from "./pendientes";
import { importe, nombreCuota } from "./pagosCliente";

const SEMANA = 7 * 86400000;
const CLAVE_VISTO = "inspira:avisos-visto";
const CLAVE_PLAZOS = "inspira:avisos-plazos-vistos";

/** Plazos que cuentan como aviso: los de los próximos días. */
export const DIAS_AVISO_PLAZO = 7;

function leer(clave) {
  try { return localStorage.getItem(clave); } catch { return null; }
}
function escribir(clave, valor) {
  try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento: no pasa nada */ }
}

/** Desde cuándo algo es nuevo en el centro de avisos (ms). */
export function vistoCentro() {
  const t = Date.parse(leer(CLAVE_VISTO) || "");
  return Number.isFinite(t) ? t : Date.now() - SEMANA;
}

/** Los plazos que ya se vieron en el centro (por clave). */
export function plazosVistos() {
  try {
    const v = JSON.parse(leer(CLAVE_PLAZOS) || "[]");
    return new Set(Array.isArray(v) ? v : []);
  } catch {
    return new Set();
  }
}

/** Marca todo como visto: la hora de ahora y los plazos que se enseñaron. */
export function guardarVistoCentro(clavesPlazos = []) {
  escribir(CLAVE_VISTO, new Date().toISOString());
  // Solo se guardan los vigentes: la lista no crece sin fin.
  escribir(CLAVE_PLAZOS, JSON.stringify([...new Set(clavesPlazos)].slice(0, 80)));
}

/**
 * Días hasta un "YYYY-MM-DD" en fechas locales (medianoche UTC caería el día
 * anterior en Lima). Null si no es una fecha.
 */
export function diasHasta(iso) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(iso || ""))) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
}

export const cuentaAtras = (d) => (d <= 0 ? "hoy" : d === 1 ? "mañana" : `en ${d} días`);

/**
 * Lo que viene en un expediente: cierres de postulación, plazos de
 * Extranjería o del consulado, citas y la fecha recomendada de la estancia.
 * @returns {{clave, tipo: "plazo", icono, titulo, detalle, fecha, dias, seccion, href}[]}
 */
export function proximosDe(s, { dias = 60 } = {}) {
  if (!s) return [];
  const r = s.resumen || {};
  const id = s.id_solicitud;
  // Estancia y modificatoria no tienen secciones con URL: se abre el expediente.
  const conSecciones = !r.servicio_propio;
  const href = (seccion) => rutaDe({ idServicio: id, seccion: conSecciones ? seccion : null });
  const out = [];
  const meter = (it) => {
    const d = diasHasta(it.fecha);
    if (d === null || d < 0 || d > dias) return;
    out.push({ tipo: "plazo", ...it, fecha: String(it.fecha).slice(0, 10), dias: d });
  };

  for (const p of r.plazos || []) {
    meter({
      clave: `plazo-${id}-${p.id_master}-${p.cierra}`, icono: "birrete", fecha: p.cierra,
      titulo: `Cierra la postulación${p.universidad ? ` · ${p.universidad}` : ""}`,
      detalle: p.nombre || null, seccion: "post", href: href("post"),
    });
  }
  for (const q of r.requerimientos || []) {
    meter({
      clave: `req-${id}-${q.titulo}-${q.plazo}`, icono: "balanza", fecha: q.plazo,
      titulo: `Responder a Extranjería: ${q.titulo}`, detalle: null, seccion: null, href: href(null),
    });
  }
  for (const a of r.agenda || []) {
    const seccion = a.tipo === "cita" || a.tipo === "requerimiento" ? "estado" : null;
    meter({
      clave: `ag-${id}-${a.tipo}-${a.fecha}`,
      icono: a.tipo === "cita" ? "calendario" : a.tipo === "presentacion" ? "documento" : "balanza",
      fecha: a.fecha, titulo: a.titulo, detalle: a.tentativa ? "Fecha por confirmar" : (a.hora || null),
      seccion, href: href(seccion),
    });
  }
  return out.sort((x, y) => x.fecha.localeCompare(y.fecha));
}

/** Las cuotas pendientes que vencen pronto o ya vencieron, como avisos. */
export function cuotasComoAvisos(planes, { dias = DIAS_AVISO_PLAZO } = {}) {
  const out = [];
  for (const plan of planes || []) {
    for (const c of plan.cuotas || []) {
      if (c.estado !== "PENDIENTE") continue;
      const d = c.dias_para_vencer;
      const cerca = c.vencido || (d !== null && d !== undefined && d <= dias);
      if (!cerca && !c.motivo_rechazo) continue;
      out.push({
        clave: `cuota-${c.id_pago}-${c.fecha_vencimiento}-${c.motivo_rechazo ? "r" : ""}`,
        tipo: "pago_pendiente",
        icono: "euro",
        tono: c.vencido || c.motivo_rechazo ? "alto" : "aviso",
        titulo: c.motivo_rechazo
          ? `Tu comprobante no se aceptó: ${nombreCuota(c)}`
          : c.vencido ? `Cuota vencida: ${nombreCuota(c)} · ${importe(c.monto, c.moneda)}`
            : `${nombreCuota(c)} · ${importe(c.monto, c.moneda)}`,
        detalle: recorta(plan.concepto, 50) || null,
        fecha: c.fecha_vencimiento || null,
        dias: d ?? null,
        href: `${rutaDe({ tab: "pagos" })}?cuota=${c.id_pago}`,
      });
    }
  }
  return out;
}

/** Agrupa por día (local) de más reciente a más antiguo: [{ dia, etiqueta, items }]. */
export function porDia(items) {
  const grupos = new Map();
  for (const it of items || []) {
    const f = new Date(it.fecha);
    if (Number.isNaN(f.getTime())) continue;
    const dia = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, "0")}-${String(f.getDate()).padStart(2, "0")}`;
    if (!grupos.has(dia)) grupos.set(dia, []);
    grupos.get(dia).push(it);
  }
  return [...grupos.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([dia, lista]) => ({ dia, etiqueta: etiquetaDia(dia), items: lista }));
}

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

/** «Hoy», «Ayer» o «12 de septiembre». */
export function etiquetaDia(dia) {
  const d = diasHasta(dia);
  if (d === 0) return "Hoy";
  if (d === -1) return "Ayer";
  const [a, m, dd] = dia.split("-").map(Number);
  const esteAno = new Date().getFullYear() === a;
  return `${dd} de ${MESES[m - 1]}${esteAno ? "" : ` de ${a}`}`;
}

/** «14:05» en la hora de este dispositivo. */
export function horaDe(iso) {
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return "";
  return f.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}
