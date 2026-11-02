// «Avisar a mi asesor»: ya subí lo mío, revísenlo.
//
// Estancia y modificatoria lo tenían y el máster no: el asesorado subía sus
// documentos y no había forma de decir «ya está» salvo escribir por fuera.
import { useState } from "react";
import { apiPOST } from "../../../../../services/api";
import IconoPaso from "../../../../../components/common/IconoPaso";

function fechaLarga(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export default function PedirRevisionMaster({ idSolicitud, subidos, revisionSolicitadaAt, onHecho }) {
  const [abierto, setAbierto] = useState(false);
  const [nota, setNota] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function pedir() {
    setEnviando(true); setMsg("");
    try {
      const r = await apiPOST(`/solicitudes/${idSolicitud}/solicitar-revision`, { nota });
      setMsg(r?.msg || (r?.ok ? "Avisado." : "No se pudo avisar."));
      if (r?.ok) { setAbierto(false); setNota(""); onHecho?.(); }
    } catch {
      setMsg("No se pudo avisar. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  if (!subidos) return null;

  return (
    <div className="pnl-aviso pnl-aviso-bloque pnl-revision mt-4" data-tono="info">
      <span className="pnl-aviso-icono"><IconoPaso nombre="eye" /></span>
      <div className="min-w-0">
      {revisionSolicitadaAt ? (
        <p className="pnl-aviso-texto">
          <b>Tu asesor ya sabe que has subido documentos</b> — se lo
          dijiste el {fechaLarga(revisionSolicitadaAt)}. Los está revisando y te dirá si falta algo.
          Si subes más, puedes volver a avisarle.
          <button type="button" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}
            className="pnl-btn-texto pnl-revision-enlace" data-talla="s">
            {abierto ? "Cancelar" : "Avisar otra vez"}
          </button>
        </p>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="pnl-aviso-texto min-w-0 flex-1">
            <b>¿Ya subiste todo lo que tienes?</b> Avisa a tu asesor para
            que lo revise.
          </p>
          <button type="button" onClick={() => setAbierto(true)} aria-expanded={false}
            className="pnl-btn-primario shrink-0" data-talla="s">
            Avisar a mi asesor
          </button>
        </div>
      ) : null}

      {abierto && (
        <div className="pnl-revision-form">
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="¿Algo que debamos saber? (opcional)"
            className="pnl-campo-control" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando}
              className="pnl-btn-primario" data-talla="s">
              {enviando ? "Avisando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="pnl-btn-texto" data-talla="s">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="pnl-revision-msg">{msg}</p>}
      </div>
    </div>
  );
}
