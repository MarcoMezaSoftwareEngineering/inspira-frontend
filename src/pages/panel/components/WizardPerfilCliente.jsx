import { useEffect, useState } from "react";
import { apiPATCH } from "../../../services/api";
import { dialog } from "../../../services/dialogService";
import Icono from "../../../components/common/Icono";
import IconoPaso from "../../../components/common/IconoPaso";
import {
  PAISES, AREAS, UNIS,
  parseTelefono, parseInicioPrevisto,
  Combobox, FL, TI, ErrMsg,
  TelefonoInput, SliderPresupuesto, MesAnioSelect,
} from "./perfil.shared";

// El paso académico solo se le pide a quien tiene un servicio de estudios;
// el resto termina en los documentos de viaje.
const STEPS = [
  {
    icon: "usuario",
    title: "¿Quién eres?",
    subtitle: "Cuéntanos sobre ti para personalizar tu experiencia",
  },
  {
    icon: "telefono",
    title: "Datos de contacto",
    subtitle: "¿Cómo podemos comunicarnos contigo?",
  },
  {
    icon: "pasaporte",
    title: "Documentos de viaje",
    subtitle: "Necesitamos tus datos para los trámites de visado y matrícula",
  },
  {
    icon: "birrete",
    title: "Perfil académico",
    subtitle: "Tu historial y tu plan de inicio en España",
  },
];

function initFormFromUser(user) {
  const tp = parseTelefono(user?.telefono);
  const de = user?.datos_extra || {};
  const wp = parseTelefono(de.whatsapp);
  const mismoWA = !de.whatsapp || de.whatsapp === user?.telefono;
  const ip = parseInicioPrevisto(de.inicio_previsto);
  return {
    nombre:                user?.nombre               || "",
    pais_origen:           user?.pais_origen          || "",
    fecha_nacimiento:      de.fecha_nacimiento        || "",
    nacionalidad:          de.nacionalidad            || "",
    ciudad:                de.ciudad                  || "",
    prefijo_telefono:      tp.prefijo,
    telefono_numero:       tp.numero,
    mismo_whatsapp:        mismoWA,
    prefijo_whatsapp:      wp.prefijo,
    whatsapp_numero:       wp.numero,
    dni:                   user?.dni                  || "",
    dni_emision:           de.dni_emision             || "",
    dni_vencimiento:       de.dni_vencimiento         || "",
    pasaporte:             user?.pasaporte            || "",
    pasaporte_emision:     de.pasaporte_emision       || "",
    pasaporte_vencimiento: de.pasaporte_vencimiento   || "",
    carrera_titulo:        de.carrera_titulo          || "",
    area_carrera:          de.area_carrera            || "",
    universidad_origen:    de.universidad_origen      || "",
    inicio_estudios:       de.inicio_estudios         || "",
    fin_estudios:          de.fin_estudios            || "",
    fecha_titulo:          de.fecha_titulo            || "",
    mes_inicio:            ip.mes,
    anio_inicio:           ip.anio,
    presupuesto_hasta:     de.presupuesto_hasta ? Number(de.presupuesto_hasta) : 3000,
  };
}

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.nombre?.trim())           errs.nombre = "El nombre completo es obligatorio";
    if (!form.pais_origen?.trim())      errs.pais_origen = "Selecciona tu país de origen";
    if (!form.fecha_nacimiento?.trim()) errs.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
  }
  if (step === 2) {
    if (!form.pasaporte?.trim())
      errs.pasaporte = "El número de pasaporte es obligatorio";
    if (!form.pasaporte_vencimiento?.trim())
      errs.pasaporte_vencimiento = "La fecha de vencimiento del pasaporte es obligatoria";
  }
  if (step === 3) {
    if (!form.carrera_titulo?.trim())
      errs.carrera_titulo = "El título universitario es obligatorio";
    if (!form.universidad_origen?.trim())
      errs.universidad_origen = "La universidad de origen es obligatoria";
    const anioRe = /^\d{4}$/;
    if (!form.inicio_estudios?.trim())
      errs.inicio_estudios = "El año de inicio es obligatorio";
    else if (!anioRe.test(form.inicio_estudios.trim()))
      errs.inicio_estudios = "Ingresa un año válido (ej. 2018)";
    if (!form.fin_estudios?.trim())
      errs.fin_estudios = "El año de fin es obligatorio";
    else if (!anioRe.test(form.fin_estudios.trim()))
      errs.fin_estudios = "Ingresa un año válido (ej. 2023)";
    if (!form.mes_inicio || !form.anio_inicio)
      errs.inicio_previsto = "Selecciona mes y año de inicio previsto";
    if (!form.presupuesto_hasta)
      errs.presupuesto_hasta = "Define tu presupuesto máximo";
  }
  return errs;
}

