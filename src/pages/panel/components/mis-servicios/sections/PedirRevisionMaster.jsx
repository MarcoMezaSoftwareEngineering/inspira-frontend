// «Avisar a mi asesor»: ya subí lo mío, revísenlo.
//
// Estancia y modificatoria lo tenían y el máster no: el asesorado subía sus
// documentos y no había forma de decir «ya está» salvo escribir por fuera.
import { useState } from "react";
import { apiPOST } from "../../../../../services/api";

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
    <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3.5">
      {revisionSolicitadaAt ? (
        <p className="text-[12.5px] text-neutral-700 leading-relaxed">
          <b className="text-primary">Tu asesor ya sabe que has subido documentos</b> — se lo
          dijiste el {fechaLarga(revisionSolicitadaAt)}. Los está revisando y te dirá si falta algo.
          Si subes más, puedes volver a avisarle.
          <button type="button" onClick={() => setAbierto((v) => !v)}
            className="ml-2 text-[12px] font-semibold text-primary-light underline">
            {abierto ? "Cancelar" : "Avisar otra vez"}
          </button>
        </p>
      ) : !abierto ? (
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-[12.5px] text-neutral-700 leading-relaxed min-w-0 flex-1">
            <b className="text-primary">¿Ya subiste todo lo que tienes?</b> Avisa a tu asesor para
            que lo revise.
          </p>
          <button type="button" onClick={() => setAbierto(true)}
            className="ux-tap shrink-0 text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90">
            Avisar a mi asesor
          </button>
        </div>
      ) : null}

      {abierto && (
        <div className="space-y-2 mt-2">
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            placeholder="¿Algo que debamos saber? (opcional)"
            className="w-full text-[12.5px] border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          <div className="flex items-center gap-2">
            <button type="button" onClick={pedir} disabled={enviando}
              className="ux-tap text-[12.5px] font-semibold px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-40 hover:opacity-90">
              {enviando ? "Avisando…" : "Enviar"}
            </button>
            <button type="button" onClick={() => setAbierto(false)}
              className="text-[12px] text-neutral-500 hover:text-neutral-800">Cancelar</button>
          </div>
        </div>
      )}
      {msg && <p className="text-[11.5px] text-neutral-600 mt-2">{msg}</p>}
    </div>
  );
}
