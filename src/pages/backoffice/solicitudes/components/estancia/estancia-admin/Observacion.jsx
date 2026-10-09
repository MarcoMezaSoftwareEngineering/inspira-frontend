import { useState } from "react";
import { boPATCH, boDELETE } from "../../../../../../services/backofficeApi";
import { dialog } from "../../../../../../services/dialogService";
import { input } from "./constantes";

/**
 * Una observación del documento.
 *
 * Van de una en una y no como un texto corrido porque son cosas distintas que
 * corregir, y porque el asesor tiene que poder arreglar la redacción de una sin
 * borrar las demás —antes, para cambiar una coma había que aprobar el documento
 * y volver a observarlo—.
 *
 * El punto ámbar dice que aún no ha salido hacia el asesorado.
 */
export function Observacion({ id, obs, onCambio }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(obs.texto);
  const [ocupado, setOcupado] = useState(false);

  async function guardar() {
    const limpio = texto.trim();
    if (!limpio || limpio === obs.texto) { setEditando(false); setTexto(obs.texto); return; }
    setOcupado(true);
    const r = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/observaciones/${obs.id_observacion}`,
      { texto: limpio },
    );
    setOcupado(false);
    if (r?.ok) { setEditando(false); onCambio(); }
    else dialog.toast(r?.msg || "No se pudo editar la observación", "error");
  }

  async function retirar() {
    if (!(await dialog.confirm("¿Retirar esta observación?"))) return;
    setOcupado(true);
    const r = await boDELETE(
      `/backoffice/solicitudes/${id}/estancia/observaciones/${obs.id_observacion}`,
    );
    setOcupado(false);
    if (r?.ok) onCambio();
    else dialog.toast(r?.msg || "No se pudo retirar la observación", "error");
  }

  if (editando) {
    return (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        <input autoFocus className={`${input} flex-1 min-w-[160px]`}
          value={texto} onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") guardar();
            if (e.key === "Escape") { setEditando(false); setTexto(obs.texto); }
          }} />
        <button type="button" disabled={ocupado || !texto.trim()} onClick={guardar}
          className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg bg-[#1A3557]
            text-white disabled:opacity-40">Guardar</button>
        <button type="button" onClick={() => { setEditando(false); setTexto(obs.texto); }}
          className="text-[11.5px] text-neutral-500 hover:text-neutral-800">cancelar</button>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-1.5 text-[11.5px] text-red-700 bg-red-50
      border border-red-200 rounded-lg px-2 py-1.5 mt-1.5 leading-relaxed">
      {!obs.avisada_at && (
        <span title="Todavía no se le ha comunicado"
          className="shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}
      <span className="flex-1 min-w-0 break-words">{obs.texto}</span>
      <button type="button" onClick={() => setEditando(true)} disabled={ocupado}
        className="shrink-0 text-[11px] text-red-500 hover:text-red-800 disabled:opacity-40">
        editar
      </button>
      <button type="button" onClick={retirar} disabled={ocupado}
        className="shrink-0 text-[11px] text-neutral-400 hover:text-neutral-700 disabled:opacity-40"
        title="Retirar">×</button>
    </div>
  );
}
