// Interruptor de los recordatorios automáticos del expediente.
//
// Mientras al cliente le falte completar datos, medios económicos o
// documentos, recibe un correo cada 5 días. Cuando el asesor da el expediente
// por terminado lo apaga aquí y dejan de enviarse.
import { useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";

function fecha(v) {
  if (!v) return null;
  try {
    return new Date(v).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return null;
  }
}

export default function VisaRecordatoriosAdmin({ idSolicitud, expediente, onSaved }) {
  const exp = expediente || {};
  const activos = exp.recordatorios_activos !== false;
  const enviados = exp.recordatorio_enviados || 0;
  const ultimo = fecha(exp.recordatorio_ultimo);

  const [saving, setSaving] = useState(false);

  async function alternar() {
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
        recordatorios_activos: !activos,
      });
      if (r.ok) onSaved?.(r.expediente);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${
      activos ? "border-neutral-200 bg-white" : "border-emerald-200 bg-emerald-50/60"
    }`}>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
          Recordatorios automáticos
        </p>
        <p className={`text-[13px] font-semibold mt-0.5 ${activos ? "text-neutral-800" : "text-[#1D6A4A]"}`}>
          {activos ? "🔔 Activos · un correo cada 5 días" : "✓ Expediente dado por terminado"}
        </p>
        <p className="text-[11.5px] text-neutral-500 mt-1 leading-snug">
          {activos
            ? enviados > 0
              ? `Se han enviado ${enviados}. Último: ${ultimo || "—"}. Sólo se envían si al cliente le falta algo.`
              : "Aún no se ha enviado ninguno. Sólo se envían si al cliente le falta algo por completar."
            : "No se le enviarán más recordatorios, aunque queden cosas sin completar."}
        </p>
      </div>

      <button
        type="button"
        onClick={alternar}
        disabled={saving}
        className={`shrink-0 text-[12px] font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
          activos
            ? "bg-[#1D6A4A] text-white hover:bg-[#15533a]"
            : "border border-neutral-300 bg-white text-neutral-700 hover:border-[#1D6A4A] hover:text-[#1D6A4A]"
        }`}
      >
        {saving ? "Guardando…" : activos ? "Marcar como terminado" : "Reactivar recordatorios"}
      </button>
    </div>
  );
}
