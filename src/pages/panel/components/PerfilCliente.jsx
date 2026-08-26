// src/pages/panel/components/PerfilCliente.jsx
import { useEffect, useState } from "react";
import { apiPATCH } from "../../../services/api";
import {
  PAISES, AREAS, UNIS,
  parseTelefono, parseInicioPrevisto,
  Combobox, FL, TI, ErrMsg,
  TelefonoInput, SliderPresupuesto, MesAnioSelect,
} from "./perfil.shared";

function fmtFecha(iso) {
  if (!iso) return null;
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtPresupuesto(val) {
  if (!val) return null;
  const n = Number(val);
  return isNaN(n) ? String(val) : `${n.toLocaleString("es-ES")} €/año`;
}

// ── Chip de vista ──────────────────────────────────────────────────────────────
function Chip({ label, value, span2 }) {
  const vacio = !value;
  return (
    <div className={`border rounded-xl px-3 py-2 ${span2 ? "col-span-2" : ""} ${!vacio ? "border-[#1D6A4A]/20 bg-[#E8F5EE]" : "border-neutral-200 bg-neutral-50"}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest font-mono text-neutral-400 mb-0.5">{label}</p>
      <p className={`text-[12px] font-semibold truncate ${vacio ? "text-neutral-300 italic" : "text-neutral-800"}`}>
        {vacio ? "N/D" : value}
      </p>
    </div>
  );
}

function SecLabel({ children }) {
  return <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#1D6A4A] mb-1.5">{children}</p>;
}

// ── Validación ─────────────────────────────────────────────────────────────────
const REQUIRED = [
  ["nombre",               "El nombre es obligatorio"],
  ["pais_origen",          "Selecciona tu país de origen"],
  ["fecha_nacimiento",     "La fecha de nacimiento es obligatoria"],
  ["pasaporte",            "El número de pasaporte es obligatorio"],
  ["pasaporte_vencimiento","La fecha de vencimiento del pasaporte es obligatoria"],
  ["carrera_titulo",       "El título universitario es obligatorio"],
  ["universidad_origen",   "La universidad de origen es obligatoria"],
  ["inicio_estudios",      "El año de inicio de estudios es obligatorio"],
  ["fin_estudios",         "El año de fin de estudios es obligatorio"],
];

function validar(form) {
  const errs = {};
  for (const [key, msg] of REQUIRED) {
    if (!form[key] || !String(form[key]).trim()) errs[key] = msg;
  }
  const anioRe = /^\d{4}$/;
  if (form.inicio_estudios && !anioRe.test(String(form.inicio_estudios).trim()))
    errs.inicio_estudios = "Ingresa un año válido (ej. 2018)";
  if (form.fin_estudios && !anioRe.test(String(form.fin_estudios).trim()))
    errs.fin_estudios = "Ingresa un año válido (ej. 2023)";
  if (!form.mes_inicio || !form.anio_inicio) errs.inicio_previsto = "Selecciona mes y año de inicio previsto";
  if (!form.presupuesto_hasta) errs.presupuesto_hasta = "Define tu presupuesto máximo";
  return errs;
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function PerfilCliente({ user, onUserUpdated }) {
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [okMsg, setOkMsg]       = useState("");
  const [form, setForm]         = useState({});
  const [errs, setErrs]         = useState({});

  useEffect(() => {
    if (!user) return;
    const tp = parseTelefono(user.telefono);
    const de = user.datos_extra || {};
    const wp = parseTelefono(de.whatsapp);
    const mismoWA = !de.whatsapp || de.whatsapp === user.telefono;
    const ip = parseInicioPrevisto(de.inicio_previsto);
    setForm({
      nombre:                user.nombre        || "",
      pais_origen:           user.pais_origen   || "",
      prefijo_telefono:      tp.prefijo,
      telefono_numero:       tp.numero,
      mismo_whatsapp:        mismoWA,
      prefijo_whatsapp:      wp.prefijo,
      whatsapp_numero:       wp.numero,
      dni:                   user.dni           || "",
      dni_emision:           de.dni_emision     || "",
      dni_vencimiento:       de.dni_vencimiento || "",
      pasaporte:             user.pasaporte     || "",
      ciudad:                de.ciudad          || "",
      fecha_nacimiento:      de.fecha_nacimiento      || "",
      nacionalidad:          de.nacionalidad          || "",
      pasaporte_emision:     de.pasaporte_emision     || "",
      pasaporte_vencimiento: de.pasaporte_vencimiento || "",
      carrera_titulo:        de.carrera_titulo        || "",
      area_carrera:          de.area_carrera          || "",
      universidad_origen:    de.universidad_origen    || "",
      inicio_estudios:       de.inicio_estudios       || "",
      fin_estudios:          de.fin_estudios          || "",
      fecha_titulo:          de.fecha_titulo          || "",
      mes_inicio:            ip.mes,
      anio_inicio:           ip.anio,
      presupuesto_hasta:     de.presupuesto_hasta ? Number(de.presupuesto_hasta) : 3000,
    });
    setErrs({});
  }, [user]);

  if (!user) return <p className="text-sm text-neutral-400 p-4">Cargando…</p>;

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); setErrs(p => ({ ...p, [key]: "" })); }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrs(p => ({ ...p, [name]: "" }));
  }

  function handlePaisChange(nombre) {
    const pais = PAISES.find(p => p.nombre === nombre);
    setForm(p => ({
      ...p,
      pais_origen:      nombre,
      prefijo_telefono: pais?.prefijo || p.prefijo_telefono,
      prefijo_whatsapp: p.mismo_whatsapp ? (pais?.prefijo || p.prefijo_whatsapp) : p.prefijo_whatsapp,
    }));
    setErrs(p => ({ ...p, pais_origen: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errores = validar(form);
    if (Object.keys(errores).length > 0) { setErrs(errores); return; }

    setSaving(true); setError(""); setOkMsg("");
    try {
      const telefono = form.telefono_numero
        ? `${form.prefijo_telefono} ${form.telefono_numero}`.trim() : null;
      const whatsapp = form.mismo_whatsapp
        ? telefono
        : (form.whatsapp_numero ? `${form.prefijo_whatsapp} ${form.whatsapp_numero}`.trim() : null);
      const inicio_previsto = (form.mes_inicio && form.anio_inicio)
        ? `${form.mes_inicio} ${form.anio_inicio}` : null;

      const body = {
        nombre:      form.nombre      || null,
        telefono,
        dni:         form.dni         || null,
        pasaporte:   form.pasaporte   || null,
        pais_origen: form.pais_origen || null,
        datos_extra: {
          whatsapp,
          ciudad:                form.ciudad                || null,
          fecha_nacimiento:      form.fecha_nacimiento      || null,
          nacionalidad:          form.nacionalidad          || null,
          dni_emision:           form.dni_emision           || null,
          dni_vencimiento:       form.dni_vencimiento       || null,
          pasaporte_emision:     form.pasaporte_emision     || null,
          pasaporte_vencimiento: form.pasaporte_vencimiento || null,
          carrera_titulo:        form.carrera_titulo        || null,
          area_carrera:          form.area_carrera          || null,
          universidad_origen:    form.universidad_origen    || null,
          inicio_estudios:       form.inicio_estudios       || null,
          fin_estudios:          form.fin_estudios          || null,
          fecha_titulo:          form.fecha_titulo          || null,
          inicio_previsto,
          presupuesto_hasta:     form.presupuesto_hasta     || null,
        },
      };

      const r = await apiPATCH("/cliente/me", body);
      if (!r.ok) { setError(r.message || "Error al guardar."); return; }
      if (onUserUpdated) onUserUpdated(r.cliente || { ...user, ...body });
      setOkMsg("Datos guardados correctamente.");
      setEditMode(false);
    } catch {
      setError("Ocurrió un error al guardar los datos.");
    } finally {
      setSaving(false);
    }
  }

  // ── Vista ───────────────────────────────────────────────────────────────────
  if (!editMode) {
    const de = user.datos_extra || {};
    const tp = parseTelefono(user.telefono);
    const paisObj = PAISES.find(p => p.nombre === user.pais_origen);

    return (
      <div className="space-y-3">
        <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-xl font-bold text-white">
                  {(user.nombre || user.email_contacto || "?")[0].toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                {/* Los nombres completos peruanos llevan dos apellidos y pasan
                    de 35 caracteres: sin sitio para respirar, el nombre, el
                    correo y la fecha se apelotonaban en tres lineas pegadas. */}
                <p className="text-sm font-bold text-white leading-snug break-words" title={user.nombre}>
                  {user.nombre || "Sin nombre"}
                </p>
                <p className="text-xs text-white/60 truncate mt-1" title={user.email_contacto}>
                  {user.email_contacto}
                </p>
                <p className="text-[11px] text-white/40 mt-1">
                  Cliente desde {new Date(user.fecha_registro).toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => { setEditMode(true); setError(""); setOkMsg(""); setErrs({}); }}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 text-white text-xs font-semibold hover:bg-white/25 transition border border-white/20">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Editar
            </button>
          </div>

          <div className="px-5 py-4 space-y-3">
            <SecLabel>Datos personales</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <Chip label="Fecha de nacimiento" value={fmtFecha(de.fecha_nacimiento)} />
              <Chip label="País de origen"      value={paisObj ? `${paisObj.emoji} ${user.pais_origen}` : user.pais_origen} />
              <Chip label="Ciudad"              value={de.ciudad} />
              <Chip label="Nacionalidad"        value={de.nacionalidad} />
              <Chip label="Teléfono"            value={user.telefono ? `${tp.prefijo} ${tp.numero}` : null} />
              <Chip label="WhatsApp"            value={de.whatsapp && de.whatsapp !== user.telefono
                ? (() => { const w = parseTelefono(de.whatsapp); return `${w.prefijo} ${w.numero}`; })()
                : (user.telefono ? "Mismo que teléfono" : null)} />
            </div>

            <SecLabel>Documentos de identidad</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <Chip label="DNI / Cédula"            value={user.dni} />
              <Chip label="DNI — Emisión"           value={fmtFecha(de.dni_emision)} />
              <Chip label="DNI — Vencimiento"       value={fmtFecha(de.dni_vencimiento)} />
              <Chip label="Pasaporte"               value={user.pasaporte} />
              <Chip label="Pasaporte — Emisión"     value={fmtFecha(de.pasaporte_emision)} />
              <Chip label="Pasaporte — Vencimiento" value={fmtFecha(de.pasaporte_vencimiento)} />
            </div>

            <SecLabel>Datos académicos y plan</SecLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <Chip label="Carrera / Título"   value={de.carrera_titulo} />
              <Chip label="Área de estudio"    value={de.area_carrera} />
              <Chip label="Inicio de estudios" value={de.inicio_estudios} />
              <Chip label="Fin de estudios"    value={de.fin_estudios} />
              <Chip label="Fecha del título"   value={fmtFecha(de.fecha_titulo)} />
              <Chip label="Inicio previsto"    value={de.inicio_previsto} />
              <Chip label="Presupuesto máx."   value={fmtPresupuesto(de.presupuesto_hasta)} />
              <Chip label="Universidad"        value={de.universidad_origen} span2 />
            </div>
          </div>
        </div>

        {okMsg && (
          <div className="flex items-center gap-2 bg-[#E8F5EE] border border-[#1D6A4A]/30 rounded-xl px-4 py-3">
            <span className="text-[#1D6A4A] font-bold">✓</span>
            <p className="text-sm font-medium text-[#1D6A4A]">{okMsg}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Edición ──────────────────────────────────────────────────────────────────
  const numErrs = Object.values(errs).filter(Boolean).length;

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">

      <div className="bg-gradient-to-r from-[#1A3557] to-[#023A4B] px-5 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white">Editar mi perfil</p>
          <p className="text-[11px] text-white/50">Los datos académicos se pre-rellenan en tus solicitudes</p>
        </div>
        <button type="button" onClick={() => { setEditMode(false); setError(""); setErrs({}); }}
          className="text-xs text-white/60 hover:text-white transition px-2 py-1">
          ✕ Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4">

          {(error || numErrs > 0) && (
            <div className="lg:col-span-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-xs text-red-700">
                {error || `Hay ${numErrs} campo${numErrs > 1 ? "s" : ""} obligatorio${numErrs > 1 ? "s" : ""} sin completar.`}
              </p>
            </div>
          )}

          {/* ── Columna izquierda ── */}
          <div className="space-y-3">

            <div>
              <SecLabel>Datos personales</SecLabel>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <FL>Nombre completo</FL>
                  <TI name="nombre" value={form.nombre} onChange={handleChange} placeholder="María García" err={errs.nombre} />
                  <ErrMsg msg={errs.nombre} />
                </div>
                <div className="col-span-2">
                  <FL noEdit>Email</FL>
                  <TI value={user.email_contacto || ""} disabled />
                </div>
                <div>
                  <FL>Fecha de nacimiento</FL>
                  <TI name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} type="date" err={errs.fecha_nacimiento} />
                  <ErrMsg msg={errs.fecha_nacimiento} />
                </div>
                <div>
                  <FL>Nacionalidad</FL>
                  <TI name="nacionalidad" value={form.nacionalidad} onChange={handleChange} placeholder="Peruana" />
                </div>
                <div>
                  <FL>Ciudad</FL>
                  <TI name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Lima" />
                </div>
                <div>
                  <FL>País de origen</FL>
                  <Combobox
                    value={form.pais_origen}
                    onChange={p => handlePaisChange(typeof p === "string" ? p : p.nombre)}
                    options={PAISES}
                    placeholder="Busca tu país…"
                    getLabel={p => {
                      if (typeof p === "string") { const f = PAISES.find(x => x.nombre === p); return f ? `${f.emoji} ${f.nombre}` : p; }
                      return `${p.emoji} ${p.nombre}`;
                    }}
                    renderOption={p => (
                      <span className="flex items-center gap-2">
                        <span>{p.emoji}</span><span>{p.nombre}</span>
                        <span className="ml-auto text-neutral-400 text-xs">{p.prefijo}</span>
                      </span>
                    )}
                  />
                  <ErrMsg msg={errs.pais_origen} />
                </div>
              </div>
            </div>

            <div>
              <SecLabel>Contacto</SecLabel>
              <div className="space-y-2">
                <div>
                  <FL>Teléfono</FL>
                  <TelefonoInput
                    prefijo={form.prefijo_telefono} numero={form.telefono_numero}
                    onPrefijo={v => set("prefijo_telefono", v)} onNumero={v => set("telefono_numero", v)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">WhatsApp</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer ml-auto">
                      <input type="checkbox" checked={form.mismo_whatsapp}
                        onChange={e => set("mismo_whatsapp", e.target.checked)}
                        className="w-3.5 h-3.5 rounded accent-[#1D6A4A]" />
                      <span className="text-xs text-neutral-500">Mismo que teléfono</span>
                    </label>
                  </div>
                  {form.mismo_whatsapp
                    ? <p className="text-xs text-neutral-400 italic">Se usará el mismo número</p>
                    : <TelefonoInput
                        prefijo={form.prefijo_whatsapp} numero={form.whatsapp_numero}
                        onPrefijo={v => set("prefijo_whatsapp", v)} onNumero={v => set("whatsapp_numero", v)}
                      />
                  }
                </div>
              </div>
            </div>

          </div>

          {/* ── Columna derecha ── */}
          <div className="space-y-3">

            <div>
              <SecLabel>Documentos de identidad</SecLabel>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <FL>DNI / NIE / Cédula</FL>
                  <TI name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" />
                </div>
                <div>
                  <FL>DNI — Emisión</FL>
                  <TI name="dni_emision" value={form.dni_emision} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>DNI — Vencimiento</FL>
                  <TI name="dni_vencimiento" value={form.dni_vencimiento} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>Nº Pasaporte</FL>
                  <TI name="pasaporte" value={form.pasaporte} onChange={handleChange} placeholder="AB123456" err={errs.pasaporte} />
                  <ErrMsg msg={errs.pasaporte} />
                </div>
                <div>
                  <FL>Pasaporte — Emisión</FL>
                  <TI name="pasaporte_emision" value={form.pasaporte_emision} onChange={handleChange} type="date" />
                </div>
                <div>
                  <FL>Pasaporte — Vencimiento</FL>
                  <TI name="pasaporte_vencimiento" value={form.pasaporte_vencimiento} onChange={handleChange} type="date" err={errs.pasaporte_vencimiento} />
                  <ErrMsg msg={errs.pasaporte_vencimiento} />
                </div>
              </div>
            </div>

            <div>
              <SecLabel>Datos académicos y plan</SecLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FL>Carrera / Título</FL>
                  <TI name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange} placeholder="Ingeniería Industrial" err={errs.carrera_titulo} />
                  <ErrMsg msg={errs.carrera_titulo} />
                </div>
                <div>
                  <FL>Área de estudio</FL>
                  <select value={form.area_carrera} onChange={e => set("area_carrera", e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6A4A]/20 focus:border-[#1D6A4A] transition">
                    <option value="">— Selecciona —</option>
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-span-2 grid grid-cols-3 gap-2">
                  <div>
                    <FL>Inicio de estudios</FL>
                    <TI name="inicio_estudios" value={form.inicio_estudios} onChange={handleChange} placeholder="2018" err={errs.inicio_estudios} />
                    <ErrMsg msg={errs.inicio_estudios} />
                  </div>
                  <div>
                    <FL>Fin de estudios</FL>
                    <TI name="fin_estudios" value={form.fin_estudios} onChange={handleChange} placeholder="2023" err={errs.fin_estudios} />
                    <ErrMsg msg={errs.fin_estudios} />
                  </div>
                  <div>
                    <FL>Fecha del título</FL>
                    <TI name="fecha_titulo" value={form.fecha_titulo} onChange={handleChange} type="date" />
                  </div>
                </div>
                <div className="col-span-2">
                  <FL>Inicio previsto en España</FL>
                  <MesAnioSelect
                    mes={form.mes_inicio}    onMes={v => { set("mes_inicio", v);  setErrs(p => ({ ...p, inicio_previsto: "" })); }}
                    anio={form.anio_inicio}  onAnio={v => { set("anio_inicio", v); setErrs(p => ({ ...p, inicio_previsto: "" })); }}
                    err={errs.inicio_previsto}
                  />
                  <ErrMsg msg={errs.inicio_previsto} />
                </div>
                <div className="col-span-2">
                  <FL>Universidad de origen</FL>
                  <Combobox
                    value={form.universidad_origen}
                    onChange={v => { set("universidad_origen", v); }}
                    options={UNIS}
                    placeholder="Busca tu universidad o escribe el nombre…"
                    allowCustom
                  />
                  <ErrMsg msg={errs.universidad_origen} />
                </div>
                <div className="col-span-2">
                  <FL>Presupuesto máximo en matrícula (€/año)</FL>
                  <div className={`border rounded-xl px-4 py-3 mt-1 ${errs.presupuesto_hasta ? "border-red-300 bg-red-50" : "border-neutral-200 bg-neutral-50"}`}>
                    <SliderPresupuesto
                      value={form.presupuesto_hasta}
                      onChange={v => { set("presupuesto_hasta", v); }}
                    />
                  </div>
                  <ErrMsg msg={errs.presupuesto_hasta} />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-neutral-100 px-5 py-3 flex items-center justify-end gap-3 bg-neutral-50">
          <button type="button" onClick={() => { setEditMode(false); setError(""); setOkMsg(""); setErrs({}); }}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-white transition">
            Cancelar
          </button>
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-[#1D6A4A] text-white hover:bg-[#15533a] disabled:opacity-50 transition">
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
              : <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>Guardar cambios</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
