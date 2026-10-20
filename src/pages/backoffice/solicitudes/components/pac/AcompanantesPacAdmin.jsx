// Los acompañantes del PAC, vistos por el asesor: datos, documentos por
// ranura con aprobar y observar, y el seguimiento de la solicitud de cada uno
// ante la UGE y el consulado (cada familiar lleva la suya).
import { useCallback, useEffect, useRef, useState } from "react";
import { boGET, boFetch, boPUT, boPOST, boDELETE } from "../../../../../services/backofficeApi";
import VisorArchivo from "../../../../../components/common/VisorArchivo";
import { dialog } from "../../../../../services/dialogService";
import { input } from "./pac-admin/constantes";

const VINCULOS = { CONYUGE: "Cónyuge", PAREJA: "Pareja de hecho", HIJO_COMUN: "Hijo/a de ambos", HIJO_NO_COMUN: "Hijo/a no común", ASCENDIENTE: "Ascendiente" };
const ESTADO_DOC = {
  SIN_SUBIR: { label: "Sin subir", clase: "text-neutral-400" },
  PENDIENTE: { label: "Por revisar", clase: "text-sky-700" },
  APROBADO:  { label: "Aprobado", clase: "text-emerald-700" },
  OBSERVADO: { label: "Observado", clase: "text-red-600" },
};

const nombreDe = (a) => [a.nombres, a.apellido1, a.apellido2].filter(Boolean).join(" ").trim();

function Dato({ k, v }) {
  const vacio = !String(v || "").trim();
  return (
    <div className="min-w-0 flex items-baseline gap-3 py-[7px] border-b border-neutral-100">
      <p className="text-[11.5px] text-neutral-500 leading-snug w-[44%] shrink-0">{k}</p>
      <p className={`text-[12.5px] leading-snug break-words min-w-0 flex-1 ${vacio ? "text-neutral-300" : "text-neutral-900 font-medium"}`}>{vacio ? "—" : v}</p>
    </div>
  );
}

