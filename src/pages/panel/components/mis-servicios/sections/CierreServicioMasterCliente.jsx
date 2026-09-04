// src/pages/panel/components/mis-servicios/sections/CierreServicioMasterCliente.jsx
import { useEffect, useState } from "react";
import { apiGET, apiPOST } from "../../../../../services/api";
import { descargarArchivoProtegido } from "../../../../../services/descargas";
import { dialog } from "../../../../../services/dialogService";
import SeccionPanel from "./SeccionPanel";

/* Estos documentos van detrás de un endpoint con token: un <a href> relativo
   apuntaba al dominio del frontend y no descargaba nada. Ver
   services/descargas.js. */
function BotonVerDocumento({ id, etiqueta }) {
  const [cargando, setCargando] = useState(false);

  const abrir = async () => {
    setCargando(true);
    const r = await descargarArchivoProtegido(`/portales/justificantes/${id}/descargar`);
    setCargando(false);
    if (!r.ok) dialog.toast(r.error, "error");
  };

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={cargando}
      className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
    >
      {cargando ? "Abriendo…" : etiqueta}
    </button>
  );
}

function DerivacionStep({ paso, idx }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
        paso.done
          ? "bg-[#1D6A4A] text-white"
          : "bg-neutral-50 border border-neutral-200"
      }`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          paso.done
            ? "bg-white/20 text-white"
            : "bg-neutral-200 text-neutral-500"
        }`}
      >
        {paso.done ? "✓" : idx + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${paso.done ? "text-white" : "text-neutral-800"}`}>
          {paso.label}
        </p>
        <p className={`text-xs mt-0.5 ${paso.done ? "text-white/65" : "text-neutral-400"}`}>
          {paso.sub}
        </p>
      </div>
      <span className={`text-lg shrink-0 ${paso.done ? "text-yellow-300" : "text-neutral-200"}`}>
        {paso.done ? "⚡" : "○"}
      </span>
    </div>
  );
}

function ResultadosAdmision({ masters }) {
  if (!masters || masters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-neutral-200 rounded-xl text-center gap-2">
        <span className="text-3xl">📭</span>
        <p className="text-sm font-semibold text-neutral-700">Sin resultados todavía</p>
        <p className="text-xs text-neutral-400 max-w-[180px]">
          Los resultados aparecerán aquí cuando las universidades respondan a tus postulaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {masters.map((m) => (
        <div key={m.id_acceso_portal} className="border border-neutral-200 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-neutral-900 leading-snug">
                {m.master_label ? `${m.master_label}` : m.organismo}
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">{m.organismo}</p>
            </div>
            <span
              className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                m.estado_tramite === "MATRICULADO"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {m.estado_tramite === "MATRICULADO" ? "Matriculado" : "Admitido"}
            </span>
          </div>
          {(m.carta_admision || m.comprobante_pago) && (
            <div className="flex gap-3 mt-2 pt-2 border-t border-neutral-100">
              {m.carta_admision && (
                <BotonVerDocumento
                  id={m.carta_admision.id_justificante}
                  etiqueta="Ver carta de admisión"
                />
              )}
              {m.comprobante_pago && (
                <BotonVerDocumento
                  id={m.comprobante_pago.id_justificante}
                  etiqueta="Ver comprobante"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CierreServicioMasterCliente({ idSolicitud }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setMsg("");
      try {
        const r = await apiGET(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8`);
        if (!r.ok) {
          if (!cancelled) setMsg(r.msg || "No se pudo cargar el resumen final.");
          return;
        }
        if (!cancelled) setData(r);
      } catch {
        if (!cancelled) setMsg("No se pudo cargar el resumen final.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [idSolicitud]);

  const handleCTA = async () => {
    try {
      const r = await apiPOST(`/cierre-master/panel/solicitudes/${idSolicitud}/bloque8/cta-visa`, {});
      if (r.ok) {
        dialog.toast(r.msg || "Hemos registrado tu interés. Te contactaremos pronto.", "success");
      } else {
        dialog.toast(r.msg || "No se pudo iniciar la asesoría.", "error");
      }
    } catch {
      dialog.toast("Error al iniciar la asesoría de visa/estancia.", "error");
    }
  };

  const pasos = data?.pasos_derivacion || [];
  const masters = data?.masters || [];
  const masterFinal = data?.master_final || null;

  const subtitulo = loading
    ? "Cargando…"
    : masterFinal
    ? `Admitido en: ${masterFinal.master_label || masterFinal.organismo}`
    : "Resumen final, resultados de admisión y próximos pasos.";

  if (!loading && !msg && !data) return null;

  return (
    <SeccionPanel
      numero="8"
      titulo="Cierre de servicio y derivación"
      subtitulo={subtitulo}
      sectionId="8"
    >
      {loading && (
        <div className="flex items-center gap-2 text-neutral-400 py-2">
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-primary-light rounded-full animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {msg && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-red-500">⚠</span>
          <p className="text-sm text-red-700">{msg}</p>
        </div>
      )}

      {!loading && !msg && data && (
        <div className="space-y-5">

          {/* Header banner */}
          <div className="flex items-center gap-4 bg-[#1D6A4A] rounded-xl px-5 py-4">
            <span className="text-3xl shrink-0">🏁</span>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-base">Cierre del expediente #{idSolicitud}</p>
              <p className="text-white/65 text-xs mt-0.5">
                Tu proceso está en curso — aquí verás el resumen final cuando concluya.
              </p>
            </div>
          </div>

          {/* Resumen financiero */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
              Resumen financiero del caso
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 border border-neutral-200 rounded-xl">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mb-1 leading-tight">
                  Inversión total másteres
                </p>
                <p className="text-2xl font-black text-neutral-400">
                  {data.inversion_total || "—"}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">Pendiente admisión</p>
              </div>
              <div className="text-center p-4 border border-neutral-200 rounded-xl">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mb-1 leading-tight">
                  Plan contratado con Inspira
                </p>
                <p className="text-sm font-black text-[#1D6A4A] leading-snug">
                  {data.plan_nombre || "—"}
                </p>
              </div>
              <div className="text-center p-4 border border-neutral-200 rounded-xl">
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mb-1 leading-tight">
                  Matrícula más económica
                </p>
                <p className="text-2xl font-black text-neutral-400">
                  {data.matricula_minima || "—"}
                </p>
                <p className="text-[10px] text-neutral-400 mt-1">Pendiente admisión</p>
              </div>
            </div>
          </div>

          {/* Resultados + Derivación */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                Resultados de admisión
              </p>
              <ResultadosAdmision masters={masters} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
                Derivación a extranjería / Visa
              </p>
              <div className="space-y-2">
                {pasos.map((paso, idx) => (
                  <DerivacionStep key={idx} paso={paso} idx={idx} />
                ))}
              </div>
            </div>
          </div>

          {/* Notas de cierre */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
              Notas de cierre
            </p>
            <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50 min-h-[60px]">
              {data.notas_cierre ? (
                <p className="text-sm text-neutral-700">{data.notas_cierre}</p>
              ) : (
                <p className="text-sm text-neutral-400 italic">
                  Sin notas registradas todavía. Tu asesor dejará aquí comentarios al cierre del servicio.
                </p>
              )}
            </div>
          </div>

          {/* CTA Encuesta / Visa */}
          {masterFinal ? (
            <div className="flex items-center justify-between gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  ¡Enhorabuena! Puedes continuar con tu visa de estudios
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {masterFinal.master_label
                    ? `${masterFinal.master_label} — ${masterFinal.organismo}`
                    : masterFinal.organismo}
                </p>
              </div>
              <button
                onClick={handleCTA}
                className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#1D6A4A] text-white hover:bg-[#155a3c] transition-all active:scale-95"
              >
                Contratar visa/estancia
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 bg-[#e8f2ef] border border-[#1D6A4A]/20 rounded-xl px-5 py-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold text-[#1D6A4A]">
                  ¿Cómo fue tu experiencia con Inspira Legal?
                </p>
                <p className="text-xs text-[#2d5f4f] mt-0.5">
                  Tu opinión nos ayuda a mejorar el servicio para futuros estudiantes.
                </p>
              </div>
              <button className="shrink-0 inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#1D6A4A] text-white hover:bg-[#155a3c] transition-all active:scale-95">
                📝 Responder encuesta
              </button>
            </div>
          )}

        </div>
      )}
    </SeccionPanel>
  );
}
