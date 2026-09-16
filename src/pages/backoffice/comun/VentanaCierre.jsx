// Ventana de cierre: resultado, nota y confirmación de lo que queda abierto.
import { useState } from "react";

export default function VentanaCierre({ avisos, resultados, onFin }) {
  const [resultado, setResultado] = useState("");
  const [nota, setNota] = useState("");
  const [confirmar, setConfirmar] = useState(!avisos.length);
  return (
    <div className="fixed inset-0 z-[90] bg-[#011c26]/60 grid place-items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-4 space-y-3 shadow-2xl">
        <p className="text-[16px] font-semibold text-[#1A3557]">Finalizar el proceso</p>
        {avisos.length > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">Queda abierto</p>
            <ul className="text-[12.5px] text-amber-900 list-disc pl-4 space-y-0.5">{avisos.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
        )}
        <label className="block">
          <span className="text-[11.5px] font-semibold text-neutral-600">Resultado</span>
          <select value={resultado} onChange={(e) => setResultado(e.target.value)}
            className="mt-1 w-full text-[13px] border border-neutral-300 rounded-xl px-3 py-2.5 bg-white">
            <option value="">Elegir…</option>
            {resultados.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[11.5px] font-semibold text-neutral-600">Nota (opcional)</span>
          <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)}
            className="mt-1 w-full text-[13px] border border-neutral-300 rounded-xl px-3 py-2" />
        </label>
        {avisos.length > 0 && (
          <label className="flex items-start gap-2 text-[12.5px] text-neutral-700">
            <input type="checkbox" checked={confirmar} onChange={(e) => setConfirmar(e.target.checked)} className="mt-0.5" />
            Cerrar igualmente, sabiendo lo que queda abierto
          </label>
        )}
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={() => onFin(null)} className="text-[13px] font-semibold px-4 py-2 rounded-xl text-neutral-600">Cancelar</button>
          <button type="button" disabled={!resultado || !confirmar} onClick={() => onFin({ resultado, nota, confirmar: true })}
            className="text-[13px] font-bold px-4 py-2 rounded-xl bg-[#1D6A4A] text-white disabled:opacity-40">Finalizar</button>
        </div>
      </div>
    </div>
  );
}
