// Pestaña de aprobación: lista plana de documentos con filtros por estado y orden por fecha
import { useState } from "react";
import { boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import DocViewer from "./DocViewer";
import { DriveIcon } from "./DocumentosTree";
import { API_URL, fileIcon, formatBytes, formatDate, descargarDocumento } from "./documentosUtils";

function flattenDocs(clientes, internos) {
  const entries = [];
  for (const lista of [clientes, internos]) {
    for (const cliente of lista) {
      for (const sol of cliente.solicitudes || []) {
        for (const item of sol.items || []) {
          for (const doc of item.documentos || []) {
            entries.push({ doc, clienteNombre: cliente.nombre, solicitudTitulo: sol.titulo, itemNombre: item.nombre });
          }
        }
      }
    }
  }
  return entries;
}

function AprobacionRow({ entrada, onCambioEstado }) {
  const { doc, clienteNombre, solicitudTitulo, itemNombre } = entrada;
  const [estadoLocal, setEstadoLocal] = useState(doc.estado_revision);
  const [verDoc, setVerDoc] = useState(false);
  const [loadingDrive, setLoadingDrive] = useState(false);
  const [procesando, setProcesando] = useState(false);

  async function cambiarRevision(nuevoEstado) {
    let comentario = "";
    if (nuevoEstado === "OBSERVADO") {
      comentario = await dialog.prompt("Comentario para el cliente (por qué se rechaza el documento):", "");
      if (comentario === null) return false;
    }
    setProcesando(true);
    try {
      const r = await boPATCH(`/api/admin/documentos/${doc.id_documento}/revision`, {
        estado_revision: nuevoEstado,
        comentario_revision: comentario || null,
      });
      if (!r.ok) {
        dialog.toast(r.message || r.msg || "No se pudo actualizar", "error");
        setProcesando(false);
        return false;
      }
      setEstadoLocal(nuevoEstado);
      onCambioEstado?.(doc.id_documento, nuevoEstado);
    } catch {
      dialog.toast("Error al actualizar el documento.", "error");
      setProcesando(false);
      return false;
    }
    setProcesando(false);
    return true;
  }

  async function handleDrive(e) {
    e.stopPropagation();
    setLoadingDrive(true);
    try {
      const token = localStorage.getItem("bo_token");
      const r = await fetch(`${API_URL}/api/admin/documentos/${doc.id_documento}/drive-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.ok && data.url) window.open(data.url, "_blank");
      else dialog.toast(data.msg || "No disponible en Drive aún.", "info");
    } catch {
      dialog.toast("Error al obtener URL de Drive", "error");
    }
    setLoadingDrive(false);
  }

  const estadoBadge = {
    APROBADO: "bg-green-100 text-green-700",
    OBSERVADO: "bg-yellow-100 text-yellow-700",
    SUBIDO:    "bg-blue-100 text-blue-600",
  };

  return (
    <>
      <div
        onClick={() => setVerDoc(true)}
        className="flex items-center gap-2 py-2.5 px-4 border-b border-neutral-100 hover:bg-blue-50/40 transition-colors last:border-0 cursor-pointer"
      >
        <span className="text-base leading-none shrink-0">{fileIcon(doc.mime_type)}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-800 truncate">{doc.nombre_original}</p>
          <p className="text-[10px] text-neutral-400 truncate">
            {clienteNombre} · {solicitudTitulo} · {itemNombre}
          </p>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${estadoBadge[estadoLocal] || "bg-neutral-100 text-neutral-500"}`}>
          {estadoLocal === "SUBIDO" ? "SIN REVISAR" : estadoLocal}
        </span>
        <span className="text-[11px] text-neutral-400 shrink-0 hidden lg:block">{formatBytes(doc.tamano_bytes)}</span>
        <span className="text-[11px] text-neutral-400 shrink-0 hidden md:block">{formatDate(doc.fecha_subida)}</span>

        <button
          onClick={handleDrive}
          disabled={loadingDrive}
          className="group flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 active:scale-95 transition-all shrink-0 disabled:opacity-50"
        >
          <DriveIcon size={11} />
          <span className="text-neutral-500 group-hover:text-neutral-800 font-medium">Drive</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); descargarDocumento(doc); }}
          className="text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-100 shrink-0"
        >
          Descargar
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cambiarRevision("APROBADO"); }}
          disabled={procesando || estadoLocal === "APROBADO"}
          className="text-[11px] px-2 py-1 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 shrink-0 disabled:opacity-40 font-medium transition-colors"
        >
          {procesando ? "…" : "Aprobar"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); cambiarRevision("OBSERVADO"); }}
          disabled={procesando || estadoLocal === "OBSERVADO"}
          className="text-[11px] px-2 py-1 rounded border border-amber-400 text-amber-700 hover:bg-amber-50 shrink-0 disabled:opacity-40 font-medium transition-colors"
        >
          {procesando ? "…" : "Rechazar"}
        </button>
      </div>

      {verDoc && (
        <DocViewer
          doc={{ ...doc, estado_revision: estadoLocal }}
          onClose={() => setVerDoc(false)}
          onAprobar={async () => {
            const ok = await cambiarRevision("APROBADO");
            if (ok) setVerDoc(false);
          }}
          onObservar={async () => {
            const ok = await cambiarRevision("OBSERVADO");
            if (ok) setVerDoc(false);
          }}
        />
      )}
    </>
  );
}

