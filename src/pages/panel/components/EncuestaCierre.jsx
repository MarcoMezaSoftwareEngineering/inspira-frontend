// «Cuéntanos cómo te fue»: la encuesta al cerrar un proceso (18/09/2026).
//
// Sale cuando el equipo cierra un proceso con buen resultado (o archiva el
// cierre del máster). Cuatro cosas: la nota de 1 a 5, un comentario, si
// podemos publicarlo y si quiere que le contactemos para otro servicio.
//
// Servidor: GET/POST /cierre-master/panel/solicitudes/:id/encuesta-cierre
// (encuestaCierre.service.js). Se guarda en datos_panel.encuesta_cierre, la
// misma que la del máster: si ese expediente ya la tiene en su paso 6
// (`via_master`), aquí no se repite.
//
// En Inicio va una por cada proceso cerrado sin responder (EncuestasPendientes);
// dentro del expediente, la suya, respondida o no.
import { useEffect, useRef, useState } from "react";
import Icono from "../../../components/common/Icono";
import { apiGET, apiPOST } from "../../../services/api";
import { fechaCorta } from "../../../lib/horas";
import { recorta } from "../pendientes";

const url = (id) => `/cierre-master/panel/solicitudes/${id}/encuesta-cierre`;
const CARAS = ["", "Mal", "Regular", "Bien", "Muy bien", "Excelente"];

function Estrellas({ valor, onChange }) {
  return (
    <div className="pnl-enc-estrellas" role="radiogroup" aria-label="Puntuación de 1 a 5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} de 5: ${CARAS[n]}`}
          className="pnl-enc-estrella ux-tap"
          data-on={valor && n <= valor ? "1" : "0"}
          onClick={() => onChange(n)}
        >
          <Icono nombre="estrella" size={24} />
        </button>
      ))}
      <span className="pnl-enc-cara" aria-hidden="true">{valor ? CARAS[valor] : "Toca una estrella"}</span>
    </div>
  );
}

/** Pedir la reseña de Google, solo a quien puntuó 4 o 5. */
function Resena({ href }) {
  return (
    <div className="pnl-enc-resena">
      <p><b>¿Nos ayudas con una reseña en Google?</b> Es lo que más ayuda a otras personas a encontrarnos. Un minuto.</p>
      <a href={href} target="_blank" rel="noopener noreferrer" className="pnl-btn-cta ux-tap">
        <Icono nombre="estrella" size={15} />
        Dejar reseña en Google
      </a>
    </div>
  );
}

/**
 * @param {{ idSolicitud: number, servicio?: string|null, soloPendiente?: boolean, destacada?: boolean }} props
 * `soloPendiente`: en Inicio no se pinta si ya la respondió antes de entrar.
 */