// ── Paso 1: Datos personales ──────────────────────────────────────────────────
function StepPersonal({ form, errs, set, handleChange }) {
  function handlePaisChange(nombre) {
    const pais = PAISES.find(p => p.nombre === nombre);
    set("pais_origen", nombre);
    set("prefijo_telefono", pais?.prefijo || form.prefijo_telefono);
    if (form.mismo_whatsapp) set("prefijo_whatsapp", pais?.prefijo || form.prefijo_whatsapp);
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <div className="col-span-2">
        <FL>Nombre completo *</FL>
        <TI name="nombre" value={form.nombre} onChange={handleChange}
          placeholder="María García López" err={errs.nombre} />
        <ErrMsg msg={errs.nombre} />
      </div>
      <div className="col-span-2">
        <FL>País de origen *</FL>
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
              <span className="ml-auto text-muted text-meta">{p.prefijo}</span>
            </span>
          )}
        />
        <ErrMsg msg={errs.pais_origen} />
      </div>
      <div>
        <FL>Fecha de nacimiento *</FL>
        <TI name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange}
          type="date" err={errs.fecha_nacimiento} />
        <ErrMsg msg={errs.fecha_nacimiento} />
      </div>
      <div>
        <FL>Nacionalidad</FL>
        <TI name="nacionalidad" value={form.nacionalidad} onChange={handleChange}
          placeholder="Peruana" />
      </div>
      <div className="col-span-2">
        <FL>Ciudad de residencia</FL>
        <TI name="ciudad" value={form.ciudad} onChange={handleChange}
          placeholder="Lima" />
      </div>
    </div>
  );
}

// ── Paso 2: Contacto ──────────────────────────────────────────────────────────
function StepContacto({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="pnl-aviso" data-tono="info">
        <span className="pnl-aviso-icono"><Icono nombre="chat" size={16} /></span>
        <p className="pnl-aviso-texto">
          Tu asesor se comunicará contigo principalmente por WhatsApp. Asegúrate de que el número sea correcto.
        </p>
      </div>
      <div>
        <FL>Teléfono</FL>
        <TelefonoInput
          prefijo={form.prefijo_telefono} numero={form.telefono_numero}
          onPrefijo={v => set("prefijo_telefono", v)} onNumero={v => set("telefono_numero", v)}
        />
      </div>
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="pnl-campo-etiqueta">WhatsApp</span>
          <label className="pnl-casilla-fila ml-auto">
            <input type="checkbox" checked={form.mismo_whatsapp}
              onChange={e => {
                const checked = e.target.checked;
                set("mismo_whatsapp", checked);
                if (checked) {
                  set("prefijo_whatsapp", form.prefijo_telefono);
                  set("whatsapp_numero", form.telefono_numero);
                }
              }} />
            <span>Mismo que teléfono</span>
          </label>
        </div>
        {form.mismo_whatsapp
          ? <p className="pnl-perfil-nota">Se usará el mismo número de teléfono</p>
          : <TelefonoInput
              prefijo={form.prefijo_whatsapp} numero={form.whatsapp_numero}
              onPrefijo={v => set("prefijo_whatsapp", v)} onNumero={v => set("whatsapp_numero", v)}
            />
        }
      </div>
    </div>
  );
}

