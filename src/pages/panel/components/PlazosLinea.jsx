// «Tus próximas fechas»: los plazos de todos tus servicios en una sola línea.
//
// Las fechas que importan estaban cada una en su sitio: el cierre de una
// postulación en Postulaciones, la cita del consulado en Estado de mi visa,
// la fecha para presentar la estancia dentro del expediente, la cuota en Mis
// pagos. Para saber «qué viene esta semana» había que abrirlo todo. Aquí van
// juntas y en orden, con cuánto falta y un toque para ir a resolverlas.
//
// Fuentes, todas ya cargadas en Inicio (no pide nada al servidor):
//   · servicios[].resumen.plazos          cierres de postulación (≤ 14 días)
//   · servicios[].resumen.requerimientos  plazos de Extranjería, si son fecha
//   · servicios[].resumen.agenda          cita del consulado, plazo del
//                                         requerimiento del visado, fecha
//                                         recomendada de la estancia
//   · pagos (planes de GET /cliente/pagos) cuotas pendientes con vencimiento
//
// Si no hay nada en los próximos 60 días no se pinta: una línea vacía solo
// ocupa sitio.
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { recorta } from "../pendientes";
import { importe, nombreCuota } from "../pagosCliente";

const VENTANA = 60;
const MAXIMO = 12;
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"];

/**
 * Días hasta un "YYYY-MM-DD", contados en fechas locales: `new Date("2026-09-20")`
 * es medianoche UTC y en Lima caería el día anterior. Null si no es una fecha.
 */
function diasHasta(iso) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(String(iso || ""))) return null;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const [a, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return Math.round((new Date(a, m - 1, d) - hoy) / 86400000);
}

function partesFecha(iso) {
  const [, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return { dia: d, mes: MESES[m - 1] || "" };
}

const cuenta = (d) => (d <= 0 ? "hoy" : d === 1 ? "mañana" : `en ${d} días`);
const tonoDe = (d) => (d <= 3 ? "alto" : d <= 10 ? "aviso" : "info");

/** Todas las fechas por venir, ordenadas. */
function fechasProximas(servicios, pagos) {
  const items = [];
  const meter = (it) => {
    const dias = diasHasta(it.fecha);
    if (dias === null || dias < 0 || dias > VENTANA) return;
    items.push({ ...it, fecha: String(it.fecha).slice(0, 10), dias });
  };

  for (const s of servicios || []) {
    const r = s.resumen || {};
    const id = s.id_solicitud;
    // Estancia y modificatoria no tienen secciones con URL: se abre el expediente.
    const conSecciones = !r.servicio_propio;
    const ir = (seccion) => rutaDe({ idServicio: id, seccion: conSecciones ? seccion : null });
    const de = recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo, 40);

    for (const p of r.plazos || []) {
      meter({
        clave: `plazo-${id}-${p.id_master}`, icono: "birrete", fecha: p.cierra,
        titulo: `Cierra la postulación${p.universidad ? ` · ${p.universidad}` : ""}`,
        detalle: p.nombre || null, servicio: de, href: ir("post"),
      });
    }
    for (const q of r.requerimientos || []) {
      meter({
        clave: `req-${id}-${q.titulo}-${q.plazo}`, icono: "balanza", fecha: q.plazo,
        titulo: `Responder a Extranjería: ${q.titulo}`, servicio: de, href: ir(null),
      });
    }
    for (const a of r.agenda || []) {
      const seccion = a.tipo === "cita" || a.tipo === "requerimiento" ? "estado" : null;
      meter({
        clave: `ag-${id}-${a.tipo}-${a.fecha}`,
        icono: a.tipo === "cita" ? "calendario" : a.tipo === "presentacion" ? "documento" : "balanza",
        fecha: a.fecha, titulo: a.titulo, hora: a.hora || null,
        detalle: a.tentativa ? "Fecha por confirmar" : null, servicio: de, href: ir(seccion),
      });
    }
  }

  for (const plan of pagos || []) {
    for (const c of plan.cuotas || []) {
      if (c.estado !== "PENDIENTE") continue;
      meter({
        clave: `pago-${c.id_pago}`, icono: "euro", fecha: c.fecha_vencimiento,
        titulo: `${nombreCuota(c)}: ${importe(c.monto, c.moneda)}`,
        servicio: recorta(plan.concepto, 40) || null,
        href: `${rutaDe({ tab: "pagos" })}?cuota=${c.id_pago}`,
      });
    }
  }

  return items.sort((a, b) => a.fecha.localeCompare(b.fecha) || a.clave.localeCompare(b.clave)).slice(0, MAXIMO);
}

/**
 * @param {{ servicios: object[], pagos?: object[]|null }} props
 */
export default function PlazosLinea({ servicios, pagos = null }) {
  const items = fechasProximas(servicios, pagos);
  if (!items.length) return null;

  return (
    <section className="pnl-plazos" aria-labelledby="pnl-plazos-t">
      <header className="pnl-plazos-cabeza">
        <h2 id="pnl-plazos-t" className="pnl-plazos-titulo">
          <Icono nombre="calendario" size={16} />
          Tus próximas fechas
        </h2>
        <span className="pnl-plazos-sub">Próximos {VENTANA} días</span>
      </header>
      <ol className="pnl-plazos-linea">
        {items.map((it, i) => {
          const { dia, mes } = partesFecha(it.fecha);
          const tono = tonoDe(it.dias);
          return (
            <li key={it.clave} className="pnl-plazos-paso" style={{ "--i": i }}>
              <button
                type="button"
                className="pnl-plazos-item ux-tap"
                data-tono={tono}
                onClick={() => navigate(it.href)}
                aria-label={`${it.titulo}, ${cuenta(it.dias)}${it.servicio ? `, ${it.servicio}` : ""}`}
              >
                <span className="pnl-plazos-chip" aria-hidden="true">
                  <b>{dia}</b>
                  <span>{mes}</span>
                </span>
                <span className="pnl-plazos-cuerpo">
                  <span className="pnl-plazos-cuenta">
                    <Icono nombre={it.icono} size={13} />
                    {cuenta(it.dias)}{it.hora ? ` · ${it.hora}` : ""}
                  </span>
                  <span className="pnl-plazos-texto">{it.titulo}</span>
                  {(it.detalle || it.servicio) && (
                    <span className="pnl-plazos-servicio">{[it.detalle, it.servicio].filter(Boolean).join(" · ")}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
