// Sesión de diagnóstico del expediente de visado.
//
// Aquí se registra la reunión y la estrategia que se le planteó al cliente.
// Ojo con la recomendación de solvencia: es un RECORDATORIO de lo que se
// habló, no una llave. Quien elige su vía —y con ella qué documentos se le
// abren— es el propio cliente desde su portal.
import { useEffect, useState } from "react";
import { boPUT, boPATCH } from "../../../../../services/backofficeApi";
import { Campo, Selecc, GuardarBtn } from "./visaWidgets";

const ESTADO_OPTS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PROGRAMADA", label: "Programada" },
  { value: "COMPLETADA", label: "Completada" },
];

const CANALES = [
  { value: "MEET",          icono: "🎥", titulo: "Google Meet",   pista: "Videollamada" },
  { value: "WHATSAPP",      icono: "💬", titulo: "WhatsApp",      pista: "Llamada o chat" },
  { value: "POR_PROGRAMAR", icono: "🗓️", titulo: "Por programar", pista: "Aún sin agendar" },
];

const RECOMENDACIONES = [
  { value: "PROPIOS", icono: "🙋", titulo: "Medios propios", color: "#1D6A4A" },
  { value: "AVAL",    icono: "👪", titulo: "Con avalista",   color: "#7D3C98" },
  { value: "MIXTO",   icono: "🤝", titulo: "Mixto",          color: "#B9770E" },
];

export default function VisaSesionAdmin({
  idSolicitud, tipo, sesion, onSaved, agenda = [],
  recomendada, onRecomendar, eleccionCliente,
}) {
  const [form, setForm] = useState({
    estado: "PENDIENTE", fecha: "", hora: "", canal: "", plataforma: "", enlace_meet: "", notas: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      estado: sesion?.estado || "PENDIENTE",
      fecha: sesion?.fecha || "",
      hora: sesion?.hora || "",
      canal: sesion?.canal || "",
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

  async function recomendar(valor) {
    const nuevo = recomendada === valor ? null : valor;
    const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, {
      solvencia_recomendada: nuevo,
    });
    if (r.ok) onRecomendar?.(r.expediente);
  }

  const elegido = eleccionCliente && eleccionCliente !== "PENDIENTE" ? eleccionCliente : null;
  const discrepa = elegido && recomendada && elegido !== recomendada;

  return (
    <div className="px-5 py-4 space-y-3">
      {/* Canal */}
      <div>
        <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
          Cómo se hace la sesión
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CANALES.map((c) => {
            const on = form.canal === c.value;
            return (
              <button
                key={c.value} type="button" onClick={() => set("canal", on ? "" : c.value)}
                className={`flex flex-col items-center gap-0.5 py-2.5 px-1 rounded-[11px] border-2 transition-all ${
                  on ? "border-[#023A4B] bg-[#EEF2F8]" : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                }`}
              >
                <span className="text-base">{c.icono}</span>
                <span className={`text-[11.5px] font-semibold ${on ? "text-[#023A4B]" : "text-[#6B7280]"}`}>{c.titulo}</span>
                <span className="text-[9.5px] text-neutral-400">{c.pista}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Estrategia planteada — sólo un recordatorio */}
      <div className="bg-[#F5EEF8] border border-[#D7BDE2] rounded-xl px-3 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#7D3C98] mb-1">
          Estrategia que le planteaste
        </p>
        <p className="text-[11.5px] text-neutral-600 leading-relaxed mb-2">
          Recordatorio de lo que se habló en esta sesión. <b>No condiciona nada</b>: el
          cliente elige su vía desde su portal y sus documentos se abren solos.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {RECOMENDACIONES.map((r) => {
            const on = recomendada === r.value;
            return (
              <button
                key={r.value} type="button" onClick={() => recomendar(r.value)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-[11px] border-2 text-[11.5px] font-semibold transition-all ${
                  on ? "" : "border-[#E2E8F0] bg-white text-[#6B7280] hover:border-[#CBD5E1]"
                }`}
                style={on ? { borderColor: r.color, background: `${r.color}12`, color: r.color } : {}}
              >
                <span className="text-base">{r.icono}</span>{r.titulo}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-neutral-500 mt-2">
          El cliente eligió:{" "}
          <b className="text-neutral-700">
            {elegido
              ? (RECOMENDACIONES.find((r) => r.value === elegido)?.titulo || elegido)
              : "todavía nada"}
          </b>
        </p>

        {discrepa && (
          <p className="text-[11.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 mt-2 leading-relaxed">
            ⚠️ El cliente eligió una vía distinta a la que le planteaste. No es un error
            —es su decisión— pero conviene repasarlo con él.
          </p>
        )}
      </div>

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
        {form.canal === "MEET" && (
          <div className="sm:col-span-2">
            <Campo label="Enlace de la reunión" value={form.enlace_meet} onChange={(v) => set("enlace_meet", v)}
              placeholder="https://meet.google.com/…" />
          </div>
        )}
        {form.canal === "WHATSAPP" && (
          <Campo label="Número / contacto" value={form.plataforma} onChange={(v) => set("plataforma", v)}
            placeholder="+51 …" />
        )}
      </div>

      <div className="flex justify-end"><GuardarBtn onClick={guardar} saving={saving} /></div>
    </div>
  );
}