const FILTROS = [
  { key: "SUBIDO",    label: "Sin revisar", icon: "📤" },
  { key: "OBSERVADO", label: "Observados",  icon: "⚠️" },
  { key: "APROBADO",  label: "Aprobados",   icon: "✅" },
];

const FILTRO_STYLE = {
  SUBIDO:    { active: "border-blue-500 text-blue-700 bg-blue-50",     badge: "bg-blue-100 text-blue-700" },
  OBSERVADO: { active: "border-yellow-500 text-yellow-700 bg-yellow-50", badge: "bg-yellow-100 text-yellow-700" },
  APROBADO:  { active: "border-green-500 text-green-700 bg-green-50",   badge: "bg-green-100 text-green-700" },
};

export default function AprobacionDocumentos({ clientes, internos, loading }) {
  const [filtroActivo, setFiltroActivo] = useState("SUBIDO");
  const [ordenAsc, setOrdenAsc] = useState(false);
  const [estadosLocales, setEstadosLocales] = useState({});

  function handleCambioEstado(idDoc, nuevoEstado) {
    setEstadosLocales((prev) => ({ ...prev, [idDoc]: nuevoEstado }));
  }

  const todasLasEntradas = flattenDocs(clientes, internos).map((e) => ({
    ...e,
    doc: { ...e.doc, estado_revision: estadosLocales[e.doc.id_documento] ?? e.doc.estado_revision },
  }));

  const counts = {
    SUBIDO:    todasLasEntradas.filter((e) => e.doc.estado_revision !== "APROBADO" && e.doc.estado_revision !== "OBSERVADO").length,
    OBSERVADO: todasLasEntradas.filter((e) => e.doc.estado_revision === "OBSERVADO").length,
    APROBADO:  todasLasEntradas.filter((e) => e.doc.estado_revision === "APROBADO").length,
  };

  const filtradas = todasLasEntradas.filter((e) => {
    if (filtroActivo === "SUBIDO") return e.doc.estado_revision !== "APROBADO" && e.doc.estado_revision !== "OBSERVADO";
    return e.doc.estado_revision === filtroActivo;
  });

  const ordenadas = [...filtradas].sort((a, b) => {
    const ta = new Date(a.doc.fecha_subida).getTime();
    const tb = new Date(b.doc.fecha_subida).getTime();
    return ordenAsc ? ta - tb : tb - ta;
  });

  const EMPTY_MSG = {
    SUBIDO:    { icon: "📤", text: "No hay documentos sin revisar" },
    OBSERVADO: { icon: "⚠️",  text: "No hay documentos observados" },
    APROBADO:  { icon: "✅",  text: "No hay documentos aprobados" },
  };

  return (
    <div className="flex-1 min-w-0 bg-white border border-neutral-200 rounded-xl shadow-sm flex flex-col min-h-0">

      {/* Barra superior: filtros + orden */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-200 bg-neutral-50 rounded-t-xl flex-wrap gap-y-2">
        <div className="flex gap-1">
          {FILTROS.map((f) => {
            const active = filtroActivo === f.key;
            const s = FILTRO_STYLE[f.key];
            return (
              <button
                key={f.key}
                onClick={() => setFiltroActivo(f.key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                  active
                    ? `${s.active} border`
                    : "border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                <span>{f.icon}</span>
                {f.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/60" : "bg-neutral-100 text-neutral-500"}`}>
                  {loading ? "…" : counts[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setOrdenAsc((v) => !v)}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition font-medium shrink-0"
          title="Cambiar orden"
        >
          {ordenAsc ? "↑ Más antiguos primero" : "↓ Más recientes primero"}
        </button>
      </div>

      {/* Lista scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && (
          <div className="py-20 text-center text-neutral-400 text-sm">
            <div className="text-3xl mb-3">📂</div>
            Cargando documentos…
          </div>
        )}
        {!loading && ordenadas.length === 0 && (
          <div className="py-16 text-center text-neutral-400 text-sm">
            <div className="text-4xl mb-3">{EMPTY_MSG[filtroActivo].icon}</div>
            {EMPTY_MSG[filtroActivo].text}
          </div>
        )}
        {!loading && ordenadas.length > 0 && (
          <div>
            {ordenadas.map((entrada) => (
              <AprobacionRow
                key={entrada.doc.id_documento}
                entrada={entrada}
                onCambioEstado={handleCambioEstado}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && (
        <div className="shrink-0 px-4 py-2 border-t border-neutral-100 bg-neutral-50 rounded-b-xl">
          <span className="text-xs text-neutral-400">{ordenadas.length} documento{ordenadas.length !== 1 ? "s" : ""}</span>
        </div>
      )}
    </div>
  );
}
