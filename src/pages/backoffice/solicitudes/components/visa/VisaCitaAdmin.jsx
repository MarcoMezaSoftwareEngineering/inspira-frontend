import { useEffect, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { Campo, Selecc, GuardarBtn, SubLabel } from "./visaWidgets";

const ESTADO_OPTS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "AGENDADA", label: "Agendada" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "REALIZADA", label: "Realizada" },
  { value: "REAGENDAR", label: "Reagendar" },
];

const CAMPOS = ["cita_fecha", "cita_hora", "cita_ref_bls", "cita_tasa", "cita_estado", "cita_resultado", "cita_notas"];

export default function VisaCitaAdmin({ idSolicitud, expediente, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const f = {};
    CAMPOS.forEach((k) => (f[k] = expediente?.[k] || (k === "cita_estado" ? "PENDIENTE" : "")));
    setForm(f);
  }, [expediente]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function guardar() {
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, form);
      if (r.ok) onSaved?.(r.expediente);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 py-4 space-y-2">
      <p className="text-[12px] text-neutral-500">
        La visa de estudios se tramita en el Consulado de España a través de BLS International. Registra aquí la cita presencial.
      </p>
      <SubLabel>Cita BLS</SubLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Campo label="Fecha de cita" value={form.cita_fecha} onChange={(v) => set("cita_fecha", v)} placeholder="dd/mm/aaaa" />
        <Campo label="Hora" value={form.cita_hora} onChange={(v) => set("cita_hora", v)} placeholder="09:30" />
        <Campo label="N° referencia BLS" value={form.cita_ref_bls} onChange={(v) => set("cita_ref_bls", v)} />
        <Campo label="Tasa consular" value={form.cita_tasa} onChange={(v) => set("cita_tasa", v)} placeholder="Importe en efectivo" />
        <Selecc label="Estado" value={form.cita_estado} onChange={(v) => set("cita_estado", v)} options={ESTADO_OPTS} />
      </div>
      <SubLabel>Resultado</SubLabel>
      <Campo label="Resultado de la presentación" value={form.cita_resultado} onChange={(v) => set("cita_resultado", v)} placeholder="Documentación aceptada / Visa concedida…" />
      <Campo label="Notas del asesor (internas)" value={form.cita_notas} onChange={(v) => set("cita_notas", v)} />
      <div className="flex justify-end pt-1"><GuardarBtn onClick={guardar} saving={saving} /></div>
    </div>
  );
}
