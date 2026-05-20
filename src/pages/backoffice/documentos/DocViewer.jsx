// Visor modal de documentos (PDF e imágenes); abre en Drive los demás formatos
import { useEffect, useState } from "react";
import { API_URL, fileIcon, formatBytes, formatDate, descargarDocumento } from "./documentosUtils";

// fetchUrl opcional: sobreescribe la URL de descarga (para informes, justificantes, etc.)
export default function DocViewer({ doc, onClose, fetchUrl, onAprobar, onObservar }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [blobUrl, setBlobUrl] = useState(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [driveError, setDriveError] = useState("");

  const isPdf = doc.mime_type?.includes("pdf");
  const isImage = doc.mime_type?.includes("image");
  const canPreview = isPdf || isImage;

  useEffect(() => {
    if (!canPreview) { setLoading(false); return; }

    let objectUrl = null;
    let cancelled = false;

    async function load() {
      const token = localStorage.getItem("bo_token");
      const url = fetchUrl || `${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`;
      try {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled) return;
        if (!r.ok) { setError("No se pudo cargar el archivo."); setLoading(false); return; }
        const blob = await r.blob();
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setError("Error al cargar el archivo.");
      }
      if (!cancelled) setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id_documento, canPreview, fetchUrl]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleAbrirDrive() {
    setDriveLoading(true);
    setDriveError("");
    try {
      const token = localStorage.getItem("bo_token");
      const r = await fetch(
        `${API_URL}/api/admin/documentos/${doc.id_documento}/drive-url`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await r.json();
      if (!r.ok || !data.ok) {
        setDriveError(data.msg || "No disponible en Drive aún");
      } else {
        window.open(data.url, "_blank");
      }
    } catch {
      setDriveError("Error al obtener URL de Drive");
    }
    setDriveLoading(false);
  }

  if (!canPreview) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-5xl mb-4">{fileIcon(doc.mime_type)}</div>
          <p className="text-sm font-medium text-neutral-800 mb-1 truncate px-2">{doc.nombre_original}</p>
          <p className="text-xs text-neutral-400 mb-6">{formatBytes(doc.tamano_bytes)} · {formatDate(doc.fecha_subida)}</p>
          {driveError && <p className="text-xs text-amber-600 mb-3">{driveError}</p>}
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleAbrirDrive}
              disabled={driveLoading}
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {driveLoading ? "Buscando…" : "Abrir en Drive ↗"}
            </button>
            <button onClick={() => { descargarDocumento(doc); onClose(); }} className="text-sm px-4 py-2 rounded-lg border border-neutral-300 hover:bg-neutral-50">
              Descargar
            </button>
          </div>
          <button onClick={onClose} className="mt-5 text-xs text-neutral-400 hover:text-neutral-600">Cerrar</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="text-5xl mb-4">{fileIcon(doc.mime_type)}</div>
          <p className="text-sm font-medium text-neutral-800 mb-1 truncate px-2">{doc.nombre_original}</p>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <button onClick={onClose} className="text-xs text-neutral-400 hover:text-neutral-600">Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-full h-full"
        style={{ maxWidth: "1300px", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-200 bg-neutral-50 shrink-0">
          <span className="text-base leading-none">{fileIcon(doc.mime_type)}</span>
          <span className="flex-1 text-sm font-medium text-neutral-800 truncate">{doc.nombre_original}</span>
          <span className="text-[11px] text-neutral-400 shrink-0 hidden sm:block">{formatBytes(doc.tamano_bytes)}</span>
          {blobUrl && isPdf && (
            <button onClick={() => window.open(blobUrl, "_blank")} className="text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0">
              Nueva ventana ↗
            </button>
          )}
          <button onClick={() => descargarDocumento(doc)} className="text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0">
            Descargar
          </button>
          {onAprobar && (
            <button onClick={onAprobar} className="text-[11px] px-2 py-1 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 transition shrink-0">
              Aprobar
            </button>
          )}
          {onObservar && (
            <button onClick={onObservar} className="text-[11px] px-2 py-1 rounded border border-amber-400 text-amber-700 hover:bg-amber-50 transition shrink-0">
              Observar
            </button>
          )}
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-xl leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-100 shrink-0" aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex items-center justify-center bg-neutral-300">
          {loading && (
            <div className="text-sm text-neutral-600 bg-white px-5 py-3 rounded-lg shadow">Cargando archivo…</div>
          )}
          {!loading && !error && blobUrl && isPdf && (
            <iframe src={blobUrl} className="w-full h-full border-0" title={doc.nombre_original} />
          )}
          {!loading && !error && blobUrl && isImage && (
            <img src={blobUrl} alt={doc.nombre_original} className="max-w-full max-h-full object-contain p-4" />
          )}
        </div>
      </div>
    </div>
  );
}
