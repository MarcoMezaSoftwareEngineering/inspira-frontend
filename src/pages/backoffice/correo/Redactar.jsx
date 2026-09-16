// Escribir un correo nuevo desde Core, con la dirección de salida elegida y
// las respuestas guardadas. Se abre desde el buzón o desde la ficha del
// cliente (con destinatario, proceso y dirección ya puestos).
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import SelectorRespuestas from "../comun/SelectorRespuestas";

export default function Redactar({ para: paraInicial = "", desde: desdeInicial = "", idSolicitud = null, onCerrar, onEnviado }) {
  const [direcciones, setDirecciones] = useState([]);
  const [para, setPara] = useState(paraInicial);
  const [desde, setDesde] = useState(desdeInicial);
  const [asunto, setAsunto] = useState("");
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [plantillas, setPlantillas] = useState(false);

  useEffect(() => {
    boGET("/backoffice/correo/buzones").then((r) => r.ok && setDirecciones(r.direcciones || []));
  }, []);

  async function enviar() {
    setEnviando(true);
    const r = await boPOST("/backoffice/correo/enviar", { para, asunto, texto, desde, id_solicitud: idSolicitud });
    setEnviando(false);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo enviar", "error"); return; }
    dialog.toast("Correo enviado", "success");
    onEnviado?.();
    onCerrar?.();
  }

  const campo = "w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-4 focus:ring-[#013446]/10";

  return createPortal(
    <div className="fixed inset-0 z-[86] bg-[#011c26]/60 grid place-items-end sm:place-items-center sm:p-4" onClick={onCerrar} role="presentation">
      <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6eef5]">
          <p className="flex-1 text-[15px] font-semibold text-[#013446]">Nuevo correo</p>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full grid place-items-center text-[#62808f] hover:bg-neutral-100">✕</button>
        </div>
        <div className="p-4 space-y-2.5 overflow-y-auto">
          <select value={desde} onChange={(e) => setDesde(e.target.value)} className={campo}>
            <option value="">Desde: administracion@ (principal)</option>
            {direcciones.filter((d) => !d.principal).map((d) => <option key={d.correo} value={d.correo}>Desde: {d.nombre || d.correo}</option>)}
          </select>
          <input type="email" value={para} onChange={(e) => setPara(e.target.value)} placeholder="Para: correo@ejemplo.com" className={campo} />
          <input value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Asunto" className={campo} />
          <div className="flex justify-end">
            <button type="button" onClick={() => setPlantillas(true)} className="text-[12.5px] font-semibold text-[#013446] border border-[#d8e4ef] rounded-lg px-3 py-1.5">Respuestas guardadas</button>
          </div>
          <textarea rows={9} value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Estimado/a …: (de usted). La firma se añade sola." className={campo} />
        </div>
        <div className="p-4 border-t border-[#e6eef5]" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <button type="button" onClick={enviar} disabled={enviando || !para.trim() || !asunto.trim() || !texto.trim()}
            className="w-full min-h-[46px] rounded-xl bg-[#013446] text-white text-[14px] font-bold disabled:opacity-40">
            {enviando ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
      {plantillas && (
        <SelectorRespuestas idSolicitud={idSolicitud} onCerrar={() => setPlantillas(false)}
          onElegir={(t, r) => { setTexto((x) => (x ? `${x}\n\n${t}` : t)); if (!asunto && r?.titulo) setAsunto(r.titulo); setPlantillas(false); }} />
      )}
    </div>,
    document.body,
  );
}
