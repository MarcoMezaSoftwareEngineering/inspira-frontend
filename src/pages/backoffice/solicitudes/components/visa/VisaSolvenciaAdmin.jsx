import { useEffect, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { Campo, GuardarBtn, SubLabel } from "./visaWidgets";

export default function VisaSolvenciaAdmin({ idSolicitud, expediente, onSaved }) {
  const tipo = expediente?.tipo_solvencia || "PENDIENTE";
  const [aval, setAval] = useState({ aval_nombre: "", aval_vinculo: "", aval_pais: "", aval_monto: "", aval_banco: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAval({
      aval_nombre: expediente?.aval_nombre || "",
      aval_vinculo: expediente?.aval_vinculo || "",
      aval_pais: expediente?.aval_pais || "",
      aval_monto: expediente?.aval_monto || "",
      aval_banco: expediente?.aval_banco || "",
    });
  }, [expediente]);

  async function guardarAval() {
    setSaving(true);
    try {
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, aval);
      if (r.ok) onSaved?.(r.expediente);
    } finally {
      setSaving(false);
    }
  }

  function set(k, v) { setAval((p) => ({ ...p, [k]: v })); }

  // La via la elige EL CLIENTE desde su portal. Aqui es solo lectura: si el
  // asesor pudiera cambiarla, le estaria pisando su decision y moviendole los
  // documentos que ya esta subiendo.
  const VIAS = {
    PROPIOS:   { icono: "🙋", titulo: "Medios propios", sub: "Con su propio dinero e ingresos", color: "#1D6A4A" },
    AVAL:      { icono: "👪", titulo: "Con avalista",   sub: "Un familiar directo lo financia", color: "#7D3C98" },
    MIXTO:     { icono: "🤝", titulo: "Mixto",          sub: "Su dinero + un avalista",         color: "#B9770E" },
    PENDIENTE: { icono: "⏳", titulo: "Sin elegir",     sub: "Todavia no ha decidido",          color: "#6B7280" },
  };
  const via = VIAS[tipo] || VIAS.PENDIENTE;

  return (
    <div className="px-5 py-4">
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-2">
        Via elegida por el cliente
      </p>

      <div className="rounded-xl border-2 px-4 py-3 flex items-center gap-3"
        style={{ borderColor: `${via.color}55`, background: `${via.color}0F` }}>
        <span className="text-2xl shrink-0">{via.icono}</span>
        <div className="min-w-0">
          <p className="text-[14px] font-bold" style={{ color: via.color }}>{via.titulo}</p>
          <p className="text-[11.5px] text-neutral-500">{via.sub}</p>
        </div>
      </div>

      <p className="text-[11.5px] text-neutral-500 mt-2 leading-relaxed">
        La elige el cliente desde su portal y no se toca desde aqui. Lo que le
        planteaste en el diagnostico se registra en el bloque 2, como recordatorio.
      </p>

      {tipo === "PENDIENTE" && (
        <p className="text-[11.5px] text-[#9A7D0A] bg-[#FEF9E7] border border-[#F9E79F] rounded-lg px-3 py-2 mt-3 leading-relaxed">
          Aun no ha elegido. Puede subir documentos igualmente: solo se le afina la
          lista de solvencia cuando decida.
        </p>
      )}

      {(tipo === "AVAL" || tipo === "MIXTO") && (
        <>
          <SubLabel>Datos del aval</SubLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Campo label="Nombre del aval" value={aval.aval_nombre} onChange={(v) => set("aval_nombre", v)} />
            <Campo label="Vínculo con titular" value={aval.aval_vinculo} onChange={(v) => set("aval_vinculo", v)} placeholder="Tía/Tío, Padre/Madre…" />
            <Campo label="País de residencia" value={aval.aval_pais} onChange={(v) => set("aval_pais", v)} placeholder="España" />
            <Campo label="Monto acreditado (€)" value={aval.aval_monto} onChange={(v) => set("aval_monto", v)} placeholder="7.800 €" />
            <Campo label="Banco / entidad" value={aval.aval_banco} onChange={(v) => set("aval_banco", v)} />
          </div>
          <div className="flex justify-end mt-3"><GuardarBtn onClick={guardarAval} saving={saving} children="Guardar datos del aval" /></div>
        </>
      )}
    </div>
  );
}
