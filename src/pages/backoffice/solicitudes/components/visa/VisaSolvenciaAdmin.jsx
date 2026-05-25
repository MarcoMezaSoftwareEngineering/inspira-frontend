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

  async function setTipo(nuevo) {
    if (nuevo === tipo) return;
    const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, { tipo_solvencia: nuevo });
    if (r.ok) onSaved?.(r.expediente);
  }

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

  const opt = (val, icon, titulo, sub) => {
    const on = tipo === val;
    const color = val === "PROPIOS" ? "#1D6A4A" : "#7D3C98";
    return (
      <button type="button" onClick={() => setTipo(val)}
        className={`flex-1 text-center rounded-xl border-2 px-3 py-3 transition-all ${on ? "" : "border-[#E2E8F0] bg-white"}`}
        style={on ? { borderColor: color, background: `${color}10` } : {}}>
        <span className="block text-xl mb-1">{icon}</span>
        <span className="block text-[12px] font-bold" style={{ color: on ? color : "#1A3557" }}>{titulo}</span>
        <span className="block text-[10px] text-neutral-500 mt-0.5">{sub}</span>
      </button>
    );
  };

  return (
    <div className="px-5 py-4">
      <p className="text-[12px] text-neutral-500 mb-3">
        El tipo de solvencia se confirma en la sesión de diagnóstico. Los documentos del Bloque 2 cambian según la variante activa.
      </p>
      <div className="flex gap-2">
        {opt("PROPIOS", "🙋", "Medios propios", "Cuenta bancaria propia · 6 meses · ~7.200 €")}
        {opt("AVAL", "👨‍👩‍👧", "Con aval / tercero", "Patrocinador · Vínculo familiar")}
      </div>

      {tipo === "AVAL" && (
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
