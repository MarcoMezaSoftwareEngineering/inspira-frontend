// src/pages/backoffice/solicitudes/CierreServicioMasterAdmin.jsx
import { useEffect, useState } from "react";
import { boGET, boPOST, boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";

const PASOS_DERIVACION = [
  { label: "Informe de másteres entregado",          subtitulo: "Revisado por asesor" },
  { label: "Elección confirmada por el cliente",     subtitulo: "Másteres seleccionados" },
  { label: "Postulaciones en curso",                 subtitulo: "Esperando cartas de admisión" },
  { label: "Carta de admisión recibida",             subtitulo: "Necesaria para tramitar la visa" },
  { label: "Derivar a extranjería · Visa de estudios", subtitulo: "Iniciar proceso con Inspira Legal" },
  { label: "Cierre y archivo del expediente",        subtitulo: "Encuesta de satisfacción al cliente" },
];

function estadoCard(estado) {
  const e = (estado || "").toUpperCase();
  if (["ADMITIDA","MATRICULADO","RESUELTO_FAVORABLE"].includes(e))
    return { label: "✓ Admitido",    border: "border-[#1D6A4A]",  bg: "bg-[#E8F5EE]", badge: "bg-[#1D6A4A] text-white" };
  if (["EN_EVALUACION","PRESENTADA"].includes(e))
    return { label: "⚡ En proceso", border: "border-[#1A3557]",  bg: "bg-[#EEF2F8]", badge: "bg-[#1A3557] text-white" };
  if (e === "LISTA_ESPERA")
    return { label: "⏳ En espera",  border: "border-amber-400",  bg: "bg-amber-50",  badge: "bg-amber-500 text-white" };
  if (["DENEGADA","RESUELTO_DESFAVORABLE"].includes(e))
    return { label: "✗ Denegado",   border: "border-red-400",    bg: "bg-red-50",    badge: "bg-red-500 text-white" };
  return       { label: "⏳ Pendiente", border: "border-amber-300", bg: "bg-amber-50/60", badge: "bg-amber-400 text-white" };
}

const RESUMEN_VACIO = { inversion_total: "", plan_contratado: "", matricula_minima: "" };

export default function CierreServicioMasterAdmin({ idSolicitud }) {
  const [masters,   setMasters]   = useState([]);
  const [detalle,   setDetalle]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [resumen,   setResumen]   = useState(RESUMEN_VACIO);
  const [pasos,     setPasos]     = useState(() => PASOS_DERIVACION.map(() => false));
  const [notas,     setNotas]     = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [r, rd] = await Promise.all([
          boGET(`/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8`),
          boGET(`/backoffice/solicitudes/${idSolicitud}`),
        ]);
        if (cancelled) return;
        if (r.ok && r.masters) setMasters(r.masters);
        const dp = rd?.datos_panel || {};
        const rf = dp.resumen_financiero;
        if (rf) setResumen({ inversion_total: rf.inversion_total ?? "", plan_contratado: rf.plan_contratado ?? "", matricula_minima: rf.matricula_minima ?? "" });
        if (Array.isArray(dp.pasos_derivacion)) setPasos(dp.pasos_derivacion);
        if (dp.notas_cierre) setNotas(dp.notas_cierre);
        setDetalle(rd);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  async function guardarPanel(patch) {
    setGuardando(true);
    try {
      await boPATCH(`/backoffice/solicitudes/${idSolicitud}/datos-panel`, patch);
    } finally {
      setGuardando(false);
    }
  }

  async function togglePaso(idx) {
    const nuevos = pasos.map((v, i) => (i === idx ? !v : v));
    setPasos(nuevos);
    await guardarPanel({ pasos_derivacion: nuevos });
  }

  function pasoEstado(idx) {
    if (pasos[idx]) return "done";
    // el primero no-hecho que sigue a todos los hechos anteriores es "activo"
    const primerPendiente = pasos.findIndex((v) => !v);
    if (primerPendiente === idx) return "activo";
    return "pendiente";
  }

  const handleSave = async (idx) => {
    const row = masters[idx];
    const r = await boPOST(
      `/api/cierre-master/admin/solicitudes/${idSolicitud}/bloque8/decisiones`,
      { id_acceso_portal: row.id_acceso_portal, decision_cliente: row.decision_cliente, es_master_final: row.es_master_final, info_pagos: row.info_pagos }
    );
    if (!r.ok) { dialog.toast(r.msg || "Error guardando decisión", "error"); return; }
  };

  // datos de cabecera
  const cli   = detalle?.cliente;
  const plan  = detalle?.titulo || "";
  const datos = detalle?.datos_formulario || {};
  const comunidades = Array.isArray(datos.comunidades_preferidas)
    ? datos.comunidades_preferidas.join(", ")
    : datos.comunidades_preferidas || "";
  const nEnProceso = masters.length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2 text-neutral-400 text-xs">
        <div className="w-4 h-4 border-2 border-[#023A4B] border-t-transparent rounded-full animate-spin" />
        Cargando cierre…
      </div>
    );
  }

  return (
    <div className="-mx-5 -mt-4 overflow-hidden">

      {/* ── Cabecera ── */}
      <div className="px-5 py-4 flex flex-wrap items-center gap-3"
        style={{ background: "linear-gradient(135deg, #1D6A4A, #1A3557)" }}
      >
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg shrink-0">🏁</div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-sm font-bold text-white leading-snug">
            Cierre del expediente #{idSolicitud}{cli?.nombre ? ` — ${cli.nombre}` : ""}
          </p>
          <p className="text-[11px] text-white/70 mt-0.5">
            {[plan, comunidades, nEnProceso > 0 ? `${nEnProceso} máster${nEnProceso > 1 ? "es" : ""} en proceso` : ""].filter(Boolean).join(" · ")}
          </p>
        </div>
        {guardando && <span className="text-[10px] text-white/50 font-mono shrink-0">Guardando…</span>}
        <div className="flex gap-2 shrink-0">
          <button type="button" disabled
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/12 text-white/70 border border-white/20 opacity-60 cursor-not-allowed">
            📄 Exportar expediente
          </button>
          <button type="button" disabled
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#F5C842] text-[#1A3557] opacity-60 cursor-not-allowed">
            ✓ Cerrar expediente
          </button>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div className="px-5 pt-4 pb-6 space-y-5">

        {/* Resumen financiero */}
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[.15em] text-[#1D6A4A] font-mono mb-2.5 pb-1.5 border-b-2 border-[#E8F5EE]">
            Resumen financiero del caso
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "inversion_total",  label: "Inversión total másteres",   color: "text-[#1D6A4A]" },
              { key: "plan_contratado",  label: "Plan contratado con Inspira", color: "text-[#1A3557]" },
              { key: "matricula_minima", label: "Matrícula más económica",     color: "text-amber-600" },
            ].map(({ key, label, color }) => (
              <div key={key} className="bg-neutral-50 rounded-xl px-3 py-3 text-center">
                <input
                  type="text"
                  value={resumen[key]}
                  onChange={(e) => setResumen((r) => ({ ...r, [key]: e.target.value }))}
                  onBlur={() => guardarPanel({ resumen_financiero: resumen })}
                  placeholder="—"
                  className={`w-full bg-transparent text-center font-serif text-lg font-bold ${color} outline-none border-b border-transparent focus:border-neutral-300 transition placeholder:text-neutral-300`}
                />
                <p className="text-[10.5px] text-neutral-400 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* El máster final y los dos caminos: es lo que cierra el servicio. */}
        {(() => {
          const fin = masters.find((m) => m.es_master_final)
            || masters.find((m) => ["ADMITIDA", "MATRICULADO"].includes(m.estado_tramite));
          if (!fin) return null;
          return (
            <div>
              <div className="ex-final">
                <span className="ex-final-ico">🎓</span>
                <div className="min-w-0">
                  <small>Máster final</small>
                  <b>{fin.master_label || fin.organismo}</b>
                  <span className="l">{fin.master_label ? fin.organismo : "Admisión confirmada"}{fin.info_pagos ? ` · ${fin.info_pagos}` : ""}</span>
                </div>
              </div>
              <p className="ex-sub" style={{ marginTop: 14 }}>Derivar a visado</p>
              <p className="text-[12.5px] text-neutral-500 leading-relaxed">
                Crea el expediente con los datos de la ficha, la carta de admisión y el pasaporte ya cargados.
              </p>
              <div className="ex-rutas">
                <button type="button" className="ex-ruta" onClick={() => dialog.toast("Se crea el expediente de visa de estudios con los datos del asesorado.", "success")}>
                  <span className="ex-h-ico">🛂</span>
                  <b>Visa de estudios (consulado, Perú)</b>
                  <em>Crear</em>
                  <span className="d">Pide seis meses de medios de origen lícito. Diagnóstico, solvencia, documentos, declaración jurada y formulario.</span>
                </button>
                <button type="button" className="ex-ruta" onClick={() => dialog.toast("Se crea el expediente de estancia por estudios (EX-00).", "success")}>
                  <span className="ex-h-ico">🏠</span>
                  <b>Estancia por estudios (EX-00, España)</b>
                  <em>Crear</em>
                  <span className="d">Solo fondos propios. Se presenta antes de que caduque su estancia legal.</span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* Grid dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Resultados de admisión */}
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[.15em] text-[#1D6A4A] font-mono mb-2.5 pb-1.5 border-b-2 border-[#E8F5EE]">
              Resultados de admisión
            </p>
            {masters.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No hay másteres en proceso todavía.</p>
            ) : (
              <div className="space-y-2">
                {masters.map((m, idx) => {
                  const card = estadoCard(m.estado_tramite);
                  const nombre = m.master_label ? `${m.organismo} · ${m.master_label}` : m.organismo;
                  return (
                    <div key={m.id_acceso_portal}
                      className={`rounded-xl border-2 px-3 py-2.5 ${card.border} ${card.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${card.badge}`}>
                          {card.label}
                        </span>
                        <p className="font-serif text-[12.5px] text-[#1A3557] font-semibold flex-1 min-w-0 truncate">
                          {nombre}
                        </p>
                      </div>
                      {m.info_pagos && (
                        <p className="text-[11px] text-neutral-500 mb-1.5">{m.info_pagos}</p>
                      )}
                      <div className="flex gap-1.5 flex-wrap">
                        {m.decision_cliente && (
                          <span className="text-[10px] bg-white/60 border border-neutral-200 rounded-full px-2 py-0.5 text-neutral-600">
                            {m.decision_cliente === "ACEPTA_COMO_PRINCIPAL" ? "Principal" : m.decision_cliente === "EN_ESPERA" ? "En espera" : "Rechaza"}
                          </span>
                        )}
                        {m.es_master_final && (
                          <span className="text-[10px] bg-[#F5C842] text-[#1A3557] font-bold rounded-full px-2 py-0.5">
                            ★ Final
                          </span>
                        )}
                      </div>
                      {/* Decisión inline */}
                      <details className="mt-2">
                        <summary className="text-[10px] text-neutral-400 cursor-pointer hover:text-neutral-600 transition">
                          Editar decisión…
                        </summary>
                        <div className="mt-2 space-y-2 pt-2 border-t border-white/50">
                          <select
                            className="w-full border border-neutral-200 rounded-lg px-2 py-1 text-xs bg-white"
                            value={m.decision_cliente || ""}
                            onChange={(e) => setMasters((prev) => prev.map((x, i) => i === idx ? { ...x, decision_cliente: e.target.value || null } : x))}
                          >
                            <option value="">Sin decidir</option>
                            <option value="ACEPTA_COMO_PRINCIPAL">Acepta como principal</option>
                            <option value="EN_ESPERA">En espera</option>
                            <option value="RECHAZA">Rechaza</option>
                          </select>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <input type="checkbox" checked={!!m.es_master_final}
                              onChange={(e) => setMasters((prev) => prev.map((x, i) => i === idx ? { ...x, es_master_final: e.target.checked } : x))}
                            />
                            Marcar como máster final
                          </label>
                          <textarea rows={2} placeholder="Notas sobre pagos / matrícula…"
                            className="w-full border border-neutral-200 rounded-lg px-2 py-1 text-xs resize-none"
                            value={m.info_pagos || ""}
                            onChange={(e) => setMasters((prev) => prev.map((x, i) => i === idx ? { ...x, info_pagos: e.target.value } : x))}
                          />
                          <button type="button" onClick={() => handleSave(idx)}
                            className="text-xs px-3 py-1 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#155a3d] transition">
                            Guardar
                          </button>
                        </div>
                      </details>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Derivación a extranjería */}
          <div>
            <p className="text-[9.5px] font-bold uppercase tracking-[.15em] text-[#1D6A4A] font-mono mb-2.5 pb-1.5 border-b-2 border-[#E8F5EE]">
              Derivación a extranjería / visa
            </p>
            <div className="space-y-1.5">
              {PASOS_DERIVACION.map((paso, idx) => {
                const est = pasoEstado(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => togglePaso(idx)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-[1.5px] text-left transition-all hover:shadow-sm active:scale-[.99]
                      ${est === "done"    ? "border-[#1D6A4A]/25 bg-[#E8F5EE]" :
                        est === "activo"  ? "border-[#1A3557]/20 bg-[#EEF2F8]" :
                        "border-neutral-200 bg-neutral-50"}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono shrink-0 border-[1.5px]
                      ${est === "done"   ? "bg-[#1D6A4A] border-[#1D6A4A] text-white" :
                        est === "activo" ? "bg-[#1A3557] border-[#1A3557] text-white" :
                        "bg-neutral-50 border-neutral-300 text-neutral-400"}`}
                    >
                      {est === "done" ? "✓" : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12.5px] font-semibold leading-snug
                        ${est === "done" ? "text-[#1D6A4A]" : est === "activo" ? "text-[#1A3557]" : "text-neutral-700"}`}>
                        {paso.label}
                      </p>
                      <p className="text-[10.5px] text-neutral-400 mt-0.5">{paso.subtitulo}</p>
                    </div>
                    <span className="text-sm shrink-0">
                      {est === "done" ? "✅" : est === "activo" ? "⚡" : "○"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notas de cierre */}
        <div>
          <p className="text-[9.5px] font-bold uppercase tracking-[.15em] text-[#1D6A4A] font-mono mb-2 pb-1.5 border-b-2 border-[#E8F5EE]">
            Notas de cierre
          </p>
          <textarea
            rows={4}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            onBlur={() => guardarPanel({ notas_cierre: notas })}
            placeholder="Observaciones internas del caso, instrucciones especiales, próximos pasos…"
            className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-300 outline-none focus:border-[#1D6A4A] resize-none transition leading-relaxed"
          />
        </div>

      </div>
    </div>
  );
}
