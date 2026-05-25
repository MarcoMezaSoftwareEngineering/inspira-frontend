import { useEffect, useState } from "react";
import { boPATCH } from "../../../../../services/backofficeApi";
import { Campo, Selecc, GuardarBtn, SubLabel } from "./visaWidgets";

const CAMPOS = [
  "apellidos", "apellidos_nacimiento", "nombres", "fecha_nacimiento", "lugar_nacimiento",
  "pais_nacimiento", "nacionalidad", "sexo", "estado_civil", "profesion", "tipo_documento",
  "num_pasaporte", "exp_pasaporte", "venc_pasaporte", "pais_expedicion", "dni", "telefono",
  "correo", "domicilio", "centro_nombre", "centro_direccion", "centro_telefono", "centro_correo",
  "centro_inicio", "centro_fin", "formulario_estado",
];

const SEXO = [{ value: "", label: "—" }, { value: "Mujer", label: "Mujer" }, { value: "Varón", label: "Varón" }];
const CIVIL = ["", "Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"].map((v) => ({ value: v, label: v || "—" }));
const FORM_ESTADO = [
  { value: "EN_PREPARACION", label: "En preparación" },
  { value: "ENVIADO", label: "Enviado al cliente" },
  { value: "FIRMADO", label: "Firmado" },
];

// mode: "formulario" (datos completos del visado) | "estado" (solo estado del formulario, B6)
export default function VisaFormularioAdmin({ idSolicitud, expediente, onSaved, mode = "formulario" }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const f = {};
    CAMPOS.forEach((k) => (f[k] = expediente?.[k] || (k === "formulario_estado" ? "EN_PREPARACION" : "")));
    setForm(f);
  }, [expediente]);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function guardar(extra = {}) {
    setSaving(true);
    try {
      const payload = mode === "estado" ? { formulario_estado: form.formulario_estado, ...extra } : { ...form, ...extra };
      const r = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/visa-expediente`, payload);
      if (r.ok) onSaved?.(r.expediente);
    } finally {
      setSaving(false);
    }
  }

  if (mode === "estado") {
    return (
      <div className="px-5 py-4 space-y-3">
        <p className="text-[12px] text-neutral-500">
          Inspira prepara el formulario oficial con los datos del cliente. Marca aquí su estado para que el cliente lo vea.
        </p>
        <div className="max-w-xs"><Selecc label="Estado del formulario" value={form.formulario_estado} onChange={(v) => set("formulario_estado", v)} options={FORM_ESTADO} /></div>
        <div className="flex gap-2">
          <GuardarBtn onClick={() => guardar()} saving={saving} children="Guardar estado" />
          <button type="button" onClick={() => guardar({ formulario_estado: "ENVIADO" })} disabled={saving}
            className="text-[12px] font-semibold px-5 py-2 rounded-lg border-2 border-[#1D6A4A] text-[#1D6A4A] hover:bg-[#E8F5EE] disabled:opacity-50 transition-colors">
            📤 Enviar al cliente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4">
      <p className="text-[12px] text-neutral-500">Datos específicos del formulario de visado (complementan el encabezado del cliente).</p>

      <SubLabel>Datos personales</SubLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Campo label="Apellido(s)" value={form.apellidos} onChange={(v) => set("apellidos", v)} />
        <Campo label="Apellidos de nacimiento" value={form.apellidos_nacimiento} onChange={(v) => set("apellidos_nacimiento", v)} placeholder="Si difiere" />
        <Campo label="Nombre(s)" value={form.nombres} onChange={(v) => set("nombres", v)} />
        <Campo label="Fecha nacimiento" value={form.fecha_nacimiento} onChange={(v) => set("fecha_nacimiento", v)} placeholder="dd-mm-aaaa" />
        <Campo label="Lugar nacimiento" value={form.lugar_nacimiento} onChange={(v) => set("lugar_nacimiento", v)} />
        <Campo label="País nacimiento" value={form.pais_nacimiento} onChange={(v) => set("pais_nacimiento", v)} />
        <Campo label="Nacionalidad" value={form.nacionalidad} onChange={(v) => set("nacionalidad", v)} />
        <Selecc label="Sexo" value={form.sexo} onChange={(v) => set("sexo", v)} options={SEXO} />
        <Selecc label="Estado civil" value={form.estado_civil} onChange={(v) => set("estado_civil", v)} options={CIVIL} />
        <Campo label="Profesión actual" value={form.profesion} onChange={(v) => set("profesion", v)} />
      </div>

      <SubLabel>Documento de viaje</SubLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Campo label="Tipo documento" value={form.tipo_documento} onChange={(v) => set("tipo_documento", v)} placeholder="Pasaporte ordinario" />
        <Campo label="N° pasaporte" value={form.num_pasaporte} onChange={(v) => set("num_pasaporte", v)} />
        <Campo label="Expedición" value={form.exp_pasaporte} onChange={(v) => set("exp_pasaporte", v)} />
        <Campo label="Válido hasta" value={form.venc_pasaporte} onChange={(v) => set("venc_pasaporte", v)} />
        <Campo label="País expedición" value={form.pais_expedicion} onChange={(v) => set("pais_expedicion", v)} />
        <Campo label="DNI / Cédula" value={form.dni} onChange={(v) => set("dni", v)} />
      </div>

      <SubLabel>Contacto</SubLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Campo label="Teléfono / WhatsApp" value={form.telefono} onChange={(v) => set("telefono", v)} />
        <Campo label="Correo electrónico" value={form.correo} onChange={(v) => set("correo", v)} />
        <Campo label="Domicilio postal" value={form.domicilio} onChange={(v) => set("domicilio", v)} />
      </div>

      <SubLabel>Centro de estudios</SubLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <Campo label="Nombre del centro" value={form.centro_nombre} onChange={(v) => set("centro_nombre", v)} />
        <Campo label="Dirección" value={form.centro_direccion} onChange={(v) => set("centro_direccion", v)} />
        <Campo label="Teléfono" value={form.centro_telefono} onChange={(v) => set("centro_telefono", v)} />
        <Campo label="Correo" value={form.centro_correo} onChange={(v) => set("centro_correo", v)} />
        <Campo label="Inicio estudios" value={form.centro_inicio} onChange={(v) => set("centro_inicio", v)} />
        <Campo label="Fin estudios" value={form.centro_fin} onChange={(v) => set("centro_fin", v)} />
      </div>

      <div className="flex justify-end mt-4"><GuardarBtn onClick={() => guardar()} saving={saving} children="Guardar datos del visado" /></div>
    </div>
  );
}