function FilaDoc({ base, def, onCambio, onVer, onSubir, subiendo, clave }) {
  const [ocupado, setOcupado] = useState(false);
  const est = ESTADO_DOC[def.estado] || ESTADO_DOC.SIN_SUBIR;
  const ultimo = def.archivos[0];

  async function revisar(estado) {
    const observacion = estado === "OBSERVADO" ? window.prompt("¿Qué hay que corregir?") : null;
    if (estado === "OBSERVADO" && !observacion) return;
    setOcupado(true);
    await boFetch(`${base}/documentos/archivo/${ultimo.id_documento}/revision`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado, observacion }),
    });
    setOcupado(false);
    onCambio();
  }

  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-neutral-100 flex-wrap">
      <span className="text-[12.5px] text-neutral-800 min-w-0 flex-1">
        {def.etiqueta}{def.obligatorio ? "" : <span className="text-neutral-400"> · opcional</span>}
      </span>
      {ultimo && (
        <button type="button" onClick={() => onVer(ultimo)} className="text-[11.5px] text-[#046C8C] hover:underline truncate max-w-[45%]">{ultimo.nombre}</button>
      )}
      <span className={`text-[11px] font-semibold ${est.clase}`}>{est.label}</span>
      {ultimo && (
        <span className="flex gap-1.5">
          <button type="button" disabled={ocupado} onClick={() => revisar("APROBADO")} className="text-[11px] font-semibold px-2 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40">✓</button>
          <button type="button" disabled={ocupado} onClick={() => revisar("OBSERVADO")} className="text-[11px] font-semibold px-2 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-40">✕</button>
        </span>
      )}
      {def.de === "asesor" && (
        <label className={`text-[11px] px-2 py-1 rounded border border-neutral-300 cursor-pointer hover:bg-neutral-50 ${subiendo === clave ? "opacity-50" : ""}`}>
          {subiendo === clave ? "…" : "Subir"}
          <input type="file" className="hidden" accept="application/pdf,image/*" onChange={(e) => onSubir(clave, e.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}

function Ficha({ idSolicitud, a, abierta, onAbrir, onCambio, onQuitar }) {
  const base = `/backoffice/solicitudes/${idSolicitud}/pac/acompanantes/${a.id_acompanante}`;
  const [viendo, setViendo] = useState(null);
  const [subiendo, setSubiendo] = useState("");
  const [pestana, setPestana] = useState("datos");
  const [tramite, setTramite] = useState({});
  const pendientes = useRef({});
  const temporizador = useRef(null);

  useEffect(() => { setTramite({}); }, [a.id_acompanante]);

  const guardarTramite = (k, v) => {
    pendientes.current[k] = v;
    setTramite((p) => ({ ...p, [k]: v }));
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(async () => {
      const r = await boPUT(base, { ...pendientes.current });
      pendientes.current = {};
      if (r?.ok) onCambio(); else dialog.toast(r?.msg || "No se pudo guardar", "error");
    }, 800);
  };

  async function revisarDesdeVisor(archivo, estado, observacion = null) {
    const r = await boFetch(`${base}/documentos/archivo/${archivo.id_documento}/revision`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estado, observacion }),
    });
    if (r?.ok !== false) onCambio(); else dialog.toast("No se pudo guardar la revisión", "error");
  }

  async function subir(clave, archivo) {
    if (!archivo) return;
    setSubiendo(clave);
    const datos = new FormData();
    datos.append("archivo", archivo);
    const r = await boFetch(`${base}/documentos/${clave}`, { method: "POST", body: datos });
    setSubiendo("");
    if (r?.ok) onCambio();
  }

  async function abrirCarpeta(e) {
    e.stopPropagation();
    const ventana = window.open("", "_blank");
    if (ventana) { try { ventana.opener = null; } catch { /* da igual */ } }
    const r = await boGET(`${base}/carpeta-drive`);
    if (r?.ok && r.url) { if (ventana) ventana.location.replace(r.url); else window.location.assign(r.url); return; }
    ventana?.close();
    dialog.toast(r?.msg || "No se pudo abrir la carpeta en Drive", "error");
  }

  const rev = a.revision || {};
  const docs = a.documentos || {};
  const ranuras = Object.entries(docs.ranuras || {});
  const docsFaltan = (docs.faltan || []).length + (docs.observados || []).length;
  const v = (k) => (k in tramite ? tramite[k] : a[k]) ?? "";

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <button type="button" onClick={onAbrir} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-neutral-50">
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-neutral-900 truncate">{nombreDe(a) || "Sin nombre"}</span>
          <span className="block text-[11px] text-neutral-500">
            {VINCULOS[a.vinculo] || "Vínculo sin indicar"}{a.acompana_a === "SOLICITANTE" ? " · acompaña al solicitante" : ""}
            {rev.edad !== null && rev.edad !== undefined ? ` · ${rev.edad} años` : ""}{rev.menor ? " · menor" : ""}
            {a.resolucion_sentido ? ` · UGE ${a.resolucion_sentido.toLowerCase()}` : ""}
          </span>
        </span>
        {(rev.faltan?.length > 0 || docsFaltan > 0) && (
          <span className="shrink-0 text-[10.5px] font-semibold text-amber-600 text-right leading-tight">
            {rev.faltan?.length > 0 && <>{rev.faltan.length} datos<br /></>}
            {docsFaltan > 0 && <>{docsFaltan} docs</>}
          </span>
        )}
        <span className="shrink-0 text-neutral-300 text-[11px]">{abierta ? "▲" : "▼"}</span>
      </button>

      {abierta && (
        <div className="border-t border-neutral-100 px-3 py-3">
          <div className="flex gap-1.5 flex-wrap mb-3">
            {[["datos", "Datos"], ["docs", "Documentos"], ["tramite", "Su solicitud"]].map(([k, t]) => (
              <button key={k} type="button" onClick={() => setPestana(k)}
                className={`text-[11.5px] font-semibold px-2.5 py-1 rounded-lg ${pestana === k ? "bg-[#023A4B] text-white" : "bg-neutral-100 text-neutral-500"}`}>{t}</button>
            ))}
            <button type="button" onClick={abrirCarpeta} className="ml-auto text-[11px] px-2 py-1 rounded border border-neutral-300 hover:bg-neutral-50">📁 Drive</button>
          </div>

          {pestana === "datos" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Dato k="Vínculo" v={VINCULOS[a.vinculo]} />
                <Dato k="Acompaña a" v={a.acompana_a === "SOLICITANTE" ? "Al solicitante (familiar del titular)" : "Al titular"} />
                <Dato k="Pasaporte" v={a.pasaporte} />
                <Dato k="Caducidad pasaporte" v={a.pasaporte_caducidad} />
                <Dato k="NIE" v={a.nie} />
                <Dato k="Sexo" v={a.sexo} />
                <Dato k="Nacimiento" v={[a.fecha_nacimiento, a.lugar_nacimiento, a.pais_nacimiento].filter(Boolean).join(" · ")} />
                <Dato k="Nacionalidad" v={a.nacionalidad} />
                <Dato k="Estado civil" v={a.estado_civil} />
                <Dato k="Padre / madre" v={[a.nombre_padre, a.nombre_madre].filter(Boolean).join(" / ")} />
                <Dato k="Teléfono / correo" v={[a.telefono, a.correo].filter(Boolean).join(" · ")} />
                <Dato k="Domicilio" v={a.dom_mismo === false ? [a.dom_direccion, a.dom_localidad, a.dom_provincia].filter(Boolean).join(", ") : "El del solicitante"} />
                {rev.menor && <Dato k="Representante legal" v={[a.repr_nombre, a.repr_doc, a.repr_titulo].filter(Boolean).join(" · ")} />}
                {a.vinculo === "HIJO_NO_COMUN" && (
                  <>
                    <Dato k="Patria potestad" v={a.patria_potestad === "AMBOS" ? "Ambos padres (autorización notarial)" : a.patria_potestad === "EXCLUSIVA" ? "Exclusiva (sentencia)" : ""} />
                    <Dato k="Otro progenitor" v={[a.otro_progenitor_nombre, a.otro_progenitor_doc].filter(Boolean).join(" · ")} />
                  </>
                )}
              </div>
              {rev.faltan?.length > 0 && <p className="text-[11.5px] text-amber-700 mt-2">Faltan: {rev.faltan.join(", ")}</p>}
              {(rev.avisos || []).map((t) => <p key={t} className="text-[11.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-2 py-1.5 mt-2 leading-snug">{t}</p>)}
              <button type="button" onClick={onQuitar} className="text-[11px] text-neutral-400 hover:text-red-600 mt-3">Quitar a esta persona</button>
            </>
          )}

          {pestana === "docs" && (
            <div>
              {ranuras.map(([clave, def]) => (
                <FilaDoc key={clave} clave={clave} base={base} def={def} onCambio={onCambio} onVer={setViendo} onSubir={subir} subiendo={subiendo} />
              ))}
            </div>
          )}

          {pestana === "tramite" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                ["Nº expediente UGE", "expediente_numero", "text"],
                ["Presentada el", "expediente_fecha", "date"],
                ["Tasa pagada el", "tasa_pagada_fecha", "date"],
                ["Resolución", "resolucion_sentido", ["", "FAVORABLE", "DESFAVORABLE", "SILENCIO"]],
                ["Fecha resolución", "resolucion_fecha", "date"],
                ["Cita BLS", "bls_cita_fecha", "date"],
                ["Visado", "visado_resolucion", ["", "CONCEDIDO", "DENEGADO"]],
                ["Visado recogido", "visado_recogida_fecha", "date"],
              ].map(([label, k, tipo]) => (
                <label key={k} className="flex flex-col gap-1">
                  <span className="text-[11px] text-neutral-500">{label}</span>
                  {Array.isArray(tipo) ? (
                    <select className={input} value={v(k)} onChange={(e) => guardarTramite(k, e.target.value)}>
                      {tipo.map((o) => <option key={o} value={o}>{o || "—"}</option>)}
                    </select>
                  ) : (
                    <input type={tipo} className={input} value={v(k)} onChange={(e) => guardarTramite(k, e.target.value)} />
                  )}
                </label>
              ))}
              <label className="flex flex-col gap-1 col-span-full">
                <span className="text-[11px] text-neutral-500">Notas</span>
                <textarea rows={2} className={`${input} w-full`} value={v("notas")} onChange={(e) => guardarTramite("notas", e.target.value)} />
              </label>
            </div>
          )}
        </div>
      )}

      {viendo && (
        <VisorArchivo interno ruta={`${base}/documentos/archivo/${viendo.id_documento}`} nombre={viendo.nombre} mime={viendo.mime} tamano={viendo.tamano}
          onAprobar={() => revisarDesdeVisor(viendo, "APROBADO")} onObservar={(motivo) => revisarDesdeVisor(viendo, "OBSERVADO", motivo)} onCerrar={() => setViendo(null)} />
      )}
    </div>
  );
}

