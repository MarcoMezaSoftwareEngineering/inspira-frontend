// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import { useState, useMemo, useEffect } from "react";
import { apiDELETE, apiUpload } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";
import { requisitosDe, NOTA_APOSTILLA } from "./visaRequisitos";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const ESTADO_CFG = {
  aprobado:   { label: "Aprobado",  bg: "bg-emerald-50",  text: "text-emerald-700" },
  enviado:    { label: "Enviado",   bg: "bg-sky-50",      text: "text-sky-700"     },
  observado:  { label: "Observado", bg: "bg-red-50",      text: "text-red-700"     },
  solicitado: { label: "Adicional", bg: "bg-violet-50",   text: "text-violet-700"  },
  rechazado:  { label: "Rechazado", bg: "bg-rose-100",    text: "text-rose-800"    },
  no_aplica:  { label: "No aplica", bg: "bg-neutral-50",  text: "text-neutral-500" },
  pendiente:  { label: "Pendiente", bg: "bg-amber-50",    text: "text-amber-700"   },
};

function getCfg(estado) {
  return ESTADO_CFG[(estado || "pendiente").toLowerCase()] || ESTADO_CFG.pendiente;
}

function esVisualizableInline(mimeType) {
  const m = (mimeType || "").toLowerCase();
  return m.includes("pdf") || m.includes("image/");
}

