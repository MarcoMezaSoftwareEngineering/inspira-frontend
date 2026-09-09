// src/pages/backoffice/solicitudes/components/ChecklistSolicitudAdmin.jsx
//
// Los documentos del expediente vistos por el asesor: las mismas filas que ve
// el asesorado en su panel (icono con el número de Drive, estado, descripción,
// requisitos y modelo), con lo que solo hace el asesor encima: aprobar u
// observar cada archivo, pedir un adicional, rechazar, subir por él, abrir
// en Drive y descargar todo uno a uno (08/09/2026).
import { useState } from "react";
import { boPATCH } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { API_URL, formatearFecha } from "../utils";
import DocViewer from "../../documentos/DocViewer";
import { DriveToast, useDriveToast } from "../../driveToast";
import { nombreDescarga, iconoDocumento, permiteVarios } from "../../../../lib/documentos";
import TextoConEnlaces from "../../../../components/common/TextoConEnlaces";
import IconoPaso from "../../../../components/common/IconoPaso";
import { guiaParaItem } from "../../../panel/components/mis-servicios/guiaDocumentosMaster";
import { requisitosDe } from "../../../panel/components/mis-servicios/sections/visaRequisitos";
import GuiaDocumento from "../../../panel/components/mis-servicios/sections/GuiaDocumento";

const ESTADO_CFG = {
  aprobado:   { label: "Aprobado",    tono: "ok",   icono: "check" },
  enviado:    { label: "Por revisar", tono: "on",   icono: "clock" },
  observado:  { label: "Observado",   tono: "warn", icono: "alert" },
  solicitado: { label: "Adicional",   tono: "ped",  icono: "plus" },
  rechazado:  { label: "Rechazado",   tono: "no",   icono: "x" },
  no_aplica:  { label: "No aplica",   tono: "info", icono: "info" },
  pendiente:  { label: "Pendiente",   tono: "info", icono: "clock" },
};

function getEstadoCfg(estado) {
  return ESTADO_CFG[(estado || "pendiente").toLowerCase()] || ESTADO_CFG.pendiente;
}

const REV_LABEL = { APROBADO: "aprobado", OBSERVADO: "observado", PENDIENTE: "sin revisar" };

