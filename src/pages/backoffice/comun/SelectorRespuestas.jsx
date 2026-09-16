// Respuestas guardadas: buscar, ver rellena con los datos del cliente y usar.
//
// Las variables {nombre}, {servicio}, {pendiente}, {fecha} y {asesor} se
// sustituyen con lo que sabe Core del caso (GET /herramientas-asesor/caso).
// Si no hay caso, se dejan a la vista para completarlas a mano.
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { boGET, boPOST } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import { rellenar } from "./rellenar";


export default function SelectorRespuestas({ idSolicitud, variables, onElegir, onCerrar }) {
  const [lista, setLista] = useState(null);
  const [vars, setVars] = useState(variables || {});
  const [q, setQ] = useState("");
  const [elegida, setElegida] = useState(null);
  const [nueva, setNueva] = useState(null);

  useEffect(() => {
    boGET("/backoffice/herramientas-asesor/respuestas").then((r) => setLista(r.ok ? r.respuestas : []));
    if (idSolicitud && !variables) {
      boGET(`/backoffice/herramientas-asesor/caso/${idSolicitud}`).then((r) => r.ok && setVars(r.variables || {}));
    }
  }, [idSolicitud, variables]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (lista || []).filter((r) => !t || `${r.titulo} ${r.categoria} ${r.texto}`.toLowerCase().includes(t));
  }, [lista, q]);

  async function guardarNueva() {
    const r = await boPOST("/backoffice/herramientas-asesor/respuestas", nueva);
    if (!r.ok) { dialog.toast(r.msg || "No se pudo guardar", "error"); return; }
    setLista((l) => [r.respuesta, ...(l || [])]);
    setNueva(null);
    setElegida(r.respuesta);
  }

  const texto = elegida ? rellenar(elegida.texto, vars) : "";

  return createPortal(
    <div className="fixed inset-0 z-[88] bg-[#011c26]/60 grid place-items-end sm:place-items-center sm:p-4" onClick={onCerrar} role="presentation">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl max-h-[88vh] flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6eef5]">
          <p className="flex-1 text-[15px] font-semibold text-[#013446]">Respuestas guardadas</p>
          <button type="button" onClick={() => setNueva({ titulo: "", categoria: "General", texto: "" })}
            className="text-[12.5px] font-semibold text-[#013446] min-h-[36px] px-3 rounded-lg hover:bg-[#e3f0fe]">+ Nueva</button>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="w-9 h-9 rounded-full grid place-items-center text-[#62808f] hover:bg-neutral-100">✕</button>
        </div>

        {nueva ? (
          <div className="p-4 space-y-2.5 overflow-y-auto">
            <input value={nueva.titulo} onChange={(e) => setNueva({ ...nueva, titulo: e.target.value })} placeholder="Título (p. ej. «Falta la apostilla»)"
              className="w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5" />
            <input value={nueva.categoria} onChange={(e) => setNueva({ ...nueva, categoria: e.target.value })} placeholder="Categoría"
              className="w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5" />
            <textarea rows={7} value={nueva.texto} onChange={(e) => setNueva({ ...nueva, texto: e.target.value })}
              placeholder="Estimado/a {nombre}: … (de usted). Variables: {nombre} {servicio} {pendiente} {fecha} {asesor}"
              className="w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setNueva(null)} className="text-[13px] font-semibold px-4 py-2 text-[#62808f]">Cancelar</button>
              <button type="button" onClick={guardarNueva} disabled={!nueva.titulo.trim() || !nueva.texto.trim()}
                className="text-[13px] font-bold px-4 py-2 rounded-xl bg-[#013446] text-white disabled:opacity-40">Guardar</button>
            </div>
          </div>
        ) : elegida ? (
          <div className="p-4 space-y-3 overflow-y-auto">
            <button type="button" onClick={() => setElegida(null)} className="text-[12.5px] font-semibold text-[#013446]">← Todas</button>
            <p className="text-[14px] font-semibold text-[#0d2c3a]">{elegida.titulo}</p>
            <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-[#0d2c3a] bg-[#f4f8fb] rounded-xl p-3">{texto}</p>
            {/\{\w+\}/.test(texto) && <p className="text-[12px] text-[#b9770e]">Quedan datos entre llaves por completar a mano.</p>}
            <button type="button" onClick={() => { boPOST(`/backoffice/herramientas-asesor/respuestas/${elegida.id_respuesta}/uso`, {}); onElegir(texto, elegida); }}
              className="w-full min-h-[46px] rounded-xl bg-[#013446] text-white text-[14px] font-bold">Usar esta respuesta</button>
          </div>
        ) : (
          <>
            <div className="px-4 pt-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar respuesta…" autoFocus
                className="w-full text-[14px] border border-[#d8e4ef] rounded-xl px-3 py-2.5" />
            </div>
            <div className="overflow-y-auto p-2">
              {lista === null ? <p className="p-4 text-[13px] text-[#62808f]">Cargando…</p> : visibles.map((r) => (
                <button key={r.id_respuesta} type="button" onClick={() => setElegida(r)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#f4f8fb]">
                  <span className="flex items-center gap-2">
                    <span className="text-[13.5px] font-semibold text-[#0d2c3a] flex-1 truncate">{r.titulo}</span>
                    <span className="text-[10.5px] font-semibold text-[#62808f] bg-[#eef2f6] rounded-full px-2 py-0.5">{r.categoria}</span>
                  </span>
                  <span className="block text-[12px] text-[#62808f] truncate mt-0.5">{rellenar(r.texto, vars)}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
