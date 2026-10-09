import { useState } from "react";
import { boPATCH } from "../../../../../../services/backofficeApi";
import { input } from "./constantes";

/**
 * Un registro sin clasificar.
 *
 * Lo dejo la letrada en la carpeta de Drive y el vigilante lo anoto, pero
 * nadie le ha dicho todavia al asesorado que existe: de un nombre de archivo
 * no se saca si es una resolucion favorable o un requerimiento con diez dias
 * corriendo, y el aviso vale por esa diferencia.
 */
export function SinClasificar({ id, r, onCambio }) {
  const [f, setF] = useState({
    tipo: "NOTIFICACION", titulo: r.titulo, fecha: "", plazo: "",
  });
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function guardar() {
    setEnviando(true); setMsg("");
    const resp = await boPATCH(
      `/backoffice/solicitudes/${id}/estancia/extranjeria/${r.id_registro}`,
      { ...f, avisar },
    );
    setEnviando(false);
    if (resp?.ok) { onCambio(); } else { setMsg(resp?.msg || "No se pudo guardar"); }
  }

  return (
    <div className="border-2 border-amber-300 bg-amber-50/50 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border
          bg-amber-100 text-amber-800 border-amber-300">sin clasificar</span>
        <span className="text-[12.5px] font-semibold text-neutral-800 min-w-0 flex-1 truncate">
          {r.titulo}
        </span>
      </div>
      <p className="text-[11.5px] text-neutral-600 leading-relaxed mb-2">
        Apareció en la carpeta de Drive y no lo subió el portal. Al asesorado
        <b> todavía no se le ha dicho nada</b>.
      </p>

      <div className="flex flex-wrap gap-2 mb-2">
        <select className={input} value={f.tipo}
          onChange={(e) => setF({ ...f, tipo: e.target.value })}>
          <option value="REQUERIMIENTO">Requerimiento</option>
          <option value="TASA">Solicitud de tasa</option>
          <option value="NOTIFICACION">Notificación</option>
          <option value="RESOLUCION">Resolución</option>
        </select>
        <input className={`${input} flex-1 min-w-[150px]`} placeholder="Título"
          value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Fecha del documento
          <input type="date" className={input} value={f.fecha}
            onChange={(e) => setF({ ...f, fecha: e.target.value })} />
        </label>
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-500">
          Plazo para responder
          <input type="date" className={input} value={f.plazo}
            onChange={(e) => setF({ ...f, plazo: e.target.value })} />
        </label>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-[11.5px] text-neutral-600">
          <input type="checkbox" checked={avisar} className="accent-[#1D6A4A]"
            onChange={(e) => setAvisar(e.target.checked)} />
          Avisar al asesorado
        </label>
        <button type="button" onClick={guardar} disabled={enviando}
          className="text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1D6A4A]
            text-white hover:opacity-90 disabled:opacity-40">
          {enviando ? "…" : "Clasificar y avisar"}
        </button>
        {msg && <span className="text-[11.5px] text-red-600">{msg}</span>}
      </div>
    </div>
  );
}