export default function AcompanantesPacAdmin({ idSolicitud, exp, numero = "3" }) {
  const [lista, setLista] = useState([]);
  const [abierta, setAbierta] = useState(null);

  const cargar = useCallback(
    () => boGET(`/backoffice/solicitudes/${idSolicitud}/pac/acompanantes`).then((r) => { if (r?.ok) setLista(r.acompanantes || []); }),
    [idSolicitud],
  );
  useEffect(() => { cargar(); }, [cargar]);

  async function anadir() {
    const r = await boPOST(`/backoffice/solicitudes/${idSolicitud}/pac/acompanantes`, { acompana_a: exp?.rol === "FAMILIAR" ? "SOLICITANTE" : "TITULAR" });
    if (r?.ok) { await cargar(); setAbierta(r.acompanante.id_acompanante); }
  }
  async function quitar(id) {
    if (!(await dialog.confirm("¿Quitar a esta persona y sus documentos?", "Acompañante"))) return;
    const r = await boDELETE(`/backoffice/solicitudes/${idSolicitud}/pac/acompanantes/${id}`);
    if (r?.ok) { setAbierta(null); cargar(); }
  }

  const sinCerrar = lista.filter((a) => a.revision?.faltan?.length || a.documentos?.faltan?.length).length;

  return (
    <div id="bloque-acompanantes" className="bg-white border border-neutral-200 rounded-xl p-4 scroll-mt-4">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="shrink-0 w-7 h-7 rounded-lg grid place-items-center text-[12px] font-bold text-white font-serif" style={{ background: "#023A4B" }}>{numero}</span>
        <span className="text-[13.5px] font-bold text-[#1A3557]">Acompañantes</span>
        <span className="ml-auto text-[11.5px] text-neutral-400">
          {!exp?.con_acompanantes && lista.length === 0 ? "viaja solo" : lista.length === 0 ? "ninguno todavía" : sinCerrar > 0 ? `${sinCerrar} de ${lista.length} sin cerrar` : `${lista.length} listo${lista.length === 1 ? "" : "s"}`}
        </span>
        <button type="button" onClick={anadir} className="text-[11.5px] font-semibold text-[#023A4B] hover:underline">+ Añadir</button>
      </div>
      <p className="text-[11.5px] text-neutral-500 leading-relaxed mb-3">
        Cada uno presenta su propia solicitud ante la UGE (MI-F, tasa, resolución) vinculada al expediente del titular. El hijo no común lleva la autorización notarial del otro progenitor (o la sentencia) y el matrimonio del progenitor con el titular.
      </p>
      {lista.length === 0 ? (
        <p className="text-[12.5px] text-neutral-400">{exp?.con_acompanantes ? "Ha marcado que viene con familia pero todavía no ha añadido a nadie." : "Ha indicado que viaja solo. Si eso cambia, lo marca desde su portal o se añade desde aquí."}</p>
      ) : (
        <div className="space-y-2">
          {lista.map((a) => (
            <Ficha key={a.id_acompanante} idSolicitud={idSolicitud} a={a} abierta={abierta === a.id_acompanante}
              onAbrir={() => setAbierta(abierta === a.id_acompanante ? null : a.id_acompanante)} onCambio={cargar} onQuitar={() => quitar(a.id_acompanante)} />
          ))}
        </div>
      )}
    </div>
  );
}