// ─── Visor modal ────────────────────────────────────────────────────────────
function VisorModal({ doc, onClose }) {
  const esPdf    = (doc.mime_type || "").toLowerCase().includes("pdf");
  const esImagen = (doc.mime_type || "").toLowerCase().includes("image/");
  const [blobUrl,  setBlobUrl]  = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    async function load() {
      const token = localStorage.getItem("token");
      const url = `${API_URL}/api/documentos/${doc.id_documento}/descargar`;
      try {
        const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled) return;
        if (!r.ok) { setError("No se pudo cargar el archivo."); setCargando(false); return; }
        const blob = await r.blob();
        if (cancelled) return;

        if (esImagen) {
          // data URL para imágenes: evita problemas de CSP con blob: y revocaciones
          await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => { if (!cancelled) setBlobUrl(reader.result); resolve(); };
            reader.onerror = () => reject(new Error("FileReader error"));
            reader.readAsDataURL(blob);
          });
        } else {
          // Forzar application/pdf para que Chrome active su visor de PDF
          const pdfBlob = new Blob([blob], { type: "application/pdf" });
          objectUrl = URL.createObjectURL(pdfBlob);
          if (!cancelled) setBlobUrl(objectUrl);
        }
      } catch {
        if (!cancelled) setError("Error al cargar el archivo.");
      }
      if (!cancelled) setCargando(false);
    }

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id_documento, esPdf, esImagen]);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-4xl"
        style={{ height: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 shrink-0">
          <p className="text-sm font-semibold text-neutral-800 truncate pr-4" title={doc.nombre_original}>
            📎 {doc.nombre_original}
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-hidden rounded-b-2xl bg-neutral-100 flex items-center justify-center">
          {cargando && <p className="text-sm text-neutral-500">Cargando archivo…</p>}
          {error    && <p className="text-sm text-red-600">{error}</p>}
          {!cargando && !error && blobUrl && esPdf && (
            <iframe src={blobUrl} title={doc.nombre_original} className="w-full h-full border-0" />
          )}
          {!cargando && !error && blobUrl && esImagen && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img src={blobUrl} alt={doc.nombre_original} className="max-w-full max-h-full object-contain rounded-xl shadow" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de documento ────────────────────────────────────────────────────
function DocCard({ it, solicitudId, onEliminar, onUploaded, onVerDoc }) {
  const docs = it.documentos || [];
  const hayDocs = docs.length > 0;
  const cfg = getCfg(it.estado_item);
  const requisitos = requisitosDe(it.item?.nombre_item);
  const itemAprobado = (it.estado_item || "").toLowerCase() === "aprobado";
  const [subiendo, setSubiendo] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      for (const f of files) formData.append("archivos", f);
      await apiUpload(
        `/api/panel/solicitudes/${solicitudId}/items/${it.id_solicitud_item}/documento`,
        formData
      );
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error(err);
    } finally {
      setSubiendo(false);
      e.target.value = "";
    }
  }

  async function handleDelete(idDoc) {
    if (deleting) return;
    setDeleting(idDoc);
    try {
      await onEliminar(idDoc);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div
      className={`border rounded-xl p-3 relative flex flex-col gap-2 ${
        it.estado_item === "rechazado"
          ? "border-rose-300 bg-rose-50/30"
          : it.estado_item === "observado"
          ? "border-red-200 bg-red-50/20"
          : it.estado_item === "solicitado"
          ? "border-violet-200 bg-violet-50/20"
          : it.estado_item === "aprobado"
          ? "border-emerald-200 bg-emerald-50/10"
          : "border-neutral-200 bg-white"
      }`}
    >
      {/* Badge posicionado arriba a la derecha */}
      <span
        className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}
      >
        {cfg.label}
      </span>

      {/* Nombre */}
      <p className="text-[13px] font-semibold text-neutral-900 pr-20 leading-snug">
        {it.item?.nombre_item}
      </p>

      {/* Descripción */}
      {it.item?.descripcion && (
        <p className="text-xs text-neutral-500 leading-snug -mt-1">
          {it.item.descripcion}
        </p>
      )}

      {/* Requisitos exactos: formato, vigencia, apostilla. Plegado por defecto
          para no enterrar el estado del documento bajo un muro de texto. */}
      {requisitos && (
        <details className="group -mt-0.5">
          <summary className="cursor-pointer select-none text-[11.5px] font-semibold text-[#046C8C] hover:underline list-none">
            <span className="group-open:hidden">Ver requisitos ▾</span>
            <span className="hidden group-open:inline">Ocultar requisitos ▴</span>
          </summary>
          <ul className="mt-2 space-y-1 border-l-2 border-neutral-200 pl-3">
            {requisitos.map((r) => (
              <li key={r} className="text-[11.5px] text-neutral-600 leading-snug">· {r}</li>
            ))}
          </ul>
        </details>
      )}

      {/* Comentario del asesor */}
      {it.comentario_asesor && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 text-xs text-amber-800">
          💬 {it.comentario_asesor}
        </div>
      )}

      {/* Archivos y subida */}
      {it.item?.permite_archivo && (
        <div className="mt-auto flex flex-col gap-1.5">
          {/* Lista de archivos subidos */}
          {hayDocs &&
            docs.map((doc) => {
              const isDel = deleting === doc.id_documento;
              const canDel =
                !itemAprobado &&
                (doc.estado_revision || "").toUpperCase() !== "APROBADO";
              const puedeVer = esVisualizableInline(doc.mime_type);

              return (
                <div key={doc.id_documento}>
                  <p
                    className="text-xs text-neutral-600 font-medium truncate"
                    title={doc.nombre_original}
                  >
                    📎 {doc.nombre_original}
                  </p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {puedeVer && (
                      <button
                        onClick={() => onVerDoc(doc)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 transition-colors"
                      >
                        Ver
                      </button>
                    )}
                    {canDel && (
                      <button
                        onClick={() => handleDelete(doc.id_documento)}
                        disabled={isDel}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded border border-neutral-200 bg-white text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {isDel ? "…" : "Eliminar"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

          {/* Botón subir — estilo dashed */}
          {!itemAprobado && (
            <label
              className={`mt-1 block text-center text-xs font-semibold py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all select-none ${
                subiendo
                  ? "border-neutral-200 bg-neutral-50 text-neutral-400 cursor-wait"
                  : "border-neutral-200 bg-neutral-50 text-neutral-500 hover:border-green-600 hover:bg-green-50 hover:text-green-700"
              }`}
            >
              {subiendo ? "Subiendo…" : "↑ Subir archivo"}
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                disabled={subiendo}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ChecklistDocumentos({
  checklist,
  cargarTodo,
  idSolicitud,
  numero = "1",
  titulo = "Documentos requeridos",
  sectionId = "1",
  open,
  onToggle,
  bloqueado = false,
  mensajeBloqueo = "",
}) {
  const [docVisor, setDocVisor] = useState(null);

  const grupos = {};
  (checklist || []).forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });
  const multiGrupo = Object.keys(grupos).length > 1;
  // Ordena las categorías por el orden de su etapa.
  const gruposOrdenados = Object.entries(grupos).sort(
    (a, b) => (a[1][0]?.item?.etapa?.orden ?? 99) - (b[1][0]?.item?.etapa?.orden ?? 99)
  );

  const total = checklist.length;
  const aprobados = checklist.filter((it) =>
    ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
  ).length;

  const estadoGlobal = useMemo(() => {
    if (!checklist.length) return "pendiente";
    const hasObservado = checklist.some(
      (it) => (it.estado_item || "").toLowerCase() === "observado"
    );
    if (hasObservado) return "observado";
    const allDone = checklist.every((it) =>
      ["aprobado", "no_aplica"].includes((it.estado_item || "").toLowerCase())
    );
    return allDone ? "completado" : "pendiente";
  }, [checklist]);

  const subtitulo = bloqueado
    ? "Se activará tras la sesión de diagnóstico"
    : total > 0
      ? `${aprobados} de ${total} documentos listos`
      : "Sube los archivos del checklist de tu servicio.";

  async function handleEliminar(idDocumento) {
    await apiDELETE(`/api/panel/documentos/${idDocumento}`);
    if (cargarTodo) cargarTodo();
  }

  const sinDoc = total - aprobados;

  return (
    <>
      {docVisor && (
        <VisorModal doc={docVisor} onClose={() => setDocVisor(null)} />
      )}

      <SeccionPanel
        numero={numero}
        titulo={titulo}
        subtitulo={subtitulo}
        estado={estadoGlobal}
        sectionId={sectionId}
        open={open}
        onToggle={onToggle}
      >
        {bloqueado && (
          <div className="text-center py-8 px-3">
            <span className="block text-3xl mb-2">🔒</span>
            <p className="text-sm font-semibold text-neutral-700">Documentos aún no disponibles</p>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-1">
              {mensajeBloqueo || "La lista de documentos se activará después de tu sesión de diagnóstico, cuando tu asesor defina el tipo de solvencia."}
            </p>
          </div>
        )}

        {!bloqueado && total > 0 && (
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm text-neutral-500">
              Sube todos tus documentos para que tu asesor pueda revisarlos.
            </p>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-emerald-600">● {aprobados} Listos</span>
              <span className="text-neutral-400">● {sinDoc} Sin doc.</span>
            </div>
          </div>
        )}

        {!bloqueado && Object.keys(grupos).length === 0 && (
          <p className="text-sm text-neutral-400 py-4 text-center">
            Aún no hay checklist configurado.
          </p>
        )}

        {!bloqueado && gruposOrdenados.map(([nombre, items]) => (
          <div key={nombre} className="space-y-3">
            {multiGrupo && (
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 pb-2 border-b border-neutral-100">
                {nombre}
              </p>
            )}

            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
            >
              {items.map((it) => (
                <DocCard
                  key={it.id_solicitud_item}
                  it={it}
                  solicitudId={idSolicitud}
                  onEliminar={handleEliminar}
                  onUploaded={cargarTodo}
                  onVerDoc={setDocVisor}
                />
              ))}
            </div>
          </div>
        ))}

        {!bloqueado && gruposOrdenados.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 mt-4">
            <span className="shrink-0 text-base leading-none mt-0.5">🌐</span>
            <p className="text-[12.5px] text-sky-900 leading-relaxed">{NOTA_APOSTILLA}</p>
          </div>
        )}
      </SeccionPanel>
    </>
  );
}
