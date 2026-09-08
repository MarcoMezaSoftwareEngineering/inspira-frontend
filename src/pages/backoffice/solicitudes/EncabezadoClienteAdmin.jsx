// src/pages/backoffice/solicitudes/EncabezadoClienteAdmin.jsx
import { useState } from "react";
import { formatearFecha } from "./utils";
import { boPATCH } from "../../../services/backofficeApi";
import IconoPaso from "../../../components/common/IconoPaso";

// El icono de cada dato de la ficha.
const ICONO_CAMPO = {
  "Fecha nacimiento": "calendar", "Pasaporte": "idCard", "Venc. pasaporte": "idCard", "Emisión pasaporte": "idCard",
  "Título universitario": "cap", "Universidad origen": "cap", "Inicio estudios": "calendar", "Fin estudios": "calendar",
  "Fecha del título": "calendar", "País de origen": "pin", "Ciudad": "pin", "Inicio previsto": "calendar",
  "Presupuesto máx.": "coins", "Promedio": "star", "Trabajo actual": "briefcase", "Asesores": "user",
  "Tipo universidad": "cap", "Tipo título": "cap",
};

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Campo({ label, value, highlight, warn }) {
  const vacio = value === null || value === undefined || value === "";
  const tile = warn
    ? "bg-amber-100 text-amber-700"
    : highlight
      ? "bg-[#E8F5EE] text-[#1D6A4A]"
      : "bg-neutral-100 text-neutral-400";
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-neutral-100 min-w-0">
      <span className={`shrink-0 w-8 h-8 rounded-lg grid place-items-center ${tile}`}>
        <IconoPaso nombre={ICONO_CAMPO[label] || "info"} className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className={`text-[9px] font-bold uppercase tracking-widest font-mono ${warn ? "text-amber-600" : "text-neutral-400"}`}>
          {label}{warn && " ⚠"}
        </p>
        <p className={`text-[12.5px] font-semibold leading-snug break-words ${warn ? "text-amber-700" : vacio ? "text-neutral-300 italic" : "text-neutral-900"}`}>
          {vacio ? "N/D" : value}
        </p>
      </div>
    </div>
  );
}

function alertaPasaporte(vencimiento) {
  if (!vencimiento) return null;
  const d = new Date(vencimiento);
  if (isNaN(d)) return null;
  const hoy = new Date();
  const meses = (d - hoy) / (1000 * 60 * 60 * 24 * 30);
  if (meses < 0)  return { nivel: "rojo",    msg: `Pasaporte vencido (${formatearFecha(vencimiento)}) — renovación urgente.` };
  if (meses < 18) return { nivel: "rojo",    msg: `Pasaporte vence ${formatearFecha(vencimiento)} — menos de 18 meses. Renovar antes de postular.` };
  if (meses < 24) return { nivel: "amarillo", msg: `Pasaporte vence ${formatearFecha(vencimiento)} — menos de 2 años. Recomendar renovación pronto.` };
  return null;
}

function CampoEdit({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="text-[12px] font-medium text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#1D6A4A] focus:border-[#1D6A4A] placeholder:text-neutral-300"
      />
    </div>
  );
}