export default function EncuestaCierre({ idSolicitud, servicio = null, soloPendiente = false, destacada = false }) {
  const [datos, setDatos] = useState(null); // respuesta del GET
  const [editando, setEditando] = useState(false);
  const [f, setF] = useState({ general: null, comentario: "", autoriza_publicar: false, quiere_contacto: false });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [recienEnviada, setRecienEnviada] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let vivo = true;
    apiGET(url(idSolicitud))
      .then((r) => {
        if (!vivo || !r?.ok) return;
        setDatos(r);
        if (r.encuesta) {
          setF({
            general: r.encuesta.general, comentario: r.encuesta.comentario || "",
            autoriza_publicar: Boolean(r.encuesta.autoriza_publicar), quiere_contacto: Boolean(r.encuesta.quiere_contacto),
          });
        }
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, [idSolicitud]);

  // Desde el correo (/panel?encuesta=ID) se baja hasta ella.
  useEffect(() => {
    if (destacada && datos && ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [destacada, datos]);

  if (!datos || !datos.disponible || datos.via_master) return null;
  if (soloPendiente && datos.encuesta && !recienEnviada && !editando) return null;

  async function enviar(e) {
    e.preventDefault();
    if (!f.general || guardando) return;
    setGuardando(true);
    setError("");
    try {
      const r = await apiPOST(url(idSolicitud), f);
      if (!r?.ok) throw new Error(r?.msg || "No se pudo enviar. Inténtalo de nuevo.");
      setDatos((d) => ({ ...d, encuesta: r.encuesta, resena_url: r.resena_url || d.resena_url }));
      setEditando(false);
      setRecienEnviada(true);
    } catch (err) {
      setError(err.message || "No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  const enc = datos.encuesta;
  const formulario = !enc || editando;

  return (
    <section ref={ref} className="pnl-enc" data-destacada={destacada ? "1" : undefined} aria-labelledby={`pnl-enc-t-${idSolicitud}`}>
      <header className="pnl-enc-cab">
        <span className="pnl-enc-icono" aria-hidden="true"><Icono nombre="trofeo" size={18} /></span>
        <div className="min-w-0">
          <h2 id={`pnl-enc-t-${idSolicitud}`}>{formulario ? "Cuéntanos cómo te fue" : "Gracias por contarnos cómo te fue"}</h2>
          {servicio && <p className="pnl-enc-servicio">{recorta(servicio, 60)}</p>}
        </div>
      </header>

      {formulario ? (
        <form className="pnl-enc-form" onSubmit={enviar}>
          <p className="pnl-enc-lead">Un minuto. Nos ayuda a mejorar y solo publicamos tu opinión, sin tu nombre completo, si nos dejas.</p>
          <Estrellas valor={f.general} onChange={(v) => setF({ ...f, general: v })} />
          <label className="pnl-enc-campo">
            <span>Tu comentario (opcional)</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={f.comentario}
              placeholder="Lo que más te ayudó, lo que mejorarías…"
              onChange={(e) => setF({ ...f, comentario: e.target.value })}
            />
          </label>
          <label className="pnl-enc-check">
            <input type="checkbox" checked={f.autoriza_publicar} onChange={(e) => setF({ ...f, autoriza_publicar: e.target.checked })} />
            <span>Autorizo que publiquen mi opinión, sin mi nombre completo.</span>
          </label>
          <label className="pnl-enc-check">
            <input type="checkbox" checked={f.quiere_contacto} onChange={(e) => setF({ ...f, quiere_contacto: e.target.checked })} />
            <span>Quiero que me contacten para otro servicio.</span>
          </label>
          {error && <p className="pnl-error">{error}</p>}
          <div className="pnl-enc-botones">
            <button type="submit" className="pnl-btn-cta ux-tap" disabled={!f.general || guardando}>
              {guardando ? "Enviando…" : enc ? "Guardar cambios" : "Enviar"}
            </button>
            {enc && <button type="button" className="pnl-btn ux-tap" onClick={() => setEditando(false)}>Cancelar</button>}
          </div>
        </form>
      ) : (
        <div className="pnl-enc-hecha">
          <p className="pnl-enc-lead">
            Nos diste {enc.general} de 5{enc.enviada_at ? ` el ${fechaCorta(enc.editada_at || enc.enviada_at)}` : ""}.
            {enc.quiere_contacto ? " Tu asesor te escribirá para contarte otros servicios." : ""}
          </p>
          {enc.general >= 4 && datos.resena_url && <Resena href={datos.resena_url} />}
          <button type="button" className="pnl-btn ux-tap" onClick={() => setEditando(true)}>Cambiar mis respuestas</button>
        </div>
      )}
    </section>
  );
}

/** En Inicio: una tarjeta por cada proceso cerrado cuya encuesta falta. */
export function EncuestasPendientes({ servicios }) {
  const destacada = Number(new URLSearchParams(window.location.search).get("encuesta")) || null;
  const lista = (servicios || []).filter((s) => !s.invitado && s.encuesta_cierre?.disponible && !s.encuesta_cierre?.via_master
    && (!s.encuesta_cierre?.respondida || Number(s.id_solicitud) === destacada));
  if (!lista.length) return null;
  return (
    <div className="space-y-3">
      {lista.map((s) => (
        <EncuestaCierre
          key={s.id_solicitud}
          idSolicitud={s.id_solicitud}
          servicio={s.titulo}
          soloPendiente={Number(s.id_solicitud) !== destacada}
          destacada={Number(s.id_solicitud) === destacada}
        />
      ))}
    </div>
  );
}