export default function ChecklistSolicitudAdmin({
  detalle,
  checklistPorEtapa,
  recargar,
  isVisado = false,
  tipoSolvencia = "PENDIENTE",
}) {
  const [viewingDoc, setViewingDoc] = useState(null);
  const [descargandoTodo, setDescargandoTodo] = useState(false);
  const driveToastState = useDriveToast();

  // Oculta el set de solvencia que no corresponde a la vía activa. En MIXTO
  // se muestran ambos: el cliente pone parte del dinero y el avalista el
  // resto, así que el consulado exige las dos series completas.
  const variante = tipoSolvencia === "AVAL" ? "aval" : "propios";
  function visiblePorSolvencia(it) {
    if (tipoSolvencia === "MIXTO") return true;
    const g = it.item?.grupo;
    if (g === "solvencia_propios") return variante === "propios";
    if (g === "solvencia_aval") return variante === "aval";
    return true;
  }

  async function abrirEnDrive(doc) {
    window.dispatchEvent(new CustomEvent("drive-opening"));
    try {
      const token = localStorage.getItem("bo_token");
      const r = await fetch(`${API_URL}/api/admin/documentos/${doc.id_documento}/drive-url`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      if (data.ok && data.url) window.open(data.url, "_blank");
      else window.dispatchEvent(new CustomEvent("drive-error"));
    } catch {
      window.dispatchEvent(new CustomEvent("drive-error"));
    }
  }

  async function cambiarRevision(doc, nuevoEstado) {
    if (!doc) return false;
    let comentario = "";
    if (nuevoEstado === "OBSERVADO") {
      comentario = await dialog.prompt(
        "Comentario para el cliente (por qué se observa el documento):",
        doc.comentario_revision || ""
      );
      if (comentario === null) return false;
    }
    try {
      const r = await boPATCH(`/api/admin/documentos/${doc.id_documento}/revision`, {
        estado_revision: nuevoEstado,
        comentario_revision: comentario || null,
      });
      if (!r.ok) { dialog.toast(r.message || r.msg || "No se pudo actualizar el estado del documento.", "error"); return false; }
      await recargar();
      return true;
    } catch (e) {
      console.error(e);
      dialog.toast("Error al actualizar el documento.", "error");
      return false;
    }
  }

  // Cambiar el estado del ÍTEM (acciones del asesor: adicional / rechazar / etc.)
  async function cambiarEstadoItem(it, nuevoEstado) {
    if (!detalle || !it) return;
    let comentario;
    if (nuevoEstado === "rechazado" || nuevoEstado === "solicitado") {
      comentario = await dialog.prompt(
        nuevoEstado === "rechazado"
          ? "Motivo del rechazo (se mostrará al cliente):"
          : "Detalle del documento adicional solicitado:",
        it.comentario_asesor || ""
      );
      if (comentario === null) return;
    }
    try {
      const r = await boPATCH(
        `/api/admin/solicitudes/${detalle.id_solicitud}/items/${it.id_solicitud_item}/estado`,
        { estado_item: nuevoEstado, comentario_asesor: comentario ?? null }
      );
      if (!r.ok) { dialog.toast(r.msg || r.message || "No se pudo actualizar el estado.", "error"); return; }
      await recargar();
    } catch (e) {
      console.error(e);
      dialog.toast("Error al actualizar el estado del ítem.", "error");
    }
  }

  // Cada archivo con su nombre de expediente: «1. Pasaporte.pdf». Devuelve
  // true si bajó, para que «Descargar todos» sepa cuántos consiguió.
  async function descargarDocumento(doc, nombre) {
    try {
      const token = localStorage.getItem("bo_token");
      if (!token) { dialog.toast("No existe sesión de backoffice", "error"); return; }
      const resp = await fetch(`${API_URL}/api/admin/documentos/${doc.id_documento}/descargar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) { dialog.toast("No se pudo descargar el archivo", "error"); return false; }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre || doc.nombre_original || "archivo";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 4000);
      return true;
    } catch (e) {
      console.error(e);
      dialog.toast("Error al descargar", "error");
      return false;
    }
  }

  // Todos los archivos del expediente, uno a uno y sueltos —no en ZIP—, cada
  // uno con su número y su nombre. El navegador pide permiso la primera vez
  // para descargar varios seguidos; con un respiro entre archivos no los pierde.
  async function descargarTodos(items) {
    const pares = [];
    for (const it of items) {
      const docs = Array.isArray(it.documentos) ? it.documentos : it.documento ? [it.documento] : [];
      for (const doc of docs) pares.push([it, doc]);
    }
    if (!pares.length) { dialog.toast("Este expediente todavía no tiene archivos.", "error"); return; }
    setDescargandoTodo(true);
    let ok = 0;
    try {
      for (const [it, doc] of pares) {
        if (await descargarDocumento(doc, nombreDescarga(it, doc))) ok += 1;
        await new Promise((r) => setTimeout(r, 600));
      }
      dialog.toast(`${ok} de ${pares.length} archivos descargados`, ok === pares.length ? "success" : "error");
    } finally { setDescargandoTodo(false); }
  }

  async function subirDocumentoInterno(it) {
    if (!detalle) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "application/pdf,image/*,.doc,.docx,.xls,.xlsx";
    input.onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("archivos", f));
        const token = localStorage.getItem("bo_token");
        const resp = await fetch(
          `${API_URL}/api/admin/solicitudes/${detalle.id_solicitud}/items/${it.id_solicitud_item}/documento`,
          { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData }
        );
        const r = await resp.json();
        if (!resp.ok || !r.ok) { dialog.toast(r.msg || "No se pudo subir", "error"); return; }
        await recargar();
      } catch (err) {
        console.error(err);
        dialog.toast("Error al subir documentos", "error");
      } finally {
        e.target.value = "";
      }
    };
    input.click();
  }

  // Visado: el Bloque 2 queda bloqueado hasta que se defina el tipo de solvencia (en la sesión de diagnóstico).
  if (isVisado && tipoSolvencia === "PENDIENTE") {
    return (
      <div className="text-center py-10 px-4">
        <span className="block text-3xl mb-2">🔒</span>
        <p className="text-sm font-semibold text-neutral-700">Documentos bloqueados</p>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mt-1">
          La lista de documentos se activará después de la sesión de diagnóstico, cuando definas el tipo de solvencia en el <b>Bloque 4</b>.
        </p>
      </div>
    );
  }

  if (Object.keys(checklistPorEtapa).length === 0) {
    return <p className="text-sm text-neutral-500 py-2">Esta solicitud no tiene checklist configurado.</p>;
  }

  // Contadores para la cabecera
  const todosLosItems = Object.values(checklistPorEtapa).flat().filter(visiblePorSolvencia);
  const estadoDe = (it) => (it.estado_item || "pendiente").toLowerCase();
  const totalDocs   = todosLosItems.length;
  const nAprobados  = todosLosItems.filter((it) => ["aprobado", "no_aplica"].includes(estadoDe(it))).length;
  const nEnviados   = todosLosItems.filter((it) => estadoDe(it) === "enviado").length;
  const nObservados = todosLosItems.filter((it) => ["observado", "rechazado"].includes(estadoDe(it))).length;
  const nFaltan     = todosLosItems.filter((it) => ["pendiente", "solicitado"].includes(estadoDe(it)) && !(it.documentos?.length > 0 || it.documento)).length;
  const pct = totalDocs ? Math.round((nAprobados / totalDocs) * 100) : 0;
  const nombreCorto = (detalle?.cliente?.nombre || "el asesorado").split(" ")[0];
  const revisionPedida = detalle?.datos_panel?.revision_solicitada_at || null;

  return (
    <>
    <DriveToast state={driveToastState} />

    {/* Cabecera: cuántos van, la barra y las acciones de todo el expediente */}
    <div className="ex-doc-top">
      <div>
        <div className="num">
          {nAprobados} <small>de {totalDocs} aprobados{nEnviados ? ` · ${nEnviados} por revisar` : ""}{nObservados ? ` · ${nObservados} observados` : ""}</small>
        </div>
        <div className="ex-barra"><i style={{ "--w": `${pct}%` }} /></div>
      </div>
      <div className="ex-fila">
        <button type="button" className="ex-btn sec" onClick={() => descargarTodos(todosLosItems)} disabled={descargandoTodo}
          title="Descarga cada archivo por separado, numerado y con el nombre del documento">
          <IconoPaso nombre="download" /> {descargandoTodo ? "Descargando…" : "Descargar todos"}
        </button>
      </div>
    </div>
    <p className="ex-lead">
      {revisionPedida
        ? <>{nombreCorto} pidió revisión el <b>{formatearFecha(revisionPedida)}</b>. </>
        : null}
      <b>Aprobar</b> cierra el archivo; <b>Observar</b> pide el motivo y se lo muestra a {nombreCorto} junto a la guía.
      «Descargar todos» baja los archivos uno a uno, numerados y con el nombre del documento, nunca en ZIP.
      Todo queda reflejado en su carpeta de Drive.
      {nFaltan ? <> Faltan <b>{nFaltan}</b> por subir.</> : null}
    </p>

    <div className="space-y-5">
      {Object.entries(checklistPorEtapa)
        .sort((a, b) => (a[1][0]?.item?.etapa?.orden ?? 99) - (b[1][0]?.item?.etapa?.orden ?? 99))
        .map(([nombreEtapa, itemsAll]) => {
        const items = itemsAll.filter(visiblePorSolvencia);
        if (items.length === 0) return null;
        return (
        <div key={nombreEtapa}>
          {Object.keys(checklistPorEtapa).length > 1 && (
            <p className="ex-grupo">{nombreEtapa}</p>
          )}
          <div className="ex-docs">
            {items.map((it) => (
              <FilaDocumento
                key={it.id_solicitud_item}
                it={it}
                guiaMaster={!isVisado}
                nombreCorto={nombreCorto}
                onVer={setViewingDoc}
                onDrive={abrirEnDrive}
                onDescargar={(doc) => descargarDocumento(doc, nombreDescarga(it, doc))}
                onRevision={cambiarRevision}
                onEstadoItem={cambiarEstadoItem}
                onSubirInterno={subirDocumentoInterno}
              />
            ))}
          </div>
        </div>
        );
      })}
    </div>
    {viewingDoc && (
      <DocViewer
        doc={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onAprobar={async () => { const ok = await cambiarRevision(viewingDoc, "APROBADO"); if (ok) setViewingDoc(null); }}
        onObservar={async () => { const ok = await cambiarRevision(viewingDoc, "OBSERVADO"); if (ok) setViewingDoc(null); }}
      />
    )}
    </>
  );
}

// La fila de un documento: idéntica a la del panel del asesorado, con las
// acciones del asesor. Los archivos van uno a uno con su revisión.
function FilaDocumento({ it, guiaMaster, nombreCorto, onVer, onDrive, onDescargar, onRevision, onEstadoItem, onSubirInterno }) {
  const docs = Array.isArray(it.documentos) ? it.documentos : it.documento ? [it.documento] : [];
  const estado = (it.estado_item || "pendiente").toLowerCase();
  const cfg = getEstadoCfg(estado);
  const varios = permiteVarios(it.item?.nombre_item);
  const guia = guiaMaster ? guiaParaItem(it.item?.nombre_item) : null;
  const requisitos = guia ? null : requisitosDe(it.item?.nombre_item);

  return (
    <div className="ex-doc" data-e={estado}>
      <span className="ex-doc-ico">
        <IconoPaso nombre={iconoDocumento(it.item?.nombre_item)} />
        {it.numero ? <i>{it.numero}</i> : null}
      </span>

      <div className="ex-doc-fila">
        <span className="n">{it.item?.nombre_item}</span>
        <span className="ex-est" data-e={cfg.tono}><IconoPaso nombre={cfg.icono} /> {cfg.label}</span>
      </div>

      {it.item?.descripcion && (
        <TextoConEnlaces texto={it.item.descripcion} className="ex-doc-desc" />
      )}

      {it.comentario_asesor && (
        <div className="ex-doc-obs" data-k={estado === "solicitado" ? "ped" : "obs"}>
          <IconoPaso nombre={estado === "solicitado" ? "plus" : "alert"} className="w-4 h-4 shrink-0 mt-0.5" />
          <span><b>{estado === "solicitado" ? "Adicional pedido:" : "Observación enviada:"}</b> {it.comentario_asesor}</span>
        </div>
      )}

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

      {guia?.modelos?.length > 0 && (
        <div style={{ gridColumn: 2 }}>
          <GuiaDocumento guia={guia} soloModelos />
        </div>
      )}

      {docs.length > 0 ? (
        <div className="ex-doc-archivos">
          {docs.map((doc) => {
            const rev = (doc.estado_revision || "PENDIENTE").toUpperCase();
            return (
              <div key={doc.id_documento} className="ex-arch" data-rev={rev}>
                <IconoPaso nombre="clip" className="w-4 h-4" />
                <span className="nm" title={doc.nombre_original}>{doc.nombre_original}</span>
                <small>
                  {doc.fecha_subida ? formatearFecha(doc.fecha_subida) : ""}
                  {` · ${REV_LABEL[rev] || rev.toLowerCase()}`}
                  {doc.comentario_revision ? ` · ${doc.comentario_revision}` : ""}
                </small>
                <span className="acciones">
                  <button type="button" onClick={() => onVer(doc)}><IconoPaso nombre="eye" className="w-3.5 h-3.5" /> Ver</button>
                  <button type="button" onClick={() => onDrive(doc)} title="Abrir en Google Drive"><IconoPaso nombre="external" className="w-3.5 h-3.5" /> Drive</button>
                  <button type="button" onClick={() => onDescargar(doc)}><IconoPaso nombre="download" className="w-3.5 h-3.5" /> Descargar</button>
                </span>
                <span className="ex-rev">
                  <button type="button" className="ok" aria-pressed={rev === "APROBADO"} onClick={() => onRevision(doc, "APROBADO")}>
                    <IconoPaso nombre="check" /> Aprobar
                  </button>
                  <button type="button" className="no" aria-pressed={rev === "OBSERVADO"} onClick={() => onRevision(doc, "OBSERVADO")}>
                    <IconoPaso nombre="alert" /> Observar
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="ex-nota">Sin archivos todavía.{varios ? " Admite varios archivos." : ""}</p>
      )}

      {/* Lo que solo hace el asesor sobre el requisito entero */}
      <div className="ex-doc-acc">
        <button type="button" className="ex-btn sec" onClick={() => onEstadoItem(it, "solicitado")} title="Pedir un documento adicional o una corrección">
          <IconoPaso nombre="plus" /> Pedir adicional
        </button>
        <button type="button" className="ex-btn sec" onClick={() => onEstadoItem(it, "rechazado")}>
          <IconoPaso nombre="x" /> Rechazar
        </button>
        {["solicitado", "rechazado"].includes(estado) && (
          <button type="button" className="ex-btn plano" onClick={() => onEstadoItem(it, "pendiente")}>
            <IconoPaso nombre="refresh" /> Reiniciar
          </button>
        )}
        {it.item?.permite_archivo && (
          <button type="button" className="ex-btn sec" onClick={() => onSubirInterno(it)} style={{ marginLeft: "auto" }}>
            <IconoPaso nombre="upload" /> Subir por {nombreCorto}
          </button>
        )}
      </div>
    </div>
  );
}
