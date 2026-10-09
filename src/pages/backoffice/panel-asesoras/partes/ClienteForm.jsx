// src/pages/backoffice/panel-asesoras/partes/ClienteForm.jsx
import { useState } from "react";
import { boGET, boPATCH } from "../../../../services/backofficeApi";
import { dialog } from "../../../../services/dialogService";
import { DriveIcon, openDriveFolder } from "../../driveToast";
import { ESTADOS } from "./constantes";
import { estadoLabel, mkFases } from "./utilidades";
import { buildInitialForm } from "./formularioInicial";
import { UnisEditor } from "./UnisEditor";

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENTE FORM (compartido para crear y editar)
═══════════════════════════════════════════════════════════════════════════ */
export function ClienteForm({ item, svc, saving, onSubmit, onCancel }) {
  const isEdit = !!item;
  const [form, setForm]         = useState(() => buildInitialForm(item));
  const [unis, setUnis]         = useState(() => item?.unis ? JSON.parse(JSON.stringify(item.unis)) : []);
  const [fases, setFases]       = useState(() => item?.fases ? JSON.parse(JSON.stringify(item.fases)) : mkFases());
  const [pendingStr, setPendingStr] = useState(() => (item?.pending || []).join("\n"));
  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }
  function setFase(i, field, val) { setFases(f => f.map((x, idx) => idx === i ? { ...x, [field]: val } : x)); }
  function setUniField(i, k, v)  { setUnis(u => u.map((x, idx) => idx === i ? { ...x, [k]: v } : x)); }
  function remUni(i) { setUnis(u => u.filter((_, idx) => idx !== i)); }

  // "auto" -> null (el backend lo deriva del expediente)
  const tri = (v) => (v === "auto" ? null : v === "si");

  async function handleSubmit() {
    if (!form.name?.trim()) { dialog.toast("El nombre es obligatorio", "error"); return; }

    // Para maestrías en modo edición, primero guardamos unis modificadas
    if (isEdit && svc === "master") {
      const promises = unis
        .filter(u => u._idAcceso)
        .map(u => boPATCH(`/backoffice/panel-asesoras/portales/${u._idAcceso}`, {
          u: u.u, master: u.master, fPost: u.fPost, fResult: u.fResult, est: u.est,
        }));
      await Promise.all(promises);
    }

    const body = {
      name: form.name.trim(),
      ...(!isEdit && { email: form.email || undefined }),
      estado: form.estado, paquete: form.paquete,
      pending: pendingStr.split("\n").map(s => s.trim()).filter(Boolean),
      promedio: form.promedio, interes: form.interes,
      uni_origen: form.uni_origen, masterElegido: form.masterElegido,
      portalLinked: form.portalLinked,
      notaMedia: tri(form.notaMedia), cvEuropass: tri(form.cvEuropass), docCompletos: tri(form.docCompletos),
      pasos: {
        fichero: tri(form.fichero), informe: tri(form.informe),
        escogio: tri(form.escogio), postulacion: tri(form.postulacion),
      },
      beca: { aprobable: form.beca_aprobable, detalle: form.beca_detalle },
      fases,
      fechaCita: form.fechaCita, pasaporte: form.pasaporte, fNac: form.fNac,
      nie: form.nie, expediente: form.expediente, llegada: form.llegada,
      plazoMax: form.plazoMax, plazoIdeal: form.plazoIdeal,
      detalle: form.detalle, fPresentacion: form.fPresentacion,
      carpeta: form.carpeta, centro: form.centro, estadoAdm: form.estadoAdm,
      resultado: form.resultado, tipo: form.tipo, asesor: form.asesor, resolucion: form.resolucion,
    };

    await onSubmit(body);
  }

  const inp = "w-full border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white";
  const lab = "block text-[10px] text-neutral-400 uppercase tracking-wide mb-0.5";
  // Dejar el campo vacio lo devuelve a automatico; el placeholder enseña que valor daria.
  const autoPh = (v) => (v ? `Auto: ${v}` : "Automático");

  return (
    <div className="space-y-4 text-xs">

      {/* Campos básicos */}
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 sm:col-span-1">
          <span className={lab}>Nombre completo *</span>
          <input className={inp} value={form.name} onChange={e => set("name", e.target.value)} />
        </label>
        {!isEdit && (
          <label>
            <span className={lab}>Email (opcional)</span>
            <input className={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </label>
        )}
        <label>
          <span className={lab}>Estado</span>
          <select className={inp} value={form.estado} onChange={e => set("estado", e.target.value)}>
            {ESTADOS.map(e => <option key={e} value={e}>{estadoLabel(e)}</option>)}
          </select>
        </label>
        <label className={!isEdit ? "col-span-2 sm:col-span-1" : ""}>
          <span className={lab}>Paquete contratado</span>
          <input className={inp} value={form.paquete} onChange={e => set("paquete", e.target.value)} />
        </label>
      </div>

      {/* Carpeta + Drive */}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={lab}>Código carpeta</span>
          <input className={inp} value={form.carpeta} onChange={e => set("carpeta", e.target.value)} />
        </label>
        <div>
          <span className={lab}>Carpeta Drive</span>
          {isEdit ? (
            <button
              type="button"
              onClick={() => openDriveFolder(() => boGET(`/backoffice/panel-asesoras/${item._id}/drive-folder-url`))}
              className="group inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg border border-neutral-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 hover:border-blue-200 hover:shadow-sm active:scale-95 transition-all duration-150 text-[11px] font-medium text-neutral-600"
            >
              <DriveIcon size={13} />
              <span>Abrir en Drive ↗</span>
            </button>
          ) : (
            <span className="block mt-1 text-xs text-neutral-400 italic">Guardar primero</span>
          )}
        </div>
      </div>

      {/* ── MÁSTER ── */}
      {svc === "master" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <label>
              <span className={lab}>Área de interés</span>
              <input className={inp} value={form.interes} onChange={e => set("interes", e.target.value)}
                placeholder={autoPh(item?.auto?.interes)} />
            </label>
            <label>
              <span className={lab}>Uni de origen</span>
              <input className={inp} value={form.uni_origen} onChange={e => set("uni_origen", e.target.value)}
                placeholder={autoPh(item?.auto?.uni_origen)} />
            </label>
            <label>
              <span className={lab}>Promedio ponderado</span>
              <input className={inp} value={form.promedio} onChange={e => set("promedio", e.target.value)}
                placeholder={autoPh(item?.auto?.promedio)} />
            </label>
          </div>
          <label>
            <span className={lab}>Máster elegido</span>
            <input className={inp} value={form.masterElegido} onChange={e => set("masterElegido", e.target.value)}
              placeholder={autoPh(item?.auto?.masterElegido)} />
          </label>
          <p className="text-[10px] text-neutral-400 -mt-2">
            Estos cuatro campos salen del expediente. Escribe algo solo para forzarlo; déjalo vacío para volver a automático.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className={lab}>¿Beca aprobable?</span>
              <select className={inp} value={form.beca_aprobable ? "1" : "0"} onChange={e => set("beca_aprobable", e.target.value === "1")}>
                <option value="0">No / Sin análisis</option>
                <option value="1">Sí — perfil aprobable</option>
              </select>
            </label>
            <label>
              <span className={lab}>Detalle análisis beca</span>
              <input className={inp} value={form.beca_detalle} onChange={e => set("beca_detalle", e.target.value)} />
            </label>
          </div>
          <div>
            <div className={lab}>Proceso</div>
            <p className="text-[10px] text-neutral-400 mb-1.5">
              En automático cada paso se deduce del expediente. Usa Sí/No solo cuando necesites forzarlo.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                ["fichero","Fichero"], ["notaMedia","Nota media"], ["cvEuropass","CV Europass"],
                ["informe","Informe búsqueda"], ["escogio","Escogió máster"],
                ["docCompletos","Docs completos"], ["postulacion","Postulación completa"],
              ].map(([k,l]) => (
                <label key={k} className="min-w-0">
                  <span className={lab}>
                    {l}
                    {form[k] === "auto" && item && (
                      <span className="ml-1 normal-case tracking-normal text-neutral-400">
                        ({item?.auto?.[k] ? "sí" : "no"})
                      </span>
                    )}
                  </span>
                  <select className={inp} value={form[k]} onChange={e => set(k, e.target.value)}>
                    <option value="auto">Automático</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ))}
            </div>
          </div>
          {isEdit && (
            <UnisEditor
              unis={unis}
              solicitudId={item._id}
              onAddLocal={u => setUnis(prev => [...prev, u])}
              onRem={remUni}
              onSet={setUniField}
            />
          )}
        </>
      )}

      {/* ── VISA / ESTANCIA ── */}
      {(svc === "visa" || svc === "ee") && (
        <>
          <div>
            <div className={lab}>Fases del proceso</div>
            <div className="mt-1.5 border border-neutral-100 rounded-lg overflow-hidden divide-y divide-neutral-100">
              {fases.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5 px-2.5 py-2">
                  <input type="checkbox" checked={f.done} onChange={e => setFase(i, "done", e.target.checked)} className="mt-0.5 w-3.5 h-3.5 flex-shrink-0" />
                  <span className="min-w-[160px] font-medium pt-0.5 flex-shrink-0">{f.label}</span>
                  <input className={`${inp} flex-1`} value={f.pendiente} onChange={e => setFase(i, "pendiente", e.target.value)} placeholder="pendiente específico…" />
                </div>
              ))}
            </div>
          </div>
          {svc === "visa" ? (
            <div className="grid grid-cols-2 gap-3">
              {[["fechaCita","Fecha cita consulado"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2"><span className={lab}>Detalle del caso</span><input className={inp} value={form.detalle} onChange={e => set("detalle", e.target.value)} /></label>
              {[["llegada","Llegada a España"],["plazoMax","Plazo máximo"],["plazoIdeal","Plazo ideal"],["pasaporte","Pasaporte"],["fNac","Fecha nacimiento"],["nie","NIE"],["expediente","Nº expediente"],["fPresentacion","Fecha presentación"]].map(([k,l]) => (
                <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── FP ── */}
      {svc === "fp" && (
        <div className="grid grid-cols-2 gap-3">
          {[["centro","Centro"],["estadoAdm","Estado admisión"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* ── DOCTORADO ── */}
      {svc === "doc" && (
        <div className="grid grid-cols-2 gap-3">
          {[["centro","Universidad / programa"],["estadoAdm","Estado admisión"],["resultado","Resultado"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* ── LEGAL ── */}
      {svc === "legal" && (
        <div className="grid grid-cols-2 gap-3">
          {[["tipo","Tipo procedimiento"],["resultado","Resultado"],["asesor","Asesor"],["resolucion","Fecha resolución"],["nie","NIE"],["expediente","Nº expediente"]].map(([k,l]) => (
            <label key={k}><span className={lab}>{l}</span><input className={inp} value={form[k]} onChange={e => set(k, e.target.value)} /></label>
          ))}
        </div>
      )}

      {/* Pendientes */}
      <label>
        <span className={lab}>Pendientes generales (uno por línea)</span>
        <textarea className={`${inp} min-h-[56px] resize-y`} value={pendingStr} onChange={e => setPendingStr(e.target.value)} />
      </label>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
        <button onClick={onCancel} type="button"
          className="h-10 px-4 text-[13px] border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50">
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={saving} type="button"
          className="h-10 px-4 text-[13px] rounded-lg bg-primary text-white font-semibold disabled:opacity-50 hover:opacity-90">
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear cliente"}
        </button>
      </div>
    </div>
  );
}
