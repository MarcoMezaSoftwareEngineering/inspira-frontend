// El centro de avisos: la campana de la barra de arriba, con lo nuevo desde
// la última visita.
//
// Junta lo que ya estaba repartido: las novedades de cada expediente (lo que
// revisó o escribió el asesor, el avance de etapa, los pagos confirmados), los
// plazos de los próximos días y las cuotas que vencen o vencieron. El número
// de la campana es lo que no ha visto aún: novedades posteriores a su última
// visita y plazos que no se le han enseñado. Al cerrar el panel se da todo por
// visto (localStorage, ver avisos.js).
//
// Solo datos que el servidor ya expone al asesorado (lista blanca de
// novedades y la lista de servicios): nunca notas internas.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { rutaDe } from "../ruta";
import { recorta } from "../pendientes";
import { cargarNovedades, ICONO_NOVEDAD, TONO_NOVEDAD } from "../novedades";
import {
  DIAS_AVISO_PLAZO, cuentaAtras, cuotasComoAvisos, guardarVistoCentro, plazosVistos, proximosDe, vistoCentro,
} from "../avisos";

const MAX_SERVICIOS = 8;
const MAX_LISTA = 25;

/** «hace 5 min», «hace 3 h», «ayer», «hace 4 días». */
function haceCuanto(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  return d <= 1 ? "ayer" : `hace ${d} días`;
}

function IconoCampana() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

/**
 * @param {{ servicios: object[], pagos?: object[] }} props
 * `pagos`: los planes de GET /cliente/pagos (para las cuotas).
 */
export default function CentroAvisos({ servicios = [], pagos = [] }) {
  const [novedades, setNovedades] = useState([]); // [{ ...novedad, id_solicitud, servicio, seccionPropia }]
  const [abierto, setAbierto] = useState(false);
  // La marca se congela al abrir: los «Nuevo» no desaparecen mientras lee.
  const [desde, setDesde] = useState(() => vistoCentro());
  const [vistos, setVistos] = useState(() => plazosVistos());
  const caja = useRef(null);

  const suyos = useMemo(() => (servicios || []).slice(0, MAX_SERVICIOS), [servicios]);
  const clave = suyos.map((s) => s.id_solicitud).join(",");

  useEffect(() => {
    if (!suyos.length) return undefined;
    let vivo = true;
    Promise.all(suyos.map((s) => cargarNovedades(s.id_solicitud)
      .then((r) => (r?.ok ? (r.novedades || []).map((n) => ({
        ...n,
        id_solicitud: s.id_solicitud,
        servicio: recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo, 40),
        seccionPropia: !s.resumen?.servicio_propio,
      })) : []))
      .catch(() => [])))
      .then((listas) => { if (vivo) setNovedades(listas.flat()); });
    return () => { vivo = false; };
  }, [clave]); // eslint-disable-line react-hooks/exhaustive-deps

  const plazos = useMemo(() => [
    ...suyos.flatMap((s) => proximosDe(s, { dias: DIAS_AVISO_PLAZO })
      .map((p) => ({ ...p, servicio: recorta(s.invitado ? `Expediente de ${s.titular}` : s.titulo, 40) }))),
    ...cuotasComoAvisos(pagos),
  ], [suyos, pagos]);

  const recientes = useMemo(
    () => [...novedades].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))).slice(0, MAX_LISTA),
    [novedades],
  );
  const nuevasNov = novedades.filter((n) => Date.parse(n.fecha) > desde).length;
  const nuevosPlazos = plazos.filter((p) => !vistos.has(p.clave)).length;
  const total = abierto ? 0 : nuevasNov + nuevosPlazos;

  const cerrar = useCallback(() => {
    setAbierto(false);
    guardarVistoCentro(plazos.map((p) => p.clave));
    setDesde(Date.now());
    setVistos(new Set(plazos.map((p) => p.clave)));
  }, [plazos]);

  // Fuera del panel o con Escape, se cierra.
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (caja.current && !caja.current.contains(e.target)) cerrar(); };
    const tecla = (e) => { if (e.key === "Escape") cerrar(); };
    document.addEventListener("mousedown", fuera);
    document.addEventListener("touchstart", fuera, { passive: true });
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("touchstart", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto, cerrar]);

  if (!suyos.length && !plazos.length) return null;

  const irNovedad = (n) => {
    cerrar();
    if (n.seccion === "pagos") return navigate(rutaDe({ tab: "pagos" }));
    return navigate(rutaDe({ idServicio: n.id_solicitud, seccion: n.seccionPropia ? n.seccion || null : null }));
  };
  const irA = (href) => { cerrar(); navigate(href); };

  return (
    <div className="pnl-avc" ref={caja}>
      <button
        type="button"
        className="pnl-avc-boton ux-tap"
        aria-haspopup="dialog"
        aria-expanded={abierto}
        aria-label={total > 0 ? `Avisos: ${total} sin ver` : "Avisos"}
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <IconoCampana />
        {total > 0 && <span className="pnl-avc-cuenta" aria-hidden="true">{total > 9 ? "9+" : total}</span>}
      </button>

      {abierto && (
        <div className="pnl-avc-panel" role="dialog" aria-label="Avisos">
          <header className="pnl-avc-cab">
            <h2>Avisos</h2>
            <button type="button" className="pnl-avc-listo" onClick={cerrar}>Marcar como visto</button>
          </header>

          <div className="pnl-avc-cuerpo">
            {plazos.length > 0 && (
              <>
                <p className="pnl-avc-grupo">Te toca pronto</p>
                <ul className="pnl-avc-lista">
                  {plazos.map((p) => (
                    <li key={p.clave}>
                      <button type="button" className="pnl-avc-item" data-tono={p.tono || (p.dias != null && p.dias <= 3 ? "alto" : "aviso")}
                        data-nueva={!vistos.has(p.clave) ? "1" : undefined} onClick={() => irA(p.href)}>
                        <span className="pnl-avc-icono" aria-hidden="true"><Icono nombre={p.icono || "calendario"} size={15} /></span>
                        <span className="pnl-avc-texto">
                          <b>{p.titulo}</b>
                          <small>{[p.detalle, p.servicio].filter(Boolean).join(" · ")}</small>
                        </span>
                        {p.dias != null && <span className="pnl-avc-cuando">{p.dias < 0 ? "vencida" : cuentaAtras(p.dias)}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="pnl-avc-grupo">Novedades</p>
            {!recientes.length ? (
              <p className="pnl-avc-vacio">Nada nuevo por ahora. Cuando tu asesor revise algo o te escriba, lo verás aquí.</p>
            ) : (
              <ul className="pnl-avc-lista">
                {recientes.map((n, i) => {
                  const nueva = Date.parse(n.fecha) > desde;
                  return (
                    <li key={`${n.id_solicitud}-${n.clave || i}`}>
                      <button type="button" className="pnl-avc-item" data-tono={TONO_NOVEDAD[n.tipo] || "info"}
                        data-nueva={nueva ? "1" : undefined} onClick={() => irNovedad(n)}>
                        <span className="pnl-avc-icono" aria-hidden="true"><Icono nombre={ICONO_NOVEDAD[n.tipo] || "documento"} size={15} /></span>
                        <span className="pnl-avc-texto">
                          <b>{n.titulo}</b>
                          <small>{[n.detalle, n.servicio].filter(Boolean).join(" · ")}</small>
                        </span>
                        <span className="pnl-avc-cuando">{haceCuanto(n.fecha)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