export default function EncabezadoClienteAdmin({ detalle, onClienteActualizado }) {
  const cli    = detalle?.cliente || {};
  const extra  = cli.datos_extra || {};
  const datos  = detalle?.datos_formulario || {};

  const [editando, setEditando]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorEdit, setErrorEdit] = useState(null);
  const [form, setForm]           = useState({});

  function abrirEditor() {
    setForm({
      nombre:               cli.nombre               || "",
      telefono:             cli.telefono             || "",
      pasaporte:            cli.pasaporte            || "",
      pais_origen:          cli.pais_origen          || "",
      ciudad:               extra.ciudad             || "",
      nacionalidad:         extra.nacionalidad       || cli.nacionalidad || "",
      fecha_nacimiento:     extra.fecha_nacimiento   || "",
      pasaporte_emision:    extra.pasaporte_emision  || "",
      pasaporte_vencimiento: extra.pasaporte_vencimiento || "",
      carrera_titulo:       extra.carrera_titulo     || datos.carrera_titulo    || "",
      universidad_origen:   extra.universidad_origen || datos.universidad_origen || "",
      inicio_estudios:      extra.inicio_estudios    || datos.inicio_estudios   || "",
      fin_estudios:         extra.fin_estudios       || datos.fin_estudios      || "",
      fecha_titulo:         extra.fecha_titulo       || datos.fecha_titulo      || "",
      inicio_previsto:      extra.inicio_previsto    || datos.inicio_previsto   || "",
      presupuesto_hasta:    extra.presupuesto_hasta  || datos.presupuesto_hasta || "",
    });
    setErrorEdit(null);
    setEditando(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function guardar() {
    setGuardando(true);
    setErrorEdit(null);
    try {
      const res = await boPATCH(`/backoffice/clientes/${cli.id_cliente}/perfil`, form);
      if (res.ok) {
        onClienteActualizado?.(res.cliente);
        setEditando(false);
      } else {
        setErrorEdit(res.msg || res.error || "Error al guardar");
      }
    } catch {
      setErrorEdit("Error de conexión");
    } finally {
      setGuardando(false);
    }
  }

  const vencPasaporte = extra.pasaporte_vencimiento ?? null;
  const alerta        = alertaPasaporte(vencPasaporte);

  const comunidades = Array.isArray(datos.comunidades_preferidas)
    ? datos.comunidades_preferidas
    : datos.comunidades_preferidas
      ? [datos.comunidades_preferidas]
      : [];

  const presupuestoVal = datos.presupuesto_hasta ?? extra.presupuesto_hasta ?? null;
  const presupuesto = presupuestoVal
    ? `Máx. ${Number(presupuestoVal).toLocaleString("es-ES")} €/año`
    : null;

  const tipoUni        = datos.tipo_universidad    ?? null;
  const tipoTitulo     = datos.tipo_titulo         ?? null;
  const inicioEstudios = extra.inicio_estudios     ?? datos.inicio_estudios ?? null;
  const finEstudios    = extra.fin_estudios         ?? datos.fin_estudios    ?? null;
  const fechaTitulo    = extra.fecha_titulo         ?? datos.fecha_titulo    ?? null;
  const fechaNac       = extra.fecha_nacimiento     ?? null;
  const emiPasaporte   = extra.pasaporte_emision    ?? null;
  const tituloUniv     = datos.carrera_titulo       ?? extra.carrera_titulo    ?? null;
  const uniOrigen      = datos.universidad_origen   ?? extra.universidad_origen ?? null;
  const inicioPrevisto = datos.inicio_previsto      ?? extra.inicio_previsto    ?? null;

  // Lo que Carina quiere ver de un vistazo además de lo anterior (08/09/2026):
  // promedio, trabajo actual, ciudad y quién lleva el expediente.
  const promedio = datos.promedio_peru
    ? `${datos.promedio_peru} / ${datos.promedio_escala || 20}`
    : null;
  const EXP = { sin: "Sin experiencia", "1-2": "1–2 años", "2-3": "2–3 años", "3-5": "3–5 años", "5-10": "5–10 años", "10+": "Más de 10 años" };
  const puesto = Array.isArray(datos.experiencia_detalle) ? datos.experiencia_detalle.find((p) => p?.cargo || p?.entidad) : null;
  const trabajo = puesto
    ? [puesto.cargo, puesto.entidad].filter(Boolean).join(" · ")
    : (EXP[datos.experiencia_anios] || null);
  const asesores = (detalle?.asesores || []).map((a) => a.nombre).filter(Boolean).join(" · ") || null;

  return (
    <div className="space-y-0">
      {/* Avatar + nombre + contacto + botón editar */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E8F5EE] to-[#EEF2F8] border-2 border-neutral-200 flex items-center justify-center shrink-0">
          <span className="font-serif text-lg font-bold text-[#1A3557]">{iniciales(cli.nombre)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-base font-bold text-[#1A3557] leading-snug">{cli.nombre || "—"}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
            {cli.email_contacto && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <span>✉</span>
                <span className="font-medium text-[#1A3557]">{cli.email_contacto}</span>
              </span>
            )}
            {cli.telefono && (
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                <span>📱</span>
                <span className="font-medium text-[#1A3557]">{cli.telefono}</span>
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={editando ? () => setEditando(false) : abrirEditor}
          className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
            editando
              ? "border-neutral-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              : "border-[#1D6A4A]/30 bg-[#E8F5EE] text-[#1D6A4A] hover:bg-[#d4eddf]"
          }`}
        >
          {editando ? "Cancelar" : "✏ Editar"}
        </button>
      </div>

      {/* Formulario de edición (inline) */}
      {editando && (
        <div className="mx-5 mb-3 border border-[#1A3557]/15 rounded-xl bg-[#F8FAFC] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Editar datos del cliente
          </p>

          {/* Datos personales */}
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2 mt-1">Datos personales</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <CampoEdit label="Nombre completo"     name="nombre"     value={form.nombre}     onChange={handleChange} />
            <CampoEdit label="Teléfono"            name="telefono"   value={form.telefono}   onChange={handleChange} placeholder="+34 600..." />
            <CampoEdit label="País de origen"      name="pais_origen"  value={form.pais_origen}  onChange={handleChange} placeholder="Perú" />
            <CampoEdit label="Ciudad"              name="ciudad"       value={form.ciudad}       onChange={handleChange} placeholder="Lima" />
            <CampoEdit label="Nacionalidad"        name="nacionalidad" value={form.nacionalidad} onChange={handleChange} placeholder="Peruana" />
          </div>

          {/* Documentos */}
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2">Documentos</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <CampoEdit label="Fecha nacimiento"    name="fecha_nacimiento"      type="date" value={form.fecha_nacimiento}      onChange={handleChange} />
            <CampoEdit label="Nº pasaporte"        name="pasaporte"             value={form.pasaporte}             onChange={handleChange} placeholder="AB123456" />
            <CampoEdit label="Emisión pasaporte"   name="pasaporte_emision"     type="date" value={form.pasaporte_emision}     onChange={handleChange} />
            <CampoEdit label="Vencimiento pasaporte" name="pasaporte_vencimiento" type="date" value={form.pasaporte_vencimiento} onChange={handleChange} />
          </div>

          {/* Datos académicos y plan */}
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#1D6A4A] mb-2">Datos académicos y plan</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            <CampoEdit label="Título universitario" name="carrera_titulo"     value={form.carrera_titulo}     onChange={handleChange} placeholder="Lic. Administración" />
            <CampoEdit label="Universidad origen"   name="universidad_origen" value={form.universidad_origen} onChange={handleChange} placeholder="PUCP" />
            <CampoEdit label="Inicio estudios"      name="inicio_estudios"    value={form.inicio_estudios}    onChange={handleChange} placeholder="2016" />
            <CampoEdit label="Fin estudios"         name="fin_estudios"       value={form.fin_estudios}       onChange={handleChange} placeholder="2021" />
            <CampoEdit label="Fecha del título"     name="fecha_titulo"       type="date" value={form.fecha_titulo} onChange={handleChange} />
            <CampoEdit label="Inicio previsto"      name="inicio_previsto"    value={form.inicio_previsto}    onChange={handleChange} placeholder="Septiembre 2026" />
            <CampoEdit label="Presupuesto (€/año)"  name="presupuesto_hasta"  type="number" value={form.presupuesto_hasta} onChange={handleChange} placeholder="15000" />
          </div>

          {errorEdit && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
              {errorEdit}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={guardar}
              disabled={guardando}
              className="text-[12px] font-semibold px-5 py-2 rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition-colors"
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      )}

      {/* Grid de campos (vista) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 px-5 pb-3">
        <Campo label="Fecha nacimiento"     value={fechaNac ? formatearFecha(fechaNac) : null} highlight={!!fechaNac} />
        <Campo label="Pasaporte"            value={cli.pasaporte}        warn={!!alerta && alerta.nivel === "rojo"} />
        <Campo label="Venc. pasaporte"      value={vencPasaporte ? formatearFecha(vencPasaporte) : null} warn={!!alerta} />
        <Campo label="Emisión pasaporte"    value={emiPasaporte  ? formatearFecha(emiPasaporte) : null}  highlight={!!emiPasaporte} />
        <Campo label="Título universitario"  value={tituloUniv}      highlight={!!tituloUniv} />
        <Campo label="Universidad origen"   value={uniOrigen}           highlight={!!uniOrigen} />
        <Campo label="Inicio estudios"      value={inicioEstudios}      highlight={!!inicioEstudios} />
        <Campo label="Fin estudios"         value={finEstudios}         highlight={!!finEstudios} />
        <Campo label="Fecha del título"     value={fechaTitulo ? formatearFecha(fechaTitulo) : null} highlight={!!fechaTitulo} />
        <Campo label="País de origen"       value={cli.pais_origen}     highlight={!!cli.pais_origen} />
        <Campo label="Inicio previsto"      value={inicioPrevisto}      highlight={!!inicioPrevisto} />
        <Campo label="Presupuesto máx."     value={presupuesto}         highlight={!!presupuesto} />
        <Campo label="Ciudad"               value={extra.ciudad}        highlight={!!extra.ciudad} />
        <Campo label="Promedio"             value={promedio}            highlight={!!promedio} />
        <Campo label="Trabajo actual"       value={trabajo}             highlight={!!trabajo} />
        <Campo label="Asesores"             value={asesores}            highlight={!!asesores} />
        {tipoUni    && <Campo label="Tipo universidad" value={tipoUni}    highlight />}
        {tipoTitulo && <Campo label="Tipo título"      value={tipoTitulo} highlight />}
      </div>

      {/* Chip plan contratado */}
      {(detalle?.titulo || comunidades.length > 0) && (
        <div className="flex items-center gap-3 mx-5 mb-3 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A3557] to-[#023A4B]">
          <span className="text-lg shrink-0">📦</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white mb-1">
              {detalle.titulo || "Plan contratado"}
            </p>
            {comunidades.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {comunidades.map((c) => (
                  <span key={c} className="bg-[#F5C842] text-[#1A3557] text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alerta pasaporte */}
      {alerta && (
        <div className={`mx-5 mb-4 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs leading-relaxed
          ${alerta.nivel === "rojo"
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-amber-50 border border-amber-200 text-amber-800"}`}
        >
          <span className="shrink-0 text-sm">{alerta.nivel === "rojo" ? "🔴" : "⚠️"}</span>
          <span>{alerta.msg}</span>
        </div>
      )}
    </div>
  );
}
