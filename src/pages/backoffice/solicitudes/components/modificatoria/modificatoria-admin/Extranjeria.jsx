/* ── 3 · Extranjería ─────────────────────────────────────────────────────── */

import { useState } from "react";
import { boFetch } from "../../../../../../services/backofficeApi";
import { abrirArchivo } from "../../../../../../services/archivos";
import Cabecera from "./Cabecera";
import { TONOS, input } from "./constantes";

export default function Extranjeria({ id, registros, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const [f, setF] = useState({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
  const [archivo, setArchivo] = useState(null);
  const [avisar, setAvisar] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState("");

  async function registrar() {
    setEnviando(true); setMsg("");
    const datos = new FormData();
    Object.entries(f).forEach(([k, v]) => v && datos.append(k, v));
    datos.append("avisar", avisar ? "true" : "false");
    if (archivo) datos.append("archivo", archivo);
    const r = await boFetch(`/backoffice/solicitudes/${id}/modificatoria/extranjeria`, {
      method: "POST", body: datos,
    });
    const j = await r?.json().catch(() => null);
    setEnviando(false);
    setMsg(j?.msg || (j?.ok ? "Registrado" : "No se pudo registrar"));
    if (j?.ok) {
      setF({ tipo: "REQUERIMIENTO", titulo: "", detalle: "", fecha: "", plazo: "" });
      setArchivo(null); setAbierto(false); onCambio();
    }
  }

  return (
    <div id="bloque-extranjeria" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <Cabecera numero="5" titulo="Extranjería"
        extra={
          <button type="button" onClick={() => setAbierto((v) => !v)}
            className="ml-auto text-[11.5px] font-semibold text-[#023A4B] hover:underline">
            {abierto ? "Cancelar" : "+ Registrar comunicación"}
          </button>
        } />

      {abierto && (
        <div className="border border-dashed border-[#023A4B]/30 rounded-xl p-3 mb-3 space-y-2">
          <div className="flex flex-wrap gap-2">
            <select className={input} value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })}>
              <option value="REQUERIMIENTO">Requerimiento</option>
              <option value="TASA">Solicitud de tasa</option>
              <option value="NOTIFICACION">Notificación</option>
              <option value="RESOLUCION">Resolución</option>
            </select>
            <input className={`${input} flex-1 min-w-[160px]`} placeholder="Título"
              value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
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
          <textarea rows={2} className={`${input} w-full`} placeholder="Detalle para el cliente…"
            value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} />
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`${input} cursor-pointer ${archivo ? "border-[#1D6A4A] text-[#1D6A4A] font-semibold" : "text-neutral-500"}`}>
              {archivo ? `✓ ${archivo.name.slice(0, 24)}` : "📎 Adjuntar documento"}
              <input type="file" className="hidden" accept="application/pdf,image/*"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
            </label>
            <label className="flex items-center gap-1.5 text-[12px] text-neutral-600">
              <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
              Avisar al cliente por correo
            </label>
            <button type="button" onClick={registrar} disabled={enviando || !f.titulo.trim()}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-[#1D6A4A] text-white disabled:opacity-40">
              {enviando ? "…" : "Registrar"}
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            El aviso va por defecto: los plazos de subsanación se cuentan desde la
            notificación y enterarse tarde cuesta el expediente.
          </p>
        </div>
      )}

      {msg && <p className="text-[11.5px] text-neutral-600 mb-2">{msg}</p>}

      {registros.length === 0 ? (
        <p className="text-[12px] text-neutral-400">Sin comunicaciones registradas.</p>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (
            <div key={r.id_registro} className="border border-neutral-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                  r.tipo === "RESOLUCION" ? TONOS.verde : r.tipo === "REQUERIMIENTO" ? TONOS.rojo : TONOS.ambar
                }`}>{r.tipo_label}</span>
                <span className="text-[12.5px] font-semibold text-neutral-800">{r.titulo}</span>
                {r.notificado_at
                  ? <span className="ml-auto text-[10.5px] text-[#1D6A4A]">✓ avisado</span>
                  : <span className="ml-auto text-[10.5px] text-amber-600">sin avisar</span>}
              </div>
              {r.plazo && <p className="text-[11.5px] text-red-700 mt-0.5">Plazo: {r.plazo}</p>}
              {r.tiene_archivo && (
                <button type="button" onClick={() => abrirArchivo(`/backoffice/solicitudes/${id}/modificatoria/extranjeria/${r.id_registro}/archivo`, { interno: true })}
                  className="text-[11px] text-[#046C8C] hover:underline">📄 {r.archivo_nombre}</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
