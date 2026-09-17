// «Novedades»: lo que ha cambiado en un expediente desde tu última visita.
//
// La pregunta que más llega por WhatsApp es «¿hay algo nuevo en lo mío?». La
// respuesta ya estaba repartida por el expediente —un documento aprobado en
// Documentos, una carta en Postulaciones, un mensaje en el hilo—; aquí se
// junta en una lista corta, con lo nuevo marcado.
//
// Qué entra lo decide el servidor (GET /solicitudes/:id/novedades, lista
// blanca en el novedades.js del backend). Aquí solo se pinta y se recuerda
// cuándo la viste.
//
// «Nuevo» se mide contra la última visita guardada en este navegador; la
// marca y el contador sin pintar (`contarNovedades`) están en ../novedades.js.
import { useEffect, useMemo, useState } from "react";
import Icono from "../../../components/common/Icono";
import { navigate } from "../../../services/navigate";
import { fechaCorta, fechaHoraDoble } from "../../../lib/horas";
import { rutaDe } from "../ruta";
import { cargarNovedades, desdeVisto, guardarVisto } from "../novedades";

const VISIBLES = 3;

/** «hace 5 min», «hace 3 h», «ayer», «hace 4 días»; más allá, la fecha. */
function haceCuanto(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((Date.now() - t) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dia = new Date(t); dia.setHours(0, 0, 0, 0);
  const dias = Math.round((hoy - dia) / 86400000);
  if (dias <= 1) return "ayer";
  if (dias < 7) return `hace ${dias} días`;
  return fechaCorta(iso);
}

const ICONO = {
  documento_recibido: "documento",
  documento_inspira: "documento",
  documento_aprobado: "escudo",
  documento_observado: "documento",
  documento_proceso: "birrete",
  mensaje: "chat",
  etapa: "brujula",
  requerimiento: "balanza",
  extranjeria: "balanza",
  pago: "euro",
};

const TONO = {
  documento_aprobado: "ok",
  documento_observado: "alto",
  requerimiento: "alto",
  pago: "ok",
};

/**
 * @param {{ idSolicitud: number, onIrSeccion?: (seccion: string|null) => void, plegable?: boolean }} props
 * `plegable`: empieza cerrada, en una línea con la cuenta de nuevas. Para
 * pantallas de altura fija (el visado en el teléfono), donde la lista abierta
 * le quitaba casi todo el sitio al formulario.
 */
export default function NovedadesExpediente({ idSolicitud, onIrSeccion = null, plegable = false }) {
  // Lo cargado va con el id al que pertenece: al cambiar de expediente, lo
  // del anterior deja de valer solo, sin vaciar el estado a mano en el efecto.
  const [datos, setDatos] = useState({ id: null, error: false, items: [] });
  const [abiertoEn, setAbiertoEn] = useState(null);
  const [desplegadaEn, setDesplegadaEn] = useState(null);
  const desplegada = !plegable || desplegadaEn === idSolicitud;
  const vigente = datos.id === idSolicitud;
  const estado = vigente ? { ...datos, cargando: false } : { cargando: true, error: false, items: [] };
  const abierto = abiertoEn === idSolicitud;
  // La marca se lee una vez por expediente: si se leyera en cada render, a los
  // dos segundos se guardaría la visita y los «Nuevo» desaparecerían delante de ti.
  const desde = useMemo(() => desdeVisto(idSolicitud), [idSolicitud]);

  useEffect(() => {
    if (!idSolicitud) return undefined;
    let vivo = true;
    cargarNovedades(idSolicitud)
      .then((r) => {
        if (!vivo) return;
        setDatos(r?.ok
          ? { id: idSolicitud, error: false, items: Array.isArray(r.novedades) ? r.novedades : [] }
          : { id: idSolicitud, error: true, items: [] });
      })
      .catch(() => { if (vivo) setDatos({ id: idSolicitud, error: true, items: [] }); });
    return () => { vivo = false; };
  }, [idSolicitud]);

  // La visita cuenta cuando la lista ya se ha visto un momento, no al cargar:
  // abrir y salir rebotado no es haberla leído.
  const listaVista = vigente && !datos.error && desplegada;
  useEffect(() => {
    if (!listaVista || !idSolicitud) return undefined;
    const t = setTimeout(() => guardarVisto(idSolicitud), 2000);
    return () => clearTimeout(t);
  }, [listaVista, idSolicitud]);

  const nuevas = estado.items.filter((n) => Date.parse(n.fecha) > desde).length;
  const lista = abierto ? estado.items : estado.items.slice(0, VISIBLES);

  const ir = (n) => {
    // Los pagos no son una sección del expediente: viven en su pestaña.
    if (n.seccion === "pagos") return navigate(rutaDe({ tab: "pagos" }));
    if (onIrSeccion) return onIrSeccion(n.seccion || null);
    return navigate(rutaDe({ idServicio: idSolicitud, seccion: n.seccion || null }));
  };

  if (!idSolicitud || estado.error) return null; // un extra: si falla, no estorba al expediente

  return (
    <section className="pnl-nov" aria-labelledby={`pnl-nov-t-${idSolicitud}`}>
      <header className="pnl-nov-cabeza">
        <h3 id={`pnl-nov-t-${idSolicitud}`} className="pnl-nov-titulo">
          Novedades
          {nuevas > 0 && <span className="pnl-nov-cuenta">{nuevas} {nuevas === 1 ? "nueva" : "nuevas"}</span>}
        </h3>
        {plegable ? (
          <button type="button" className="pnl-nov-plegar" aria-expanded={desplegada}
            onClick={() => setDesplegadaEn(desplegada ? null : idSolicitud)}>
            {desplegada ? "Ocultar" : "Ver"}
          </button>
        ) : (
          <span className="pnl-nov-sub">Últimos 60 días</span>
        )}
      </header>

      {!desplegada ? null : estado.cargando ? (
        <ul className="pnl-nov-lista" aria-busy="true">
          {[0, 1, 2].map((i) => <li key={i} className="pnl-nov-esqueleto" />)}
        </ul>
      ) : !estado.items.length ? (
        <p className="pnl-nov-vacio">
          <Icono nombre="reloj" size={16} />
          Sin novedades por ahora. Cuando tu asesor revise algo o te escriba, lo verás aquí.
        </p>
      ) : (
        <>
          <ul className="pnl-nov-lista">
            {lista.map((n, i) => {
              const nueva = Date.parse(n.fecha) > desde;
              return (
                <li key={n.clave || `${n.tipo}-${n.fecha}-${i}`} style={{ "--i": i }}>
                  <button
                    type="button"
                    className="pnl-nov-item ux-tap"
                    data-tono={TONO[n.tipo] || "info"}
                    data-nueva={nueva ? "1" : undefined}
                    onClick={() => ir(n)}
                  >
                    <span className="pnl-nov-icono" aria-hidden="true">
                      <Icono nombre={ICONO[n.tipo] || "documento"} size={16} />
                    </span>
                    <span className="pnl-nov-texto">
                      <span className="pnl-nov-linea">
                        <b>{n.titulo}</b>
                        {nueva && <span className="pnl-nov-badge">Nuevo</span>}
                      </span>
                      {n.detalle && <span className="pnl-nov-detalle">{n.detalle}</span>}
                    </span>
                    <time className="pnl-nov-fecha" dateTime={n.fecha} title={fechaHoraDoble(n.fecha)}>
                      {haceCuanto(n.fecha)}
                    </time>
                  </button>
                </li>
              );
            })}
          </ul>
          {estado.items.length > VISIBLES && (
            <button type="button" className="pnl-btn pnl-nov-mas" onClick={() => setAbiertoEn(abierto ? null : idSolicitud)} aria-expanded={abierto}>
              {abierto ? "Ver menos" : `Ver todo (${estado.items.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}
