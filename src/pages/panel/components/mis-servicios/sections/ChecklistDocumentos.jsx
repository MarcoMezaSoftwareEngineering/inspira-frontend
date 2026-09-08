// src/pages/panel/components/mis-servicios/sections/ChecklistDocumentos.jsx
import { useState, useMemo, useEffect } from "react";
import { apiDELETE, apiUpload } from "../../../../../services/api";
import SeccionPanel from "./SeccionPanel";
import PedirRevisionMaster from "./PedirRevisionMaster";
import { requisitosDe, NOTA_APOSTILLA } from "./visaRequisitos";
import { listaSolvencia, VIA_ETIQUETA } from "./visaSolvencia";
import { permiteVarios, iconoDocumento } from "../../../../../lib/documentos";
import IconoPaso from "../../../../../components/common/IconoPaso";
import { guiaParaItem } from "../guiaDocumentosMaster";
import GuiaDocumento from "./GuiaDocumento";
import TextoConEnlaces from "../../../../../components/common/TextoConEnlaces";
import { InstructivosContenido } from "./InstructivosPlantillas";

const API_URL = import.meta.env.VITE_API_URL || "https://api.inspira-legal.cloud";

const ESTADO_CFG = {
  aprobado:   { label: "Aprobado",   tono: "ok" },
  enviado:    { label: "En revisión", tono: "on" },
  observado:  { label: "Por corregir", tono: "warn" },
  solicitado: { label: "Te lo piden", tono: "ped" },
  rechazado:  { label: "Rechazado",  tono: "no" },
  no_aplica:  { label: "No aplica",  tono: "info" },
  pendiente:  { label: "Falta",      tono: "info" },
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
function DocCard({ it, solicitudId, onEliminar, onUploaded, onVerDoc, guiaMaster = false }) {
  const docs = it.documentos || [];
  const hayDocs = docs.length > 0;
  const cfg = getCfg(it.estado_item);
  // Un solo PDF con todo junto, salvo experiencia y formación complementaria.
  const varios = permiteVarios(it.item?.nombre_item);
  // La ficha de la guía directa (qué es, por qué importa, modelo), solo en máster.
  const guia = guiaMaster ? guiaParaItem(it.item?.nombre_item) : null;
  const requisitos = guia ? null : requisitosDe(it.item?.nombre_item);
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
    <div className="ex-doc" data-e={(it.estado_item || "pendiente").toLowerCase()}>
      {/* El icono del documento con su número, el mismo que lleva en Drive. */}
      <span className="ex-doc-ico">
        <IconoPaso nombre={iconoDocumento(it.item?.nombre_item)} />
        {it.numero ? <i>{it.numero}</i> : null}
      </span>

      <div className="ex-doc-fila">
        <span className="n">{it.item?.nombre_item}</span>
        <span className="ex-est" data-e={cfg.tono}>{cfg.label}</span>
      </div>

      {/* Descripción, con el enlace del trámite cuando lo hay (Europass, sede). */}
      {it.item?.descripcion && (
        <TextoConEnlaces texto={it.item.descripcion} className="ex-doc-desc" />
      )}

      {/* Lo que pide tu asesor: corregir algo o un documento adicional. */}
      {it.comentario_asesor && (
        <div className="ex-doc-obs" data-k={(it.estado_item || "").toLowerCase() === "solicitado" ? "ped" : "obs"}>
          <IconoPaso nombre={(it.estado_item || "").toLowerCase() === "solicitado" ? "plus" : "alert"} className="w-4 h-4 shrink-0 mt-0.5" />
          <span><b>{(it.estado_item || "").toLowerCase() === "solicitado" ? "Tu asesor te pide:" : "Tu asesor necesita:"}</b> {it.comentario_asesor}</span>
        </div>
      )}

      {/* Requisitos exactos y la guía con modelos: plegados, para no enterrar
          el estado del documento bajo un muro de texto. */}
      {(requisitos || guia) && (
        <div className="ex-doc-pliegues">
          {requisitos && (
            <details>
              <summary>Ver requisitos</summary>
              <div className="ex-doc-cuerpo">
                <ul>{requisitos.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </details>
          )}
          {guia && (
            <details>
              <summary>Cómo debe verse · guía y modelo</summary>
              <div className="ex-doc-cuerpo"><GuiaDocumento guia={guia} compacta /></div>
            </details>
          )}
        </div>
      )}

      {/* Archivos subidos */}
      {hayDocs && (
        <div className="ex-doc-archivos">
          {docs.map((doc) => {
            const isDel = deleting === doc.id_documento;
            const canDel = !itemAprobado && (doc.estado_revision || "").toUpperCase() !== "APROBADO";
            const puedeVer = esVisualizableInline(doc.mime_type);
            return (
              <div key={doc.id_documento} className="ex-arch">
                <IconoPaso nombre="clip" className="w-4 h-4" />
                <span className="nm" title={doc.nombre_original}>{doc.nombre_original}</span>
                {puedeVer && (
                  <button type="button" onClick={() => onVerDoc(doc)}>
                    <IconoPaso nombre="eye" className="w-3.5 h-3.5" /> Ver
                  </button>
                )}
                {canDel && (
                  <button type="button" className="rojo" onClick={() => handleDelete(doc.id_documento)} disabled={isDel}>
                    {isDel ? "…" : "Eliminar"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Subir */}
      {it.item?.permite_archivo && !itemAprobado && (
        <>
          <label className="ex-subir">
            <IconoPaso nombre="upload" className="w-4 h-4" />
            {subiendo ? "Subiendo…" : varios ? "Subir archivo" : hayDocs ? "Reemplazar el archivo" : "Subir el documento"}
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              multiple={varios}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              disabled={subiendo}
            />
          </label>
          <p className="ex-nota">
            {varios
              ? "Aquí sí puedes subir más de un archivo, cada uno completo."
              : "Todo el documento junto, en un solo PDF. Si subes otro, reemplaza al anterior."}
          </p>
        </>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function ChecklistDocumentos({
  checklist,
  cargarTodo,
  idSolicitud,
  revisionSolicitadaAt = null,
  numero = "1",
  titulo = "Documentos requeridos",
  sectionId = "1",
  open,
  onToggle,
  bloqueado = false,
  mensajeBloqueo = "",
  expediente = null,
  guiaMaster = false,
  // Las guías y plantillas van al pie de los documentos, no en un paso aparte.
  instructivos = null,
  onIrAGuia = null,
}) {
  const [docVisor, setDocVisor] = useState(null);

  const grupos = {};
  (checklist || []).forEach((it) => {
    const etapa = it.item?.etapa?.nombre || "Checklist";
    if (!grupos[etapa]) grupos[etapa] = [];
    grupos[etapa].push(it);
  });
  const multiGrupo = Object.keys(grupos).length > 1;

  // Documentos de solvencia derivados de lo que el cliente marcó en el bloque
  // de medios económicos. No son un adorno informativo: son exactamente los
  // que se le piden, y cambian según su perfil de ingresos y sus situaciones
  // especiales. Por eso se listan aquí, junto a los que tiene que subir.
  const via = expediente?.tipo_solvencia && expediente.tipo_solvencia !== "PENDIENTE"
    ? expediente.tipo_solvencia : null;
  const solvenciaPedida = via
    ? listaSolvencia(via, expediente?.medios_perfiles || {}, expediente?.medios_especiales || {})
    : null;
  const esGrupoSolvencia = (items) =>
    items.some((it) => String(it.item?.grupo || "").startsWith("solvencia"));
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

  const est = (it) => (it.estado_item || "pendiente").toLowerCase();
  const enRevision = checklist.filter((it) => est(it) === "enviado").length;
  const observados = checklist.filter((it) => ["observado", "rechazado", "solicitado"].includes(est(it))).length;
  const sinDoc = checklist.filter((it) => !(it.documentos || []).length && !["aprobado", "no_aplica"].includes(est(it))).length;

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

        {/* Cómo subir. Va arriba del todo: es la duda que más frena a la
            gente antes de empezar a cargar archivos. */}
        {!bloqueado && total > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 mb-4">
            <span className="shrink-0 text-base leading-none mt-0.5">📤</span>
            <div className="text-[12.5px] text-sky-900 leading-relaxed space-y-1">
              <p><b>Sube todo lo que tengas</b>, aunque no estés seguro de si sirve.</p>
              <p>
                Si un documento no encaja en ningún campo de esta lista, súbelo en{" "}
                <b>«Otros documentos»</b> — ahí caben varios archivos.
              </p>
              <p>
                Si algo <b>no lo tienes</b>, no subas nada en su lugar: déjalo vacío.
                Tus asesores revisarán qué falta y te lo dirán.
              </p>
            </div>
          </div>
        )}

        {/* Cuántos van, de un vistazo: el número grande y la barra. */}
        {!bloqueado && total > 0 && (
          <div className="mb-4">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <p className="text-[26px] font-black text-neutral-900 leading-none tabular-nums">
                {aprobados} <span className="text-[13px] font-semibold text-neutral-400">de {total} aprobados</span>
              </p>
              <div className="flex gap-3 text-[11.5px] font-semibold">
                {enRevision > 0 && <span className="text-sky-600">● {enRevision} en revisión</span>}
                {observados > 0 && <span className="text-amber-600">● {observados} por corregir</span>}
                {sinDoc > 0 && <span className="text-neutral-400">● {sinDoc} sin subir</span>}
              </div>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mt-2.5">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1d7a52] to-[#35b57f] transition-all duration-700"
                style={{ width: `${Math.round((aprobados / total) * 100)}%` }} />
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
              <p className="ex-grupo">
                <span className="ex-h-ico"><IconoPaso nombre="folder" /></span>
                {nombre}
                <span className="cnt">{items.filter((x) => ["aprobado", "no_aplica"].includes((x.estado_item || "").toLowerCase())).length} de {items.length}</span>
              </p>
            )}

            {solvenciaPedida && esGrupoSolvencia(items) && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-1">
                  Según lo que marcaste
                </p>
                <p className="text-[12px] text-neutral-600 leading-relaxed mb-2.5">
                  Elegiste <b>{VIA_ETIQUETA[via]}</b>. Con tu perfil de ingresos y tus
                  situaciones especiales, el consulado te pedirá estos documentos:
                </p>
                <ul className="space-y-1.5">
                  {solvenciaPedida.map((d) => (
                    <li key={d} className="flex gap-2 text-[12.5px] text-neutral-700 leading-snug">
                      <span className="shrink-0 text-[#1D6A4A] font-bold">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-neutral-400 mt-2.5 leading-snug">
                  ¿Falta algo o sobra? Ajusta lo que marcaste en <b>Mis medios económicos</b> y
                  esta lista se recalcula sola.
                </p>
              </div>
            )}

            <div className="ex-docs">
              {items.map((it) => (
                <DocCard
                  key={it.id_solicitud_item}
                  it={it}
                  solicitudId={idSolicitud}
                  onEliminar={handleEliminar}
                  onUploaded={cargarTodo}
                  onVerDoc={setDocVisor}
                  guiaMaster={guiaMaster}
                />
              ))}
            </div>
          </div>
        ))}

        {!bloqueado && gruposOrdenados.length > 0 && (
          <PedirRevisionMaster
            idSolicitud={idSolicitud}
            subidos={(checklist || []).some((it) => (it.documentos || []).length > 0)}
            revisionSolicitadaAt={revisionSolicitadaAt}
            onHecho={cargarTodo}
          />
        )}

        {!bloqueado && gruposOrdenados.length > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-3 mt-4">
            <span className="shrink-0 text-base leading-none mt-0.5">🌐</span>
            <p className="text-[12.5px] text-sky-900 leading-relaxed">{NOTA_APOSTILLA}</p>
          </div>
        )}

        {/* Guías y plantillas del servicio, al pie de los documentos: cada
            guía sirve para un documento, no para un paso aparte. */}
        {!bloqueado && (instructivos || onIrAGuia) && (
          <div className="mt-6 pt-5 border-t border-neutral-200">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary-light mb-1">Guías y plantillas</p>
            <p className="text-xs text-neutral-500 mb-3">La guía de cada documento, la de apostilla y las plantillas de tu servicio.</p>
            <InstructivosContenido instructivos={instructivos} onIrAGuia={onIrAGuia} guiaDocumentos={guiaMaster} />
          </div>
        )}
      </SeccionPanel>
    </>
  );
}
