// La línea de tiempo de un expediente: qué pasó y cuándo, y lo que viene.
//
// Se abre desde «Novedades» (botón «Historial») en una hoja: en el teléfono
// sube desde abajo; en pantalla grande, ventana a la derecha. Arriba, lo que
// viene (plazos y citas de los próximos 60 días); debajo, día a día, lo que
// ha pasado: documentos aprobados u observados, mensajes del asesor, avance de
// etapa, pagos confirmados, comunicaciones de Extranjería.
//
// No pide nada nuevo al servidor: las novedades ya las cargó «Novedades»
// (lista blanca del backend, sin notas internas) y los plazos vienen en el
// `resumen` de la lista de servicios (ServiciosPanelCtx).
import { useEffect } from "react";
import { createPortal } from "react-dom";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { fechaHoraDoble } from "../../../lib/horas";
import { ICONO_NOVEDAD, TONO_NOVEDAD } from "../novedades";
import { cuentaAtras, etiquetaDia, horaDe, porDia, proximosDe } from "../avisos";
import { useServicioPanel } from "../serviciosCtx";
import { recorta } from "../pendientes";

/**
 * @param {{ idSolicitud: number, items: object[], desde: number,
 *           onIr: (n: object) => void, onCerrar: () => void }} props
 */
export default function LineaTiempoExpediente({ idSolicitud, items = [], desde = 0, onIr, onCerrar }) {
  const servicio = useServicioPanel(idSolicitud);
  const proximos = proximosDe(servicio);
  const dias = porDia(items);

  useEffect(() => {
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onCerrar(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = antes; window.removeEventListener("keydown", onKey); };
  }, [onCerrar]);

  return createPortal(
    <div className="pnl pnl-lt" role="dialog" aria-modal="true" aria-labelledby="pnl-lt-titulo">
      <div className="pnl-lt-fondo" onClick={onCerrar} />
      <div className="pnl-lt-hoja">
        <header className="pnl-lt-cab">
          <span className="pnl-lt-cab-icono" aria-hidden="true"><Icono nombre="reloj" size={18} /></span>
          <div className="min-w-0">
            <h2 id="pnl-lt-titulo">Historial del expediente</h2>
            {servicio?.titulo && <p>{recorta(servicio.titulo, 60)}</p>}
          </div>
          <button type="button" className="pnl-lt-x ux-tap" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </header>

        <div className="pnl-lt-cuerpo">
          {proximos.length > 0 && (
            <section aria-labelledby="pnl-lt-viene">
              <h3 id="pnl-lt-viene" className="pnl-lt-grupo">Lo que viene</h3>
              <ol className="pnl-lt-lista">
                {proximos.map((p) => (
                  <li key={p.clave}>
                    <button type="button" className="pnl-lt-item ux-tap" data-tono={p.dias <= 3 ? "alto" : "aviso"} data-futuro="1"
                      onClick={() => { onCerrar(); navigate(p.href); }}>
                      <span className="pnl-lt-punto" aria-hidden="true"><Icono nombre={p.icono} size={14} /></span>
                      <span className="pnl-lt-texto">
                        <b>{p.titulo}</b>
                        {p.detalle && <small>{p.detalle}</small>}
                      </span>
                      <span className="pnl-lt-cuando">{cuentaAtras(p.dias)}<small>{etiquetaDia(p.fecha)}</small></span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-labelledby="pnl-lt-paso">
            <h3 id="pnl-lt-paso" className="pnl-lt-grupo">Lo que ha pasado</h3>
            {!dias.length ? (
              <p className="pnl-lt-vacio">
                Todavía no hay movimientos en los últimos 60 días. Cuando tu asesor revise un documento, te escriba o tu proceso avance, lo verás aquí.
              </p>
            ) : dias.map((g) => (
              <div key={g.dia} className="pnl-lt-dia">
                <p className="pnl-lt-dia-etiqueta">{g.etiqueta}</p>
                <ol className="pnl-lt-lista">
                  {g.items.map((n, i) => {
                    const nueva = Date.parse(n.fecha) > desde;
                    return (
                      <li key={n.clave || `${n.tipo}-${n.fecha}-${i}`}>
                        <button type="button" className="pnl-lt-item ux-tap" data-tono={TONO_NOVEDAD[n.tipo] || "info"} onClick={() => onIr?.(n)}>
                          <span className="pnl-lt-punto" aria-hidden="true"><Icono nombre={ICONO_NOVEDAD[n.tipo] || "documento"} size={14} /></span>
                          <span className="pnl-lt-texto">
                            <b>
                              {n.titulo}
                              {nueva && <span className="pnl-nov-badge">Nuevo</span>}
                            </b>
                            {n.detalle && <small>{n.detalle}</small>}
                          </span>
                          <time className="pnl-lt-cuando" dateTime={n.fecha} title={fechaHoraDoble(n.fecha)}>{horaDe(n.fecha)}</time>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
          </section>

          <p className="pnl-lt-nota">Se muestran los últimos 60 días. Toca una línea para ir a donde se resuelve.</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
