// src/components/common/DocumentosProceso.jsx
//
// Documentos del proceso: carta de admisión, matrícula, resoluciones,
// comprobantes. Los que se GENERAN durante el trámite, no los que el cliente
// tiene que entregar.
//
// Van deliberadamente aparte del checklist: mezclarlos con lo pendiente hace
// que se pierdan justo los documentos que más importa encontrar meses después.
//
// El mismo componente sirve a los dos paneles: el asesor sube y borra, el
// cliente sólo descarga.
import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

function fecha(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

function peso(bytes) {
  if (!bytes) return "";
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
}

function icono(mime) {
  const m = (mime || "").toLowerCase();
  if (m.includes("pdf")) return "📕";
  if (m.includes("image")) return "🖼️";
  if (m.includes("word") || m.includes("document")) return "📘";
  return "📄";
}

export default function DocumentosProceso({ idSolicitud, modo = "cliente" }) {
  const esAsesor = modo === "asesor";

  const [docs, setDocs] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState("CARTA_ADMISION");
  const [msg, setMsg] = useState("");

  const token = useCallback(
    () => localStorage.getItem(esAsesor ? "bo_token" : "token"),
    [esAsesor]
  );

  const cargar = useCallback(async () => {
    const ruta = esAsesor
      ? `/portales/admin/solicitudes/${idSolicitud}/documentos-proceso`
      : `/portales/panel/solicitudes/${idSolicitud}/documentos-proceso`;
    try {
      const r = await fetch(API_URL + ruta, { headers: { Authorization: `Bearer ${token()}` } });
      const data = await r.json().catch(() => ({}));
      if (data.ok) {
        setDocs(data.documentos || []);
        if (data.tipos) setTipos(data.tipos);
      }
    } catch {
      setMsg("No se pudieron cargar los documentos.");
    } finally {
      setCargando(false);
    }
  }, [idSolicitud, esAsesor, token]);

  useEffect(() => { cargar(); }, [cargar]);

  async function subir(archivo) {
    if (!archivo) return;
    setSubiendo(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("archivo", archivo);
      fd.append("tipo", tipoNuevo);
      const r = await fetch(`${API_URL}/portales/admin/solicitudes/${idSolicitud}/documentos-proceso`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: fd,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.ok === false) throw new Error(data.msg || "No se pudo subir");
      await cargar();
    } catch (e) {
      setMsg(e.message || "Error al subir");
    } finally {
      setSubiendo(false);
    }
  }

  async function borrar(id) {
    const r = await fetch(`${API_URL}/portales/admin/documentos-proceso/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token()}` },
    });
    if (r.ok) cargar();
    else setMsg("No se pudo borrar");
  }

  // La descarga va con token, así que no basta un <a href>.
  async function descargar(doc) {
    try {
      const r = await fetch(`${API_URL}/portales/justificantes/${doc.id_justificante}/descargar`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (!r.ok) throw new Error("No se pudo descargar");
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nombre_archivo || "documento";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setMsg(e.message || "Error al descargar");
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A]">
          📄 Documentos del proceso
        </p>
        <p className="text-[12px] text-neutral-500 mt-1 leading-relaxed">
          {esAsesor
            ? "Lo que se genera durante el trámite: carta de admisión, matrícula, resoluciones. No se mezcla con el checklist del cliente."
            : "Los documentos que Inspira ha ido consiguiendo en tu proceso. Aquí quedan guardados para que los tengas siempre a mano."}
        </p>
      </div>

      {esAsesor && (
        <div className="flex items-end gap-2 flex-wrap rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-3">
          <div className="min-w-0 flex-1">
            <label className="block text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1">
              Tipo de documento
            </label>
            <select
              value={tipoNuevo} onChange={(e) => setTipoNuevo(e.target.value)}
              className="w-full text-[12.5px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white"
            >
              {(tipos.length ? tipos : [{ valor: "CARTA_ADMISION", etiqueta: "Carta de admisión" }])
                .map((t) => <option key={t.valor} value={t.valor}>{t.etiqueta}</option>)}
            </select>
          </div>
          <label className={`shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors ${
            subiendo ? "bg-neutral-300 text-white" : "bg-[#1D6A4A] text-white hover:bg-[#15533a]"
          }`}>
            {subiendo ? "Subiendo…" : "Subir documento"}
            <input
              type="file" className="hidden" disabled={subiendo}
              accept="application/pdf,.doc,.docx,image/*"
              onChange={(e) => { subir(e.target.files?.[0]); e.target.value = ""; }}
            />
          </label>
        </div>
      )}

      {cargando ? (
        <p className="text-[12px] text-neutral-400">Cargando…</p>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-7 border-2 border-dashed border-neutral-200 rounded-xl text-center">
          <span className="text-2xl">📄</span>
          <p className="text-[13px] font-semibold text-neutral-600">Todavía no hay documentos</p>
          <p className="text-[11.5px] text-neutral-400 max-w-[300px] leading-snug">
            {esAsesor
              ? "Sube aquí la carta de admisión y la matrícula en cuanto lleguen."
              : "Cuando lleguen tu carta de admisión o tu matrícula, aparecerán aquí."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id_justificante}
              className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-3 py-2.5">
              <span className="shrink-0 text-xl">{icono(d.mime_type)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-neutral-800 truncate">{d.etiqueta}</p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {d.nombre_archivo}
                  {d.fecha_subida && ` · ${fecha(d.fecha_subida)}`}
                  {d.tamano_bytes ? ` · ${peso(d.tamano_bytes)}` : ""}
                  {esAsesor && d.origen_portal ? ` · desde ${d.origen_portal}` : ""}
                </p>
                {esAsesor && !d.visible_para_cliente && (
                  <p className="text-[10.5px] font-semibold text-amber-700 mt-0.5">Oculto para el cliente</p>
                )}
              </div>
              <button
                type="button" onClick={() => descargar(d)}
                className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-lg border-2 border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#1D6A4A] hover:text-white transition-all"
              >
                Descargar
              </button>
              {esAsesor && (
                <button
                  type="button" onClick={() => borrar(d.id_justificante)}
                  className="shrink-0 text-[11px] font-semibold text-neutral-300 hover:text-red-600 transition-colors"
                >
                  Borrar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {msg && <p className="text-[11.5px] text-red-600">{msg}</p>}
    </div>
  );
}