// ── Paso 3: Documentos ────────────────────────────────────────────────────────
function StepDocumentos({ form, errs, handleChange }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="pnl-eyebrow mb-3"><span className="punto" aria-hidden="true" />Pasaporte *</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
          <div className="col-span-2 sm:col-span-3">
            <FL>Número de pasaporte *</FL>
            <TI name="pasaporte" value={form.pasaporte} onChange={handleChange}
              placeholder="AB123456" err={errs.pasaporte} />
            <ErrMsg msg={errs.pasaporte} />
          </div>
          <div>
            <FL>Fecha de emisión</FL>
            <TI name="pasaporte_emision" value={form.pasaporte_emision} onChange={handleChange} type="date" />
          </div>
          <div className="sm:col-span-2">
            <FL>Fecha de vencimiento *</FL>
            <TI name="pasaporte_vencimiento" value={form.pasaporte_vencimiento} onChange={handleChange}
              type="date" err={errs.pasaporte_vencimiento} />
            <ErrMsg msg={errs.pasaporte_vencimiento} />
          </div>
        </div>
      </div>

      <div>
        <p className="pnl-eyebrow mb-3">
          <span className="punto" aria-hidden="true" />DNI / NIE / Cédula <small className="pnl-wizard-opcional">(opcional)</small>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-4">
          <div className="col-span-2 sm:col-span-3">
            <FL>Número de DNI / Cédula</FL>
            <TI name="dni" value={form.dni} onChange={handleChange} placeholder="12345678" />
          </div>
          <div>
            <FL>Fecha de emisión</FL>
            <TI name="dni_emision" value={form.dni_emision} onChange={handleChange} type="date" />
          </div>
          <div className="sm:col-span-2">
            <FL>Fecha de vencimiento</FL>
            <TI name="dni_vencimiento" value={form.dni_vencimiento} onChange={handleChange} type="date" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Paso 4: Académico ─────────────────────────────────────────────────────────
function StepAcademico({ form, errs, set, handleChange }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
      <div className="col-span-2">
        <FL>Carrera / Título universitario *</FL>
        <TI name="carrera_titulo" value={form.carrera_titulo} onChange={handleChange}
          placeholder="Ingeniería Industrial" err={errs.carrera_titulo} />
        <ErrMsg msg={errs.carrera_titulo} />
      </div>
      <div className="col-span-2">
        <FL>Área de estudio</FL>
        <select value={form.area_carrera} onChange={e => set("area_carrera", e.target.value)}
          className="pnl-campo-control">
          <option value="">— Selecciona —</option>
          {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div className="col-span-2">
        <FL>Universidad de origen *</FL>
        <Combobox
          value={form.universidad_origen}
          onChange={v => set("universidad_origen", v)}
          options={UNIS}
          placeholder="Busca tu universidad o escribe el nombre…"
          allowCustom
        />
        <ErrMsg msg={errs.universidad_origen} />
      </div>
      <div>
        <FL>Año de inicio *</FL>
        <TI name="inicio_estudios" value={form.inicio_estudios} onChange={handleChange}
          placeholder="2018" err={errs.inicio_estudios} />
        <ErrMsg msg={errs.inicio_estudios} />
      </div>
      <div>
        <FL>Año de fin *</FL>
        <TI name="fin_estudios" value={form.fin_estudios} onChange={handleChange}
          placeholder="2023" err={errs.fin_estudios} />
        <ErrMsg msg={errs.fin_estudios} />
      </div>
      <div className="col-span-2">
        <FL>Fecha del título</FL>
        <TI name="fecha_titulo" value={form.fecha_titulo} onChange={handleChange} type="date" />
      </div>
      <div className="col-span-2">
        <FL>Inicio previsto en España *</FL>
        <MesAnioSelect
          mes={form.mes_inicio}   onMes={v => { set("mes_inicio", v);  set("inicio_previsto", ""); }}
          anio={form.anio_inicio} onAnio={v => { set("anio_inicio", v); set("inicio_previsto", ""); }}
          err={errs.inicio_previsto}
        />
        <ErrMsg msg={errs.inicio_previsto} />
      </div>
      <div className="col-span-2">
        <FL>Presupuesto máximo en matrícula (€/año) *</FL>
        <div className="pnl-perfil-presupuesto" data-estado={errs.presupuesto_hasta ? "error" : undefined}>
          <SliderPresupuesto value={form.presupuesto_hasta} onChange={v => set("presupuesto_hasta", v)} />
        </div>
        <ErrMsg msg={errs.presupuesto_hasta} />
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────
export default function WizardPerfilCliente({ user, onComplete, conAcademico = true }) {
  const pasos = conAcademico ? STEPS : STEPS.slice(0, 3);
  const ultimo = pasos.length - 1;
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState(() => initFormFromUser(user));
  const [errs, setErrs]     = useState({});
  const [saving, setSaving] = useState(false);

  // Bloquea scroll del body mientras el wizard está visible
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }));
    setErrs(p => ({ ...p, [key]: "" }));
  }
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrs(p => ({ ...p, [name]: "" }));
  }

  function handleNext() {
    const stepErrs = validateStep(step, form);
    if (Object.keys(stepErrs).length > 0) { setErrs(stepErrs); return; }
    setErrs({});
    setStep(s => s + 1);
  }

  function handleBack() {
    setErrs({});
    setStep(s => s - 1);
  }

  async function handleSubmit() {
    const stepErrs = validateStep(ultimo, form);
    if (Object.keys(stepErrs).length > 0) { setErrs(stepErrs); return; }

    setSaving(true);
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
      if (!r.ok) {
        setErrs({ _global: r.message || "Error al guardar. Intenta de nuevo." });
        return;
      }

      dialog.toast("¡Perfil completado! Bienvenido/a al panel.", "success");
      onComplete(r.cliente || { ...user, ...body, datos_extra: { ...(user?.datos_extra || {}), ...body.datos_extra } });
    } catch {
      setErrs({ _global: "Ocurrió un error al guardar. Por favor, intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  }

  const numSteps = pasos.length;

  return (
    <div
      className="pnl-velo-token pnl-wizard-velo fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ animation: "inspira-fade-in 0.2s ease" }}
    >
      <div
        className="pnl-hoja pnl-wizard w-full max-w-xl flex flex-col"
        style={{ animation: "wizard-slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* ── Barra de progreso ── */}
        <div className="pnl-barra pnl-wizard-barra shrink-0" style={{ "--p": ((step + 1) / numSteps) * 100 }}>
          <i />
        </div>

        {/* ── Cabecera ── */}
        <div className="pnl-wizard-cab shrink-0">
          <p className="pnl-eyebrow mb-4">
            <span className="punto" aria-hidden="true" />Paso {step + 1} de {numSteps}
          </p>
          <span className="pnl-wizard-icono" aria-hidden="true"><Icono nombre={pasos[step].icon} size={24} /></span>
          <h2 className="text-xl font-serif font-bold text-primary leading-tight">
            {pasos[step].title}
          </h2>
          <p className="text-cuerpo text-tinta-2 mt-1">{pasos[step].subtitle}</p>
        </div>

        <div className="h-px bg-linea mx-5 sm:mx-7 shrink-0" />

        {/* ── Contenido scrollable ── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-5 space-y-1">
          {errs._global && (
            <div className="pnl-aviso mb-3" data-tono="alto" role="alert">
              <span className="pnl-aviso-icono"><IconoPaso nombre="info" className="w-4 h-4" /></span>
              <p className="pnl-aviso-texto">{errs._global}</p>
            </div>
          )}

          {step === 0 && <StepPersonal form={form} errs={errs} set={set} handleChange={handleChange} />}
          {step === 1 && <StepContacto form={form} errs={errs} set={set} />}
          {step === 2 && <StepDocumentos form={form} errs={errs} handleChange={handleChange} />}
          {step === 3 && <StepAcademico form={form} errs={errs} set={set} handleChange={handleChange} />}
        </div>

        {/* ── Footer de navegación ── */}
        <div className="pnl-wizard-pie shrink-0">
          {step > 0
            ? (
              <button onClick={handleBack} disabled={saving}
                className="pnl-btn-texto">
                <IconoPaso nombre="arrowLeft" className="w-4 h-4" />
                Atrás
              </button>
            )
            : <div />
          }

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {pasos.map((_, i) => (
              <div key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-5 h-2 bg-verde"
                    : i < step
                      ? "w-2 h-2 bg-verde/40"
                      : "w-2 h-2 bg-linea"
                }`}
              />
            ))}
          </div>

          {step < numSteps - 1
            ? (
              <button onClick={handleNext}
                className="pnl-btn-primario">
                Siguiente
                <IconoPaso nombre="arrowRight" className="w-4 h-4" />
              </button>
            )
            : (
              <button onClick={handleSubmit} disabled={saving}
                className="pnl-btn-primario">
                {saving
                  ? <><span className="pnl-spinner" data-talla="s" aria-hidden="true" />Guardando…</>
                  : <>Guardar y continuar <IconoPaso nombre="check" className="w-4 h-4" strokeWidth={2.5} /></>
                }
              </button>
            )
          }
        </div>
      </div>
    </div>
  );
}
