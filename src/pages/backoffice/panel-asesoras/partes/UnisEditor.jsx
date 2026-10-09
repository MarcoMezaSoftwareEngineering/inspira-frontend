// src/pages/backoffice/panel-asesoras/partes/UnisEditor.jsx
import { useState } from "react";
import { boPOST, boDELETE } from "../../../../services/backofficeApi";
import { UNI_EST } from "./constantes";

/* ═══════════════════════════════════════════════════════════════════════════
   UNIS EDITOR — edición en tiempo real de postulaciones de máster
═══════════════════════════════════════════════════════════════════════════ */
export function UnisEditor({ unis, solicitudId, onAddLocal, onRem, onSet }) {
  const [busy, setBusy] = useState(false);

  async function addUni() {
    setBusy(true);
    try {
      const r = await boPOST(`/backoffice/panel-asesoras/${solicitudId}/portales`, { u: "Nueva universidad", est: "PENDIENTE" });
      if (r.ok) {
        onAddLocal({ _idAcceso: r._idAcceso, u: "Nueva universidad", master: "", fPost: "", fResult: "", est: "PENDIENTE" });
      }
    } finally { setBusy(false); }
  }

  async function deleteUni(uni, i) {
    if (uni._idAcceso) {
      setBusy(true);
      try {
        await boDELETE(`/backoffice/panel-asesoras/portales/${uni._idAcceso}`);
        onRem(i);
      } finally { setBusy(false); }
    } else {
      onRem(i);
    }
  }

  const inp = "w-full border border-neutral-200 rounded px-1.5 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";

  return (
    <div>
      <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1.5">
        Universidades <span className="font-normal normal-case text-neutral-300">(agregar/eliminar se aplica al instante)</span>
      </div>
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        <table className="w-full text-[11px] border-collapse">
          <thead className="bg-neutral-50">
            <tr className="text-[10px] text-neutral-400">
              {["Universidad","Máster específico","F. postulación","F. resultados","Estado",""].map(h => (
                <th key={h} className="text-left px-2 py-1.5 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {unis.map((u, i) => (
              <tr key={u._idAcceso || i} className="border-t border-neutral-100">
                <td className="px-2 py-1"><input className={inp} value={u.u} onChange={e => onSet(i,"u",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.master} onChange={e => onSet(i,"master",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fPost} onChange={e => onSet(i,"fPost",e.target.value)} /></td>
                <td className="px-2 py-1"><input className={inp} value={u.fResult} onChange={e => onSet(i,"fResult",e.target.value)} /></td>
                <td className="px-2 py-1">
                  <select className={inp} value={u.est} onChange={e => onSet(i,"est",e.target.value)}>
                    {UNI_EST.map(e => <option key={e}>{e}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1">
                  <button onClick={() => deleteUni(u, i)} disabled={busy}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-2 py-1.5 border-t border-neutral-100">
          <button onClick={addUni} disabled={busy}
            className="text-[11px] text-neutral-500 hover:text-neutral-700 disabled:opacity-40">
            {busy ? "…" : "+ agregar universidad"}
          </button>
        </div>
      </div>
    </div>
  );
}
