// src/pages/backoffice/solicitudes/EncabezadoClienteAdmin.jsx
import { useState } from "react";
import { formatearFecha } from "./utils";
import { boPATCH } from "../../../services/backofficeApi";
import IconoPaso from "../../../components/common/IconoPaso";

function iniciales(nombre) {
  if (!nombre) return "?";
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

// Un dato de la ficha: icono, etiqueta y valor. «Copiar» para lo que se
// pega en un portal o en un correo.
function Dato({ icono, label, valor, extra = null, copiar = false }) {
  const vacio = valor === null || valor === undefined || valor === "";
  return (
    <div className="ex-fdat">
      <span className="ico"><IconoPaso nombre={icono} /></span>
      <div>
        <small>{label}</small>
        {vacio ? <b className="vacio">Sin dato</b> : <b>{valor}</b>}
        {!vacio && extra}
        {!vacio && copiar && (
          <button type="button" className="cp" onClick={() => navigator.clipboard?.writeText(String(valor))}>copiar</button>
        )}
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

export default function EncabezadoClienteAdmin({ detalle, onClienteActualizado, resumen = null }) {
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
  const nombreCorto = (cli.nombre || "el asesorado").split(" ")[0];
  const cursoObjetivo = detalle?.curso_objetivo || datos.curso_objetivo || null;
  // Lo que la ficha necesita sí o sí y todavía no está.
  const faltan = [
    [!cli.telefono, "teléfono"],
    [!cli.email_contacto, "correo"],
    [!extra.ciudad, "ciudad"],
    [!cli.pasaporte, "pasaporte"],
    [!vencPasaporte, "vencimiento del pasaporte"],
    [!fechaNac, "fecha de nacimiento"],
    [!tituloUniv, "título"],
  ].filter(([f]) => f).map(([, n]) => n);

  return (
    <div className="space-y-0">
      {/* Avatar, nombre, la línea del expediente y el botón de editar */}
      <div className="ex-ficha-cab px-5 pt-5">
        <span className="av">{iniciales(cli.nombre)}</span>
        <div>
          <b>{cli.nombre || "—"}</b>
          <span>
            {[`#${detalle?.id_solicitud ?? ""}`, detalle?.tipo?.nombre || detalle?.titulo || null, cursoObjetivo ? `curso ${cursoObjetivo}` : null, asesores ? `asesor ${asesores}` : null]
              .filter(Boolean).join(" · ")}
          </span>
        </div>
        <button type="button" className={`ex-btn ${editando ? "" : "sec"}`} onClick={editando ? () => setEditando(false) : abrirEditor}>
          <IconoPaso nombre={editando ? "x" : "edit"} /> {editando ? "Cancelar" : "Editar"}
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

      {/* Lo que hay que mirar antes de nada: pasaporte, lo que falta, lo bueno. */}
      <div className="ex-alertas px-5 pb-1">
        {vencPasaporte ? (
          <span className={alerta ? "warn" : "ok"}>
            <IconoPaso nombre="idCard" /> {alerta ? alerta.msg : `Pasaporte vigente hasta ${formatearFecha(vencPasaporte)}`}
          </span>
        ) : (
          <span className="warn"><IconoPaso nombre="idCard" /> Sin vencimiento del pasaporte</span>
        )}
        {faltan.length > 0
          ? <span className="warn"><IconoPaso nombre="alert" /> Faltan {faltan.length} datos: {faltan.join(", ")}</span>
          : <span className="ok"><IconoPaso nombre="check" /> Ficha completa</span>}
        {resumen?.admitidas > 0 && <span className="ok"><IconoPaso nombre="trophy" /> {resumen.admitidas === 1 ? "Una admisión" : `${resumen.admitidas} admisiones`}</span>}
      </div>

      <div className="ex-fdatos px-5 pb-2">
        <Dato icono="phone" label="Teléfono" valor={cli.telefono} copiar />
        <Dato icono="mail" label="Correo" valor={cli.email_contacto} copiar />
        <Dato icono="pin" label="País y ciudad" valor={[cli.pais_origen, extra.ciudad].filter(Boolean).join(" · ") || null} />
        <Dato icono="calendar" label="Nacimiento" valor={fechaNac ? formatearFecha(fechaNac) : null} />
        <Dato icono="idCard" label="Pasaporte" valor={cli.pasaporte}
          extra={vencPasaporte ? <span className="ex-est" data-e={alerta ? "warn" : "ok"}>vence {formatearFecha(vencPasaporte)}</span> : null} />
        <Dato icono="calendar" label="Emisión del pasaporte" valor={emiPasaporte ? formatearFecha(emiPasaporte) : null} />
        <Dato icono="cap" label="Título" valor={tituloUniv} extra={tipoTitulo ? <span className="ex-est" data-e="info">{tipoTitulo}</span> : null} />
        <Dato icono="book" label="Universidad" valor={uniOrigen} extra={tipoUni ? <span className="ex-est" data-e="info">{tipoUni}</span> : null} />
        <Dato icono="calendar" label="Estudios" valor={inicioEstudios || finEstudios ? `${inicioEstudios || "?"} – ${finEstudios || "?"}` : null} />
        <Dato icono="award" label="Fecha del título" valor={fechaTitulo ? formatearFecha(fechaTitulo) : null} />
        <Dato icono="star" label="Promedio" valor={promedio} />
        <Dato icono="briefcase" label="Trabajo" valor={trabajo} />
        <Dato icono="calendar" label="Inicio previsto" valor={inicioPrevisto} />
        <Dato icono="coins" label="Presupuesto" valor={presupuesto} />
        <Dato icono="globe" label="Plan contratado" valor={detalle?.titulo || detalle?.tipo?.nombre || null}
          extra={comunidades.length > 0 ? <span className="chips">{comunidades.map((c) => <span key={c}>{c}</span>)}</span> : null} />
        <Dato icono="user" label="Asesores" valor={asesores} />
        {extra.nacionalidad || cli.nacionalidad ? <Dato icono="flag" label="Nacionalidad" valor={extra.nacionalidad || cli.nacionalidad} /> : null}
      </div>
      <p className="ex-mini px-5">
        Los datos vienen del perfil de {nombreCorto} y del formulario académico: se editan aquí y se actualizan en los dos sitios.
      </p>

      {resumen && (
        <div className="px-5 pt-4 pb-5">
          <p className="ex-sub">Resumen del expediente</p>
          <div className="ex-cuenta">
            <div><b>{resumen.docsOk}/{resumen.docsTotal}</b><span>documentos</span></div>
            <div><b>{resumen.informe}</b><span>informe</span></div>
            <div><b>{resumen.postulaciones}</b><span>postulaciones</span></div>
            <div><b>{resumen.admitidas}</b><span>admitidas</span></div>
          </div>
          <p className="ex-mini" style={{ marginTop: 0 }}>{resumen.nota}</p>
        </div>
      )}
    </div>
  );
}
