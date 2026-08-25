// Sube al expediente un documento que el cliente verá terminado.
//
// El cliente nunca ve los generadores: ve el archivo que el asesor sube aquí,
// ya revisado. Eso deja la decisión de "esto está listo para entregarse" en
// manos del asesor, en vez de publicar automáticamente cualquier borrador.
import { useRef, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

export default function VisaSubirDocumento({ idSolicitud, slot, titulo, pista, documento, onCambio }) {
  const [subiendo, setSubiendo] = useState(false);
  const [msg, setMsg] = useState("");
  const inputRef = useRef(null);

  function token() {
    return localStorage.getItem("bo_token");
  }

  async function subir(archivo) {
    if (!archivo) return;
    setSubiendo(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      const r = await fetch(`${API_URL}/backoffice/solicitudes/${idSolicitud}/visa-documentos/${slot}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.ok === false) throw new Error(data.msg || "No se pudo subir");
      setMsg("Subido. El cliente ya puede descargarlo.");
      onCambio?.();
    } catch (e) {
      setMsg(e.message || "Error al subir");
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function quitar() {
    setSubiendo(true);
    setMsg("");
    try {
      const r = await fetch(`${API_URL}/backoffice/solicitudes/${idSolicitud}/visa-documentos/${slot}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!r.ok) throw new Error("No se pudo quitar");
      setMsg("Quitado. El cliente ya no lo ve.");
      onCambio?.();
    } catch (e) {
      setMsg(e.message || "Error al quitar");
    } finally {
      setSubiendo(false);
    }
  }

  async function descargar() {
    try {
      const r = await fetch(`${API_URL}/backoffice/solicitudes/${idSolicitud}/visa-documentos/${slot}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!r.ok) throw new Error("No se pudo descargar");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = documento?.nombre || "documento";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setMsg(e.message || "Error al descargar");
    }
  }

  return (
    <div className={`rounded-xl border px-4 py-3 ${documento ? "border-emerald-200 bg-emerald-50/50" : "border-dashed border-neutral-300 bg-neutral-50"}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">{titulo}</p>

      {documento ? (
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="text-[13px] font-semibold text-[#1D6A4A] min-w-0 truncate">
            ✓ {documento.nombre}
          </span>
          <button type="button" onClick={descargar}
            className="text-[11.5px] font-semibold text-[#046C8C] hover:underline">Descargar</button>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={subiendo}
            className="text-[11.5px] font-semibold text-neutral-500 hover:text-[#1D6A4A] disabled:opacity-50">Reemplazar</button>
          <button type="button" onClick={quitar} disabled={subiendo}
            className="text-[11.5px] font-semibold text-neutral-400 hover:text-red-600 disabled:opacity-50">Quitar</button>
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap mt-1">
          <p className="text-[12.5px] text-neutral-500 flex-1 min-w-0">{pista}</p>
          <button
            type="button" onClick={() => inputRef.current?.click()} disabled={subiendo}
            className="shrink-0 text-[12px] font-semibold px-4 py-1.5 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition-colors"
          >
            {subiendo ? "Subiendo…" : "Subir archivo"}
          </button>
        </div>
      )}

      <input
        ref={inputRef} type="file" className="hidden"
        accept="application/pdf,.doc,.docx,image/*"
        onChange={(e) => subir(e.target.files?.[0])}
      />

      {msg && <p className="text-[11.5px] text-neutral-500 mt-1.5">{msg}</p>}
    </div>
  );
}
