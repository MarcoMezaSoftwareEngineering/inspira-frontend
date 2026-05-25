import { useEffect, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { GuardarBtn } from "./visaWidgets";

const ITEMS = [
  { key: "visa_concedida", label: "Visa de estudios concedida", icon: "🇪🇸" },
  { key: "originales_devueltos", label: "Documentación original devuelta al cliente", icon: "📤" },
  { key: "sesiones_ok", label: "3 sesiones completadas (diagnóstico + seguimiento + pre-cita)", icon: "📹" },
  { key: "resena", label: "Solicitud de reseña enviada", icon: "⭐" },
];

export default function VisaCierreAdmin({ idSolicitud, expediente, onSaved }) {
  const [chk, setChk] = useState({});
  const [estado, setEstado] = useState("ABIERTO");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setChk(expediente?.cierre_checklist || {});
    setEstado(expediente?.cierre_estado || "ABIERTO");
  }, [expediente]);

  function toggle(key) { setChk((p) => ({ ...p, [key]: !p[key] })); }

  async function guardar(nuevoEstado) {
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
        cierre_checklist: chk,
        cierre_estado: nuevoEstado || estado,
      });
      if (r.ok) { setEstado(r.expediente?.cierre_estado || estado); onSaved?.(r.expediente); }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Checklist de cierre</p>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F6F9] text-[#6B7280]">{estado}</span>
      </div>
      {ITEMS.map((it) => (
        <button key={it.key} type="button" onClick={() => toggle(it.key)}
          className={`w-full flex items-center gap-3 text-left rounded-xl border px-3 py-2.5 transition-all ${chk[it.key] ? "border-emerald-300 bg-emerald-50/40" : "border-neutral-200 bg-white hover:border-neutral-300"}`}>
          <span className="text-lg">{it.icon}</span>
          <span className="flex-1 text-[12px] font-medium text-neutral-800">{it.label}</span>
          <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-[11px] ${chk[it.key] ? "bg-[#1D6A4A] border-[#1D6A4A] text-white" : "border-neutral-300 text-transparent"}`}>✓</span>
        </button>
      ))}
      <div className="flex flex-wrap gap-2 pt-2">
        <GuardarBtn onClick={() => guardar()} saving={saving} children="Guardar checklist" />
        <button type="button" onClick={() => guardar("CERRADO")} disabled={saving}
          className="text-[12px] font-semibold px-5 py-2 rounded-lg border-2 border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-50 transition-colors">
          ✓ Marcar como cerrado
        </button>
        <button type="button" onClick={() => guardar("CANCELADO")} disabled={saving}
          className="text-[12px] font-semibold px-5 py-2 rounded-lg border-2 border-red-400 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
          Cancelar servicio
        </button>
      </div>
    </div>
  );
}
