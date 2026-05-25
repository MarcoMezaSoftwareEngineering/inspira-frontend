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

  if (tipo === "PENDIENTE") {
    return (
      <div className="px-5 py-7 text-center">
        <span className="block text-3xl mb-2">💰</span>
        <p className="text-[13px] text-[#6B7280] max-w-md mx-auto leading-relaxed">
          El tipo de solvencia (medios propios o con aval) se define en el <b>Bloque 4 — Sesión de diagnóstico</b>.
          Mientras tanto, el Bloque 2 (Documentos) permanece bloqueado.
        </p>
      </div>
    );
  }

  const esAval = tipo === "AVAL";
  const color = esAval ? "#7D3C98" : "#1D6A4A";
  const bg = esAval ? "#F5EEF8" : "#E8F5EE";

  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border-2 px-4 py-3" style={{ borderColor: `${color}55`, background: bg }}>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>Variante definida</p>
        <p className="text-[15px] font-bold" style={{ color }}>
          {esAval ? "👨‍👩‍👧 Con aval / tercero" : "🙋 Medios propios"}
        </p>
        <p className="text-[11px] text-neutral-500 mt-1">
          {esAval
            ? "El cliente acredita la solvencia con un aval (familiar/tercero). El Bloque 2 muestra los documentos del aval."
            : "El cliente acredita la solvencia con su propia cuenta bancaria. El Bloque 2 muestra los documentos de medios propios."}
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">Para cambiarla, usa el selector en el Bloque 4 — Sesión de diagnóstico.</p>
      </div>

      {esAval && (
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
