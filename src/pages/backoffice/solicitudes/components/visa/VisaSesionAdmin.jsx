import { useEffect, useState } from "react";
import { boPUT } from "../../../../../services/backofficeApi";
import { Campo, Selecc, GuardarBtn } from "./visaWidgets";

const ESTADO_OPTS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PROGRAMADA", label: "Programada" },
  { value: "COMPLETADA", label: "Completada" },
];

export default function VisaSesionAdmin({ idSolicitud, tipo, sesion, onSaved, agenda = [] }) {
  const [form, setForm] = useState({ estado: "PENDIENTE", fecha: "", hora: "", plataforma: "", enlace_meet: "", notas: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      estado: sesion?.estado || "PENDIENTE",
      fecha: sesion?.fecha || "",
      hora: sesion?.hora || "",
      plataforma: sesion?.plataforma || "",
      enlace_meet: sesion?.enlace_meet || "",
      notas: sesion?.notas || "",
    });
  }, [sesion]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function guardar() {
    setSaving(true);
    try {
      const r = await boPUT(`/backoffice/solicitudes/${idSolicitud}/sesiones/${tipo}`, form);
      if (r.ok) onSaved?.(r.sesion);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 py-4 space-y-3">
      {agenda.length > 0 && (
        <div className="bg-[#FEF9E7] border border-[#F9E79F] rounded-xl px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A7D0A] mb-1">Agenda de la sesión</p>
          <ul className="text-[12px] text-neutral-600 leading-relaxed list-disc pl-4">
            {agenda.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Selecc label="Estado" value={form.estado} onChange={(v) => set("estado", v)} options={ESTADO_OPTS} />
        <Campo label="Fecha" value={form.fecha} onChange={(v) => set("fecha", v)} placeholder="10 de junio" />
        <Campo label="Hora" value={form.hora} onChange={(v) => set("hora", v)} placeholder="10:00 AM" />
        <Campo label="Plataforma" value={form.plataforma} onChange={(v) => set("plataforma", v)} placeholder="Google Meet" />
        <Campo label="Enlace de reunión" value={form.enlace_meet} onChange={(v) => set("enlace_meet", v)} placeholder="https://meet.google.com/..." />
      </div>
      <Campo label="Notas" value={form.notas} onChange={(v) => set("notas", v)} placeholder="Notas internas de la sesión" />
      <div className="flex justify-end"><GuardarBtn onClick={guardar} saving={saving} /></div>
    </div>
  );
}
