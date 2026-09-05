import { useState, useRef, useEffect, useContext } from "react";
import { apiGET } from "../../../../../services/api";
import SeccionPanel, { SeccionSiempreAbiertoCtx } from "./SeccionPanel";

// ── Constantes ────────────────────────────────────────────────────────────────

const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho",                   label: "Derecho" },
  { value: "Ingeniería y Tecnología",   label: "Ingeniería / TI" },
  { value: "Ciencias Sociales",         label: "Ciencias Sociales" },
  { value: "Educación",                 label: "Educación" },
  { value: "Salud",                     label: "Salud" },
  { value: "Humanidades",               label: "Humanidades" },
  { value: "Medio Ambiente",            label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño",             label: "Arte y Diseño" },
  { value: "Otra",                      label: "Otra" },
];


// Fallback estático (nombres exactos del seed) — solo si la API falla
const TODAS_COMUNIDADES_FALLBACK = [
  "Andalucía", "Aragón", "Asturias", "Cantabria", "Castilla-La Mancha",
  "Castilla y León", "Cataluña", "Comunidad de Madrid", "Comunidad Valenciana",
  "Extremadura", "Galicia", "La Rioja", "Murcia", "Navarra", "País Vasco",
];
const COMUNIDAD_INDIFERENTE = "Me da igual / No tengo preferencia";

const UNIS_SUGERENCIAS = [
  "Universidad Nacional Mayor de San Marcos","Pontificia Universidad Católica del Perú",
  "Universidad de Lima","Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia","Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico","Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas","Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal","Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  "Universidad Nacional de Colombia","Universidad de los Andes",
  "Universidad de Antioquia","Pontificia Universidad Javeriana",
  "Universidad del Rosario","Universidad del Valle","Universidad Industrial de Santander",
  "Universidad Nacional Autónoma de México","Instituto Politécnico Nacional",
  "Universidad de Guadalajara","Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla","Tecnológico de Monterrey",
  "Universidad de Buenos Aires","Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata","Universidad Nacional de Rosario",
  "Universidad de Chile","Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidade de São Paulo","Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  "Universidad Central del Ecuador","ESPOL – Escuela Politécnica del Litoral",
  "Universidad San Francisco de Quito",
  "Universidad Central de Venezuela","Universidad del Zulia",
  "Universidad Mayor de San Andrés","Universidad Nacional de Asunción",
  "Universidad de la República","Universidad de Costa Rica",
  "Universidad de San Carlos de Guatemala","Universidad Autónoma de Santo Domingo",
  "Universidade de Lisboa","Universidade do Porto",
];

const AUIP_KEYS = [
  "universidad de lima","universidad lima","universidad nacional mayor de san marcos","san marcos","unmsm",
  "pontificia universidad católica del perú","pucp","católica del perú","universidad nacional de ingeniería","uni peru",
  "universidad peruana cayetano heredia","cayetano heredia","universidad nacional agraria la molina","la molina",
  "universidad de buenos aires","uba","universidad nacional de córdoba","unc argentina","universidad nacional de la plata","unlp",
  "universidad nacional de rosario","universidad de chile","pontificia universidad católica de chile","puc chile",
  "universidad nacional de colombia","unal","universidad de antioquia","universidad del valle","univalle",
  "universidad industrial de santander","uis","universidad de los andes colombia","universidad de costa rica","ucr",
  "universidad central del ecuador","espol","politécnica del litoral","universidad de cuenca",
  "universidad de san carlos","usac","universidad nacional autónoma de méxico","unam",
  "instituto politécnico nacional","ipn","universidad de guadalajara","udg","universidad autónoma de nuevo león","uanl",
  "benemérita universidad autónoma de puebla","buap","universidad de panamá","universidad nacional de asunción","una paraguay",
  "universidad autónoma de santo domingo","uasd","universidad de la república","udelar",
  "universidad central de venezuela","ucv","universidad del zulia","luz",
  "universidade de são paulo","usp","universidade federal do rio de janeiro","ufrj","universidade estadual de campinas","unicamp",
  "universidade de lisboa","universidade do porto",
];

const STEPS = [
  { label: "Carrera",       title: "Tu carrera universitaria",         icon: "🎓" },
  { label: "Universidad",   title: "Tu universidad y promedio",         icon: "🏛️" },
  { label: "Experiencia",   title: "Experiencia profesional",           icon: "💼" },
  { label: "Investigación", title: "Investigación y formación",         icon: "🔬" },
  { label: "Inglés",        title: "Certificación de inglés",           icon: "🗣️" },
  { label: "Idioma/Becas",  title: "Idioma del máster y becas",         icon: "💸" },
  { label: "Tipo máster",   title: "¿Qué tipo de máster?",             icon: "🎯" },
  { label: "Detalles",      title: "Duración, prácticas y presupuesto", icon: "📋" },
  { label: "Final",         title: "Región y fechas",                  icon: "📍" },
];

const PRES_MIN = 500, PRES_MAX = 15000;

// ── Utilidades ────────────────────────────────────────────────────────────────

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function detectarAuip(texto) {
  const val = norm(texto);
  if (val.length < 4) return null;
  const found = AUIP_KEYS.some((k) => {
    const kn = norm(k);
    if (kn.length < 5) return false;
    const esc = kn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|\\s)" + esc + "(\\s|$)").test(val);
  });
  if (found) return "si";
  if (val.length >= 6) return "no_detectado";
  return null;
}

function validateStep(s, formData, planCCAAs = null) {
  const missing = [];
  const coms = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];

  switch (s) {
    case 0:
      if (!formData.carrera_titulo?.trim()) missing.push("carrera_titulo");
      if (!formData.area_carrera)           missing.push("area_carrera");
      break;
    case 1: {
      if (!formData.universidad_origen?.trim()) missing.push("universidad_origen");
      const promStr = String(formData.promedio_peru || "").trim();
      if (!promStr) {
        missing.push("promedio_peru");
      } else {
        const nota   = parseFloat(promStr);
        const escala = formData.promedio_escala || "20";
        const maxMap = { "20": 20, "10": 10, "5": 5, "4": 4, "100": 100 };
        const max    = maxMap[escala] || 20;
        if (isNaN(nota) || nota < 0 || nota > max)
          missing.push("promedio_rango");
      }
      if (!formData.ubicacion_grupo)    missing.push("ubicacion_grupo");
      if (!formData.otra_maestria_tiene) missing.push("otra_maestria_tiene");
      break;
    }
    case 2:
      if (!formData.experiencia_anios) missing.push("experiencia_anios");
      if (formData.experiencia_anios && formData.experiencia_anios !== "sin") {
        if (!formData.experiencia_vinculada) missing.push("experiencia_vinculada");
      }
      break;
    case 3:
      if (!formData.investigacion_experiencia) missing.push("investigacion_experiencia");
      if (!formData.formacion_diplomados && !formData.formacion_encuentros &&
          !formData.formacion_otros && !formData.formacion_ninguna)
        missing.push("formacion_complementaria");
      break;
    case 4:
      if (!formData.ingles_situacion) missing.push("ingles_situacion");
      if (formData.ingles_situacion === "uni"  && !formData.ingles_uni_nivel)           missing.push("ingles_uni_nivel");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_tipo)           missing.push("ingles_intl_tipo");
      if (formData.ingles_situacion === "intl" && !formData.ingles_intl_puntaje?.trim()) missing.push("ingles_intl_puntaje");
      break;
    case 5:
      if (!formData.idioma_master_es && !formData.idioma_master_bilingue && !formData.idioma_master_ingles)
        missing.push("idioma_master");
      if (!formData.beca_desea) missing.push("beca_desea");
      break;
    case 6: {
      // La rama es opcional si ya escribió qué máster busca: se deduce de ahí.
      const escribioMaster = Array.isArray(formData.masteres_deseados)
        && formData.masteres_deseados.some((t) => String(t || "").trim());
      if (!formData.area_interes_master && !escribioMaster) missing.push("area_interes_master");
      break;
    }
    case 7:
      if (!formData.duracion_preferida)    missing.push("duracion_preferida");
      if (!formData.practicas_preferencia) missing.push("practicas_preferencia");
      if (!formData.modalidad_preferida)   missing.push("modalidad_preferida");
      break;
    case 8:
      if (coms.length === 0) missing.push("comunidades_preferidas");
      if (!formData.inicio_previsto) missing.push("inicio_previsto");
      break;
    default:
      break;
  }
  return missing;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Pill({ active, onClick, children, error = false }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full border text-sm font-medium transition-all active:scale-95 ${
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : error
          ? "border-red-300 text-neutral-700 bg-white hover:border-red-400"
          : "border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary bg-white"
      }`}>
      {children}
    </button>
  );
}

function FLabel({ children }) {
  return (
    <p className="text-sm font-semibold text-neutral-800 mb-3">
      {children}<span className="text-red-400 ml-0.5">*</span>
    </p>
  );
}

function EMsg({ show, msg = "Selecciona una opción para continuar" }) {
  if (!show) return null;
  return <p className="text-xs text-red-500 mt-2">⚠ {msg}</p>;
}

function FInput({ value, onChange, placeholder, type = "text", err = false, ...rest }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      className={`w-full rounded-xl border px-3.5 py-3 text-sm focus:outline-none focus:ring-2 transition ${
        err ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-neutral-200 focus:ring-primary/20 focus:border-primary"
      }`}
      {...rest} />
  );
}

function WBtn({ active, onClick, children, err = false }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
        active
          ? "bg-primary text-white border-primary shadow-sm"
          : err
          ? "border-red-300 text-neutral-700 bg-white hover:border-red-400"
          : "border-neutral-200 text-neutral-700 hover:border-primary hover:text-primary bg-white"
      }`}>
      {active && <span className="float-right opacity-70">✓</span>}
      {children}
    </button>
  );
}

function ErrBox({ show, children }) {
  if (!show) return null;
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
      <span className="text-base shrink-0 mt-0.5">⚠</span>
      <span>{children || "Completa todos los campos requeridos para continuar."}</span>
    </div>
  );
}

// ── ResumenDatos ──────────────────────────────────────────────────────────────

const EXP_LABELS = {
  sin: "Sin experiencia", "1-2": "1–2 años", "2-3": "2–3 años",
  "3-5": "3–5 años", "5-10": "5–10 años", "10+": "Más de 10 años",
};
const ING_LABELS = {
  intl: "Cert. internacional", uni: "Cert. universitaria",
  instituto: "Instituto (sin cert.)", sabe_sin_cert: "Inglés sin certificar", no: "Sin inglés",
};
const UBIC_LABELS = {
  tercio: "Tercio superior", quinto: "Quinto superior",
  decimo: "Décimo superior", ninguno: "No estuvo en ninguno",
};
const DUR_LABELS = {
  indiferente: "Me da igual (1–2 años)", "1": "Máx. 1 año (~60 ECTS)",
  "1.5": "Máx. 1,5 años", "2": "Máx. 2 años",
};
const PRAC_LABELS = {
  imprescindible: "Imprescindible", deseable: "Deseable", no_importante: "No es criterio",
};
const MOD_LABELS = {
  presencial: "Presencial", semipresencial: "Semipresencial",
  online: "Online", indiferente: "Me da igual",
};

function ResumenDatos({ formData, onEditar }) {
  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];
  const comunidadesText = comunidades.length > 0
    ? comunidades.slice(0, 3).join(", ") + (comunidades.length > 3 ? ` +${comunidades.length - 3} más` : "")
    : null;
  const idiomasMaster = [
    formData.idioma_master_es       && "Español",
    formData.idioma_master_bilingue && "Bilingüe",
    formData.idioma_master_ingles   && "Inglés",
  ].filter(Boolean).join(", ") || null;
  const otraMaestria = formData.otra_maestria_tiene === "si"
    ? `Sí${formData.otra_maestria_detalle ? `: ${formData.otra_maestria_detalle}` : ""}`
    : formData.otra_maestria_tiene === "no" ? "No" : null;

  const campos = [
    { label: "Carrera",          value: formData.carrera_titulo },
    { label: "Área de carrera",  value: formData.area_carrera },
    { label: "Universidad",      value: formData.universidad_origen },
    { label: "Promedio",         value: formData.promedio_peru ? `${formData.promedio_peru} / ${formData.promedio_escala || 20}` : null },
    { label: "Ranking",          value: UBIC_LABELS[formData.ubicacion_grupo] },
    { label: "Otra maestría",    value: otraMaestria },
    { label: "Experiencia",      value: EXP_LABELS[formData.experiencia_anios] },
    { label: "Investigación",    value: formData.investigacion_experiencia === "si" ? "Sí" : formData.investigacion_experiencia === "no" ? "No" : null },
    { label: "Inglés",           value: ING_LABELS[formData.ingles_situacion] },
    { label: "Idioma del máster", value: idiomasMaster },
    { label: "Becas",            value: formData.beca_desea === "si" ? "Sí" : formData.beca_desea === "no" ? "No" : null },
    { label: "Máster que buscas", value: Array.isArray(formData.masteres_deseados) && formData.masteres_deseados.filter(Boolean).length ? formData.masteres_deseados.filter(Boolean).join(" · ") : null },
    { label: "Especialización",  value: Array.isArray(formData.especializaciones) && formData.especializaciones.filter(Boolean).length ? formData.especializaciones.filter(Boolean).join(" · ") : null },
    { label: "Rama de interés",  value: formData.area_interes_master },
    { label: "Duración",         value: DUR_LABELS[formData.duracion_preferida] },
    { label: "Prácticas",        value: PRAC_LABELS[formData.practicas_preferencia] },
    { label: "Presupuesto",      value: formData.presupuesto_hasta ? `${Number(formData.presupuesto_hasta).toLocaleString("es-ES")} €/año` : null },
    { label: "Modalidad",        value: MOD_LABELS[formData.modalidad_preferida] },
    { label: "Comunidades",      value: comunidadesText },
    { label: "Inicio previsto",  value: formData.inicio_previsto?.replace(/_/g, " ") },
  ].filter((c) => c.value);

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onEditar}
        className="w-full py-2.5 text-sm font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition active:scale-[0.99]"
      >
        ✏ Modificar datos
      </button>
      <div className="grid grid-cols-2 gap-2">
        {campos.map(({ label, value }) => (
          <div key={label} className="bg-neutral-50 rounded-xl px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-0.5">{label}</p>
            <p className="text-xs font-semibold text-neutral-800 leading-snug" title={value}>{value}</p>
          </div>
        ))}
      </div>
      {formData.comentario_especial && (
        <div className="bg-neutral-50 rounded-xl px-3 py-2.5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 font-mono mb-0.5">Comentario especial</p>
          <p className="text-xs text-neutral-700 leading-relaxed">{formData.comentario_especial}</p>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function FormularioDatosAcademicos({
  formData, setFormData, handleSubmitFormulario, onGuardarProgreso, savingForm, hasData,
  planCCAAs,  // { bloqueado: bool, opciones: string[] } | null
}) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [step, setStep]               = useState(0);
  const [showErrors, setShowErrors]   = useState(false);
  const [ramas, setRamas]             = useState([]);
  const [subareas, setSubareas]       = useState([]);
  const [todasComunidades, setTodasComunidades] = useState(TODAS_COMUNIDADES_FALLBACK);
  const [xWarning, setXWarning]       = useState(false);
  const [savingX, setSavingX]         = useState(false);

  const siempreAbierto = useContext(SeccionSiempreAbiertoCtx);
  const [editando, setEditando]       = useState(false);

  useEffect(() => {
    apiGET("/api/catalogo/ramas").then((r) => {
      if (r.ok && Array.isArray(r.ramas)) setRamas(r.ramas);
    }).catch(() => {});
    apiGET("/api/catalogo/subareas").then((r) => {
      if (r.ok && Array.isArray(r.subareas)) setSubareas(r.subareas);
    }).catch(() => {});
    apiGET("/api/catalogo/comunidades").then((r) => {
      if (r.ok && Array.isArray(r.comunidades) && r.comunidades.length > 0)
        setTodasComunidades(r.comunidades);
    }).catch(() => {});
  }, []);

  // Universidad autocomplete
  const [uniQ, setUniQ]         = useState(formData.universidad_origen || "");
  const [showSugg, setShowSugg] = useState(false);
  const [auip, setAuip]         = useState(() => detectarAuip(formData.universidad_origen || ""));
  const uniWrap        = useRef(null);
  const scrollAreaRef  = useRef(null);

  // Sync uniQ if formData changes externally
  useEffect(() => {
    setUniQ(formData.universidad_origen || "");
  }, [formData.universidad_origen]);

  useEffect(() => {
    const handler = (e) => { if (uniWrap.current && !uniWrap.current.contains(e.target)) setShowSugg(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cerrar modal con Escape
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => { if (e.key === "Escape") setModalOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [modalOpen]);

  // Resetear errores al cambiar de paso
  useEffect(() => { setShowErrors(false); }, [step]);

  // Inicializar presupuesto_hasta si el usuario llega al paso sin haberlo tocado
  useEffect(() => {
    if (step === 7 && !formData.presupuesto_hasta) {
      setFormData((p) => ({ ...p, presupuesto_hasta: "3000" }));
    }
  }, [step]);


  function set(key, val) { setFormData((p) => ({ ...p, [key]: val })); }

  function handleUniChange(val) {
    setUniQ(val);
    set("universidad_origen", val);
    const det = detectarAuip(val);
    setAuip(det);
    if (det === "si") set("es_auip", "si");
    else if (det === "no_detectado") set("es_auip", "");
  }

  function selectSugerencia(uni) {
    setUniQ(uni); set("universidad_origen", uni);
    const det = detectarAuip(uni); setAuip(det);
    if (det === "si") set("es_auip", "si");
    setShowSugg(false);
  }

  function confirmarAuip(val) {
    setAuip(val); set("es_auip", val === "si" ? "si" : "no");
  }

  async function handleCerrarConX() {
    setSavingX(true);
    if (onGuardarProgreso) await onGuardarProgreso();
    setSavingX(false);
    const pendientes = STEPS.reduce((acc, _, i) => acc + validateStep(i, formData, planCCAAs).length, 0);
    if (pendientes > 0) {
      setXWarning(true);
      return; // no cerrar aún — el usuario verá la advertencia con botón confirmar
    }
    setModalOpen(false);
  }

  function handleNext() {
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) {
      setShowErrors(true);
      setTimeout(() => {
        const el = scrollAreaRef.current?.querySelector(
          ".border-red-200, .border-red-300, .border-red-400"
        );
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 30);
      return;
    }
    setShowErrors(false);
    setStep((p) => Math.min(STEPS.length - 1, p + 1));
  }

  async function handleSave(e) {
    e.preventDefault();
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) { setShowErrors(true); return; }
    await handleSubmitFormulario(e);
    setModalOpen(false);
  }

  async function handleSaveInline(e) {
    e.preventDefault();
    const missing = validateStep(step, formData, planCCAAs);
    if (missing.length > 0) { setShowErrors(true); return; }
    if (step < STEPS.length - 1) {
      setShowErrors(false);
      setStep((p) => Math.min(STEPS.length - 1, p + 1));
      return;
    }
    await handleSubmitFormulario(e);
    setEditando(false);
    setStep(0);
  }

  // Computed
  const stepErrors = showErrors ? validateStep(step, formData, planCCAAs) : [];
  function has(f) { return stepErrors.includes(f); }

  const suggestions = uniQ.length >= 2
    ? UNIS_SUGERENCIAS.filter(u => norm(u).includes(norm(uniQ))).slice(0, 6)
    : [];

  const isLast   = step === STEPS.length - 1;
  const presMax  = Number(formData.presupuesto_hasta) || 3000;
  const presPct  = (((presMax - PRES_MIN) / (PRES_MAX - PRES_MIN)) * 100).toFixed(1);
  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];
  const tieneExp    = formData.experiencia_anios && formData.experiencia_anios !== "sin";

  function toggleComunidad(c) {
    if (c === COMUNIDAD_INDIFERENTE) {
      set("comunidades_preferidas", comunidades.includes(c) ? [] : [c]);
    } else {
      const sinIndiferente = comunidades.filter(x => x !== COMUNIDAD_INDIFERENTE);
      const next = sinIndiferente.includes(c)
        ? sinIndiferente.filter(x => x !== c)
        : [...sinIndiferente, c];
      set("comunidades_preferidas", next);
    }
  }

  // ── Renderizado de cada paso ──────────────────────────────────────────────

  function renderStep() {
    const errBox = (field) => has(field);

    switch (step) {

      // ── PASO 1: Tu carrera ──────────────────────────────────────────────
      case 0: return (
        <div className="space-y-6">
          <div>
            <FLabel>Carrera o título universitario</FLabel>
            <FInput value={formData.carrera_titulo || ""}
              onChange={(e) => set("carrera_titulo", e.target.value)}
              placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…"
              err={has("carrera_titulo")} />
            <EMsg show={has("carrera_titulo")} msg="Escribe el nombre de tu carrera" />
          </div>
          <div>
            <FLabel>¿A qué área pertenece tu carrera?</FLabel>
            <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition ${has("area_carrera") ? "bg-red-50 border border-red-200" : ""}`}>
              {AREAS_CARRERA.map((a) => (
                <Pill key={a.value} active={formData.area_carrera === a.value}
                  onClick={() => set("area_carrera", formData.area_carrera === a.value ? "" : a.value)}>
                  {a.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("area_carrera")} />
          </div>
        </div>
      );

      // ── PASO 2: Universidad y promedio ──────────────────────────────────
      case 1: return (
        <div className="space-y-5">
          <div ref={uniWrap} className="relative">
            <FLabel>Universidad de origen</FLabel>
            <FInput value={uniQ}
              onChange={(e) => { handleUniChange(e.target.value); setShowSugg(true); }}
              onFocus={() => { if (uniQ.length >= 2) setShowSugg(true); }}
              placeholder="Empieza a escribir… PUCP, UNMSM, UBA, UNAM…"
              autoComplete="off" err={has("universidad_origen")} />
            <p className="text-xs text-neutral-400 mt-1.5">Puedes usar abreviaturas. Si no aparece, escribe el nombre completo.</p>
            <EMsg show={has("universidad_origen")} msg="Escribe el nombre de tu universidad" />

            {showSugg && suggestions.length > 0 && (
              <ul className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((u) => (
                  <li key={u}>
                    <button type="button" onMouseDown={() => selectSugerencia(u)}
                      className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-primary/5 hover:text-primary transition-colors">
                      {u}
                    </button>
                  </li>
                ))}
                <li className="px-4 py-2 text-xs text-neutral-400 border-t italic">No aparece → escribe el nombre y continúa</li>
              </ul>
            )}
            {auip === "si" && (
              <div className="mt-2 flex items-start gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                <span className="font-bold">✓</span>
                <span><strong>Universidad afiliada a AUIP.</strong> Amplía tus opciones de becas.</span>
              </div>
            )}
            {auip === "no_detectado" && (
              <div className="mt-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <p className="mb-2">⚠️ No encontramos tu universidad en AUIP. <strong>¿Está afiliada?</strong></p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => confirmarAuip("si")}
                    className="px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition text-sm">Sí</button>
                  <button type="button" onClick={() => confirmarAuip("no")}
                    className="px-4 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 font-semibold hover:bg-neutral-200 transition text-sm">No</button>
                </div>
              </div>
            )}
            {auip === "no" && (
              <div className="mt-2 flex items-center gap-2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500">
                ℹ️ No afiliada a AUIP.
                <button type="button" onClick={() => setAuip("no_detectado")} className="underline ml-1">Cambiar</button>
              </div>
            )}
          </div>

          <div>
            <FLabel>Promedio universitario</FLabel>
            <div className="flex gap-2">
              <FInput type="number" step="0.01" min="0"
                value={formData.promedio_peru || ""}
                onChange={(e) => set("promedio_peru", e.target.value.trim())}
                placeholder="Ej: 15.75" err={has("promedio_peru") || has("promedio_rango")} />
              <select value={formData.promedio_escala || "20"}
                onChange={(e) => set("promedio_escala", e.target.value)}
                className="w-44 sm:w-52 shrink-0 rounded-xl border border-neutral-200 px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition">
                <option value="20">Escala /20 — Perú</option>
                <option value="10">Escala /10</option>
                <option value="5">Escala /5 — Colombia</option>
                <option value="4">GPA 0–4.0</option>
                <option value="100">Porcentaje %</option>
              </select>
            </div>
            <EMsg show={has("promedio_peru")} msg="Ingresa tu promedio universitario" />
            {has("promedio_rango") && (() => {
              const maxMap = { "20": 20, "10": 10, "5": 5, "4": 4, "100": 100 };
              const max = maxMap[formData.promedio_escala || "20"] || 20;
              return <EMsg show msg={`El promedio debe estar entre 0 y ${max} para la escala seleccionada`} />;
            })()}
          </div>

          <div>
            <FLabel>¿Estuviste en tercio, quinto o décimo superior?</FLabel>
            <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition ${has("ubicacion_grupo") ? "bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "tercio",  label: "Tercio superior" },
                { value: "quinto",  label: "Quinto superior" },
                { value: "decimo",  label: "Décimo superior" },
                { value: "ninguno", label: "No estuve en ninguno" },
              ].map((o) => (
                <Pill key={o.value} active={formData.ubicacion_grupo === o.value}
                  onClick={() => set("ubicacion_grupo", formData.ubicacion_grupo === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("ubicacion_grupo")} />
          </div>

          <div>
            <FLabel>¿Cuentas con otra maestría?</FLabel>
            <div className={`flex gap-2 ${has("otra_maestria_tiene") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {["si","no"].map((v) => (
                <Pill key={v} active={formData.otra_maestria_tiene === v}
                  onClick={() => set("otra_maestria_tiene", v)}>
                  {v === "si" ? "Sí" : "No"}
                </Pill>
              ))}
            </div>
            <EMsg show={has("otra_maestria_tiene")} />
            {formData.otra_maestria_tiene === "si" && (
              <div className="mt-3">
                <FInput value={formData.otra_maestria_detalle || ""}
                  onChange={(e) => set("otra_maestria_detalle", e.target.value)}
                  placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona" />
              </div>
            )}
          </div>
        </div>
      );

      // ── PASO 3: Experiencia profesional ─────────────────────────────────
      case 2: return (
        <div className="space-y-6">
          <div>
            <FLabel>Años de experiencia profesional</FLabel>
            <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition ${has("experiencia_anios") ? "bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "sin",  label: "Sin experiencia" },
                { value: "1-2",  label: "1–2 años" },
                { value: "2-3",  label: "2–3 años" },
                { value: "3-5",  label: "3–5 años" },
                { value: "5-10", label: "5–10 años" },
                { value: "10+",  label: "Más de 10 años" },
              ].map((o) => (
                <Pill key={o.value} active={formData.experiencia_anios === o.value}
                  onClick={() => {
                    set("experiencia_anios", formData.experiencia_anios === o.value ? "" : o.value);
                    if (o.value === "sin") set("experiencia_vinculada", "no");
                  }}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("experiencia_anios")} />
          </div>

          {tieneExp && (
            <>
              <div>
                <FLabel>¿Tu experiencia está vinculada al área del máster de interés?</FLabel>
                <div className={`flex flex-col gap-2 ${has("experiencia_vinculada") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                  {[
                    { value: "si",      label: "Sí, directamente relacionada" },
                    { value: "parcial", label: "Parcialmente relacionada" },
                    { value: "no",      label: "No directamente" },
                  ].map((o) => (
                    <WBtn key={o.value} active={formData.experiencia_vinculada === o.value}
                      onClick={() => set("experiencia_vinculada", formData.experiencia_vinculada === o.value ? "" : o.value)}>
                      {o.label}
                    </WBtn>
                  ))}
                </div>
                <EMsg show={has("experiencia_vinculada")} />
              </div>

              {(formData.experiencia_vinculada === "si" || formData.experiencia_vinculada === "parcial") && (
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-3">Describe brevemente tu experiencia</p>
                  <textarea rows={3}
                    value={formData.experiencia_vinculada_detalle || ""}
                    onChange={(e) => set("experiencia_vinculada_detalle", e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    placeholder="Empresa, cargo, sector…" />
                </div>
              )}
            </>
          )}
        </div>
      );

      // ── PASO 4: Investigación y formación ───────────────────────────────
      case 3: return (
        <div className="space-y-6">
          <div>
            <FLabel>¿Tienes experiencia en investigación?</FLabel>
            <div className={`flex flex-col gap-2 ${has("investigacion_experiencia") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "si", label: "Sí, tengo publicaciones o grupos de investigación" },
                { value: "no", label: "No tengo experiencia en investigación" },
              ].map((o) => (
                <WBtn key={o.value} active={formData.investigacion_experiencia === o.value}
                  onClick={() => set("investigacion_experiencia", formData.investigacion_experiencia === o.value ? "" : o.value)}>
                  {o.label}
                </WBtn>
              ))}
            </div>
            <EMsg show={has("investigacion_experiencia")} />
            {formData.investigacion_experiencia === "si" && (
              <textarea rows={2}
                value={formData.investigacion_detalle || ""}
                onChange={(e) => set("investigacion_detalle", e.target.value)}
                className="mt-3 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                placeholder="Publicaciones, grupos de investigación, proyectos…" />
            )}
          </div>

          <div>
            <FLabel>Formación complementaria relacionada con el máster</FLabel>
            <div className={`flex flex-col gap-2 ${has("formacion_complementaria") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { key: "formacion_diplomados",  label: "Diplomados, cursos o seminarios relacionados" },
                { key: "formacion_encuentros",  label: "Encuentros, escuelas de verano o congresos" },
                { key: "formacion_otros",       label: "Otras certificaciones o formaciones" },
                { key: "formacion_ninguna",     label: "Ninguna de las anteriores" },
              ].map(({ key, label }) => (
                <WBtn key={key} active={!!formData[key]}
                  onClick={() => {
                    const next = !formData[key];
                    if (key === "formacion_ninguna" && next) {
                      // Deseleccionar las otras al marcar "ninguna"
                      set("formacion_diplomados", false);
                      set("formacion_encuentros", false);
                      set("formacion_otros", false);
                    } else if (key !== "formacion_ninguna" && next) {
                      set("formacion_ninguna", false);
                    }
                    set(key, next);
                  }}>
                  {label}
                </WBtn>
              ))}
            </div>
            <EMsg show={has("formacion_complementaria")} msg="Selecciona al menos una opción" />
            {formData.formacion_otros && (
              <FInput value={formData.formacion_otros_detalle || ""}
                onChange={(e) => set("formacion_otros_detalle", e.target.value)}
                placeholder="Describe brevemente…" />
            )}
          </div>
        </div>
      );

      // ── PASO 5: Inglés ──────────────────────────────────────────────────
      case 4: return (
        <div className="space-y-5">
          <div>
            <FLabel>Situación actual de inglés</FLabel>
            <div className={`flex flex-col gap-2 ${has("ingles_situacion") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "intl",          label: "Tengo certificación internacional (IELTS, TOEFL, Cambridge…)" },
                { value: "uni",           label: "Tengo certificación de mi universidad" },
                { value: "instituto",     label: "Tengo inglés de instituto (sin certificación oficial)" },
                { value: "sabe_sin_cert", label: "Sé inglés pero aún no lo he certificado" },
                { value: "no",            label: "No tengo inglés" },
              ].map((o) => (
                <WBtn key={o.value} active={formData.ingles_situacion === o.value}
                  onClick={() => set("ingles_situacion", formData.ingles_situacion === o.value ? "" : o.value)}>
                  {o.label}
                </WBtn>
              ))}
            </div>
            <EMsg show={has("ingles_situacion")} />
          </div>

          {formData.ingles_situacion === "uni" && (
            <div>
              <FLabel>Nivel certificado por tu universidad</FLabel>
              <div className={`flex flex-wrap gap-2 ${has("ingles_uni_nivel") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                {["B1","B2","C1","C2","Otro"].map((n) => (
                  <Pill key={n} active={formData.ingles_uni_nivel === n}
                    onClick={() => set("ingles_uni_nivel", formData.ingles_uni_nivel === n ? "" : n)}>
                    {n}
                  </Pill>
                ))}
              </div>
              <EMsg show={has("ingles_uni_nivel")} />
            </div>
          )}

          {formData.ingles_situacion === "intl" && (
            <div className="space-y-4">
              <div>
                <FLabel>Tipo de certificación</FLabel>
                <div className={`flex flex-wrap gap-2 ${has("ingles_intl_tipo") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                  {["IELTS","TOEFL","Cambridge","Duolingo English Test","Otro"].map((t) => (
                    <Pill key={t} active={formData.ingles_intl_tipo === t}
                      onClick={() => set("ingles_intl_tipo", formData.ingles_intl_tipo === t ? "" : t)}>
                      {t}
                    </Pill>
                  ))}
                </div>
                <EMsg show={has("ingles_intl_tipo")} />
              </div>
              <div>
                <FLabel>Puntaje o nivel obtenido</FLabel>
                <FInput value={formData.ingles_intl_puntaje || ""}
                  onChange={(e) => set("ingles_intl_puntaje", e.target.value)}
                  placeholder="Ej: 6.5 (IELTS), 90 (TOEFL), C1 (Cambridge)"
                  err={has("ingles_intl_puntaje")} />
                <EMsg show={has("ingles_intl_puntaje")} msg="Ingresa tu puntaje o nivel" />
              </div>
            </div>
          )}
        </div>
      );

      // ── PASO 6: Idioma del máster y becas ───────────────────────────────
      case 5: return (
        <div className="space-y-6">
          <div>
            <FLabel>Idioma del máster que aceptas</FLabel>
            <div className={`flex flex-col gap-2 ${has("idioma_master") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { key: "idioma_master_es",       label: "Solo en español" },
                { key: "idioma_master_bilingue",  label: "Bilingüe (español + inglés)" },
                { key: "idioma_master_ingles",    label: "Totalmente en inglés" },
              ].map(({ key, label }) => (
                <WBtn key={key} active={!!formData[key]} onClick={() => {
                  if (!formData[key]) {
                    set("idioma_master_es", false);
                    set("idioma_master_bilingue", false);
                    set("idioma_master_ingles", false);
                    set(key, true);
                  }
                }}>
                  {label}
                </WBtn>
              ))}
            </div>
            <EMsg show={has("idioma_master")} msg="Selecciona al menos un idioma" />
          </div>

          <div>
            <FLabel>¿Deseas postular a una beca o ayuda económica?</FLabel>
            <div className={`flex gap-2 ${has("beca_desea") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "si", label: "Sí, me interesa" },
                { value: "no", label: "No por ahora" },
              ].map((o) => (
                <Pill key={o.value} active={formData.beca_desea === o.value}
                  onClick={() => set("beca_desea", formData.beca_desea === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("beca_desea")} />
            {formData.beca_desea === "si" && (
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-xs text-neutral-500 mb-1">¿Qué tipo de becas te interesan?</p>
                {[
                  { key: "beca_completa",  label: "🎓 Becas completas (matrícula cubierta)" },
                  { key: "beca_parcial",   label: "💸 Becas parciales / descuentos" },
                  { key: "beca_ayuda_uni", label: "🏛️ Ayudas de la propia universidad" },
                  { key: "beca_auip",      label: "🌐 Becas AUIP (si aplica)" },
                ].map(({ key, label }) => (
                  <WBtn key={key} active={!!formData[key]} onClick={() => set(key, !formData[key])}>
                    {label}
                  </WBtn>
                ))}
              </div>
            )}
          </div>
        </div>
      );

      // ── PASO 7: Rama de conocimiento + sub-área ─────────────────────────
      case 6: {
        const subAreasFiltradas = subareas.filter(
          (sa) => sa.rama === formData.area_interes_master
        );
        // Lo más directo primero: qué máster busca, con su nombre. Con eso el
        // informe encuentra ese y los parecidos; la rama y la sub-área acotan.
        // Hasta tres másteres y dos especializaciones, en texto libre.
        const deseados = Array.isArray(formData.masteres_deseados) ? formData.masteres_deseados : [];
        const especialidades = Array.isArray(formData.especializaciones) ? formData.especializaciones : [];
        const ponerLista = (key, lista, largo, i, valor) => {
          const next = [...lista]; while (next.length < largo) next.push("");
          next[i] = valor; set(key, next);
        };
        const campoTexto = "w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";
        return (
          <div className="space-y-5">
            <div>
              <FLabel>¿Qué máster estás buscando?</FLabel>
              <p className="text-xs text-neutral-400 mb-3">
                Escribe hasta tres, con el nombre que conozcas —aunque no sepas la universidad—.
                Buscaremos esos y los parecidos. Ej.: «Máster en Marketing Digital».
              </p>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <input key={i} type="text" className={campoTexto} value={deseados[i] || ""}
                    placeholder={["Primera opción", "Segunda opción (opcional)", "Tercera opción (opcional)"][i]}
                    onChange={(e) => ponerLista("masteres_deseados", deseados, 3, i, e.target.value)} />
                ))}
              </div>
            </div>

            <div>
              <FLabel>¿Cuál es tu especialización, o en qué quieres profundizar?</FLabel>
              <p className="text-xs text-neutral-400 mb-3">
                Hasta dos. Ej.: «finanzas corporativas», «educación inclusiva», «ciberseguridad».
              </p>
              <div className="space-y-2">
                {[0, 1].map((i) => (
                  <input key={i} type="text" className={campoTexto} value={especialidades[i] || ""}
                    placeholder={["Especialización principal", "Otra (opcional)"][i]}
                    onChange={(e) => ponerLista("especializaciones", especialidades, 2, i, e.target.value)} />
                ))}
              </div>
            </div>

            <div>
              <FLabel>
                ¿A qué rama pertenece el máster que te interesa?
                {deseados.some((t) => String(t || "").trim()) && (
                  <span className="font-normal text-neutral-400"> (opcional: la deducimos de lo que escribiste)</span>
                )}
              </FLabel>
              <p className="text-xs text-neutral-400 mb-3">
                Puede ser diferente a tu carrera de origen.
              </p>
              {ramas.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">Cargando opciones…</p>
              ) : (
                <div className={`grid grid-cols-2 gap-2 ${has("area_interes_master") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                  {ramas.map((r) => {
                    const active = formData.area_interes_master === r.valor;
                    return (
                      <button key={r.valor} type="button"
                        onClick={() => {
                          const newVal = active ? "" : r.valor;
                          set("area_interes_master", newVal);
                          set("sub_area_interes", "");
                        }}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] text-left ${
                          active
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "border-neutral-200 bg-white hover:border-primary hover:text-primary text-neutral-700"
                        }`}>
                        <span className="leading-snug">{r.etiqueta}</span>
                        {active && <span className="shrink-0 text-white/80 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <EMsg show={has("area_interes_master")} msg="Selecciona la rama de tu interés o escribe arriba qué máster buscas" />
            </div>

            {formData.area_interes_master && subAreasFiltradas.length > 0 && (
              <div>
                <FLabel>¿Tienes alguna especialidad en mente? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
                <p className="text-xs text-neutral-400 mb-3">
                  Si aún no lo sabes, puedes dejarlo en blanco.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {subAreasFiltradas.map((sa) => {
                    const active = formData.sub_area_interes === sa.valor;
                    return (
                      <button key={sa.valor} type="button"
                        onClick={() => set("sub_area_interes", active ? "" : sa.valor)}
                        className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-[0.98] text-left ${
                          active
                            ? "bg-primary/10 text-primary border-primary shadow-sm"
                            : "border-neutral-200 bg-white hover:border-primary/50 hover:text-primary text-neutral-600"
                        }`}>
                        <span className="leading-snug">{sa.etiqueta}</span>
                        {active && <span className="shrink-0 text-primary text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <FLabel>¿Cuál es tu principal objetivo con el máster? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
              <div className="flex flex-col gap-2 mt-1">
                {[
                  { val: "laboral",       label: "Mejorar mis opciones laborales y sueldo" },
                  { val: "investigacion", label: "Acceder a la investigación o doctorado" },
                  { val: "indiferente",   label: "Indiferente / No lo tengo claro" },
                ].map(({ val, label }) => (
                  <button key={val} type="button"
                    onClick={() => set("objetivo_master", formData.objetivo_master === val ? "" : val)}
                    className={`text-left px-4 py-3 rounded-xl border text-sm transition-all active:scale-[0.99] ${
                      formData.objetivo_master === val
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // ── PASO 8: Duración, prácticas y presupuesto ───────────────────────
      case 7: return (
        <div className="space-y-6">
          <div>
            <FLabel>Duración máxima que prefieres</FLabel>
            <div className={`flex flex-wrap gap-2 ${has("duracion_preferida") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "indiferente", label: "Me da igual (1–2 años)" },
                { value: "1",          label: "Máx. 1 año (~60 ECTS)" },
                { value: "1.5",        label: "Máx. 1,5 años" },
                { value: "2",          label: "Máx. 2 años" },
              ].map((o) => (
                <Pill key={o.value} active={formData.duracion_preferida === o.value}
                  onClick={() => set("duracion_preferida", formData.duracion_preferida === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("duracion_preferida")} />
          </div>

          <div>
            <FLabel>Prácticas curriculares</FLabel>
            <p className="text-xs text-neutral-400 mb-2">Las prácticas equivalen a tu primera experiencia laboral europea.</p>
            <div className={`flex flex-col gap-2 ${has("practicas_preferencia") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "imprescindible", label: "Imprescindible que tenga prácticas" },
                { value: "deseable",       label: "Me gustaría, pero no es obligatorio" },
                { value: "no_importante",  label: "No es un criterio para mí" },
              ].map((o) => (
                <WBtn key={o.value} active={formData.practicas_preferencia === o.value}
                  onClick={() => set("practicas_preferencia", formData.practicas_preferencia === o.value ? "" : o.value)}>
                  {o.label}
                </WBtn>
              ))}
            </div>
            <EMsg show={has("practicas_preferencia")} />
          </div>

          <div>
            <FLabel>¿Cuánto puedes invertir en matrícula por año?</FLabel>
            <div className="text-3xl font-bold text-primary mb-4">{presMax.toLocaleString("es-ES")} €</div>
            <input type="range" min={PRES_MIN} max={PRES_MAX} step="250" value={presMax}
              onChange={(e) => set("presupuesto_hasta", e.target.value)}
              className="w-full h-2.5 rounded-lg appearance-none cursor-pointer outline-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
              style={{ background: `linear-gradient(to right, #013446 0%, #013446 ${presPct}%, #e5e7eb ${presPct}%, #e5e7eb 100%)` }} />
            <div className="flex justify-between text-xs text-neutral-400 mt-2">
              <span>500 €</span><span>7.500 €</span><span>15.000 €</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1.5">Solo tasas universitarias. No incluye alojamiento ni manutención.</p>
          </div>

          <div>
            <FLabel>Modalidad preferida</FLabel>
            <div className={`flex flex-wrap gap-2 ${has("modalidad_preferida") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {[
                { value: "presencial",     label: "Presencial" },
                { value: "semipresencial", label: "Semipresencial" },
                { value: "online",         label: "Online" },
                { value: "indiferente",    label: "Me da igual" },
              ].map((o) => (
                <Pill key={o.value} active={formData.modalidad_preferida === o.value}
                  onClick={() => set("modalidad_preferida", formData.modalidad_preferida === o.value ? "" : o.value)}>
                  {o.label}
                </Pill>
              ))}
            </div>
            <EMsg show={has("modalidad_preferida")} />
          </div>
        </div>
      );

      // ── PASO 9: Región y fechas ─────────────────────────────────────────
      case 8: {
        const opcionesDisponibles = planCCAAs ? planCCAAs.opciones : todasComunidades;

        return (
          <div className="space-y-6">
            <div>
              <FLabel>Comunidad autónoma</FLabel>

              {planCCAAs && (
                <p className="text-xs text-neutral-500 mb-2">
                  Tu plan cuenta con estas comunidades. Selecciona tus favoritas o preferenciales.
                </p>
              )}
              <div className={`grid grid-cols-2 gap-2 ${has("comunidades_preferidas") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                {opcionesDisponibles.map((c) => (
                  <button key={c} type="button" onClick={() => toggleComunidad(c)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                      comunidades.includes(c)
                        ? "bg-primary/8 border-primary text-primary"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
                    }`}>
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                      comunidades.includes(c) ? "bg-primary border-primary" : "border-neutral-300"
                    }`}>
                      {comunidades.includes(c) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    {c}
                  </button>
                ))}
                {!planCCAAs && (
                  <button type="button" onClick={() => toggleComunidad(COMUNIDAD_INDIFERENTE)}
                    className={`col-span-2 flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                      comunidades.includes(COMUNIDAD_INDIFERENTE)
                        ? "bg-primary/8 border-primary text-primary"
                        : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
                    }`}>
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                      comunidades.includes(COMUNIDAD_INDIFERENTE) ? "bg-primary border-primary" : "border-neutral-300"
                    }`}>
                      {comunidades.includes(COMUNIDAD_INDIFERENTE) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </span>
                    {COMUNIDAD_INDIFERENTE}
                  </button>
                )}
              </div>
              <EMsg show={has("comunidades_preferidas")} msg="Selecciona al menos una opción" />
            </div>

            <div>
              <FLabel>¿Cuándo planeas empezar el máster?</FLabel>
              <div className={`flex flex-wrap gap-2 ${has("inicio_previsto") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
                {[
                  { value: "sep_2025", label: "Sep 2025" },
                  { value: "ene_2026", label: "Ene 2026" },
                  { value: "sep_2026", label: "Sep 2026" },
                  { value: "ene_2027", label: "Ene 2027" },
                  { value: "flexible", label: "Flexible / No sé" },
                ].map((o) => (
                  <Pill key={o.value} active={formData.inicio_previsto === o.value}
                    onClick={() => set("inicio_previsto", formData.inicio_previsto === o.value ? "" : o.value)}>
                    {o.label}
                  </Pill>
                ))}
              </div>
              <EMsg show={has("inicio_previsto")} />
            </div>

            <div>
              <p className="text-sm font-semibold text-neutral-800 mb-3">Comentario para la IA y tus asesores</p>
              <p className="text-xs text-neutral-400 mb-3">Situación familiar, doctorado, plazos, restricciones… Todo ayuda.</p>
              <textarea rows={4}
                value={formData.comentario_especial || ""}
                onChange={(e) => set("comentario_especial", e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="Escribe aquí cualquier detalle relevante…" />
            </div>
          </div>
        );
      }

      default: return null;
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  const estado = hasData ? "completado" : "pendiente";

  // ── Modo inline (panel de dos columnas) ──────────────────────────────────────
  if (siempreAbierto) {
    const subtitulo = hasData && !editando
      ? "Datos guardados"
      : hasData
        ? `Paso ${step + 1} / ${STEPS.length} — ${STEPS[step].title}`
        : "Completa este formulario para personalizar tu informe.";

    return (
      <SeccionPanel numero="3" titulo="Formulario de datos académicos" subtitulo={subtitulo} estado={estado}>
        {hasData && !editando ? (
          <ResumenDatos formData={formData} onEditar={() => { setEditando(true); setStep(0); }} />
        ) : (
          <form onSubmit={(e) => e.preventDefault()} className="flex-1 min-h-0 flex flex-col gap-3">
            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-primary">
                  {STEPS[step].icon} {STEPS[step].title}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">{step + 1} / {STEPS.length}</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-1.5 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
            </div>

            {/* Círculos de navegación */}
            <div className="flex items-center">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <button type="button"
                    onClick={() => { if (i !== step && (i < step || hasData)) setStep(i); }}
                    title={s.title}
                    className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                      i < step   ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400 shadow-sm"
                      : i === step ? "bg-primary text-white shadow-md ring-[3px] ring-primary/25"
                      : hasData    ? "bg-primary-light/15 text-primary-light cursor-pointer hover:bg-primary-light/30"
                      :              "bg-neutral-100 text-neutral-400 cursor-default"
                    }`}>
                    {i < step ? "✓" : i + 1}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-300" : "bg-neutral-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Navegación — arriba, estática */}
            <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <button
                type="button"
                onClick={() => {
                  if (step === 0 && hasData) { setEditando(false); }
                  else { setStep((p) => Math.max(0, p - 1)); }
                }}
                disabled={step === 0 && !hasData}
                className="px-4 py-2 text-sm font-medium border border-neutral-200 rounded-xl hover:bg-neutral-50 transition disabled:opacity-30 active:scale-95"
              >
                {step === 0 && hasData ? "Cancelar" : "← Anterior"}
              </button>

              {!isLast ? (
                <button type="button" onClick={handleNext}
                  className="px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light transition active:scale-95">
                  Continuar →
                </button>
              ) : (
                <button type="button" onClick={handleSaveInline} disabled={savingForm}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-50 transition active:scale-95">
                  {savingForm
                    ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
                    : "✓ Guardar formulario"
                  }
                </button>
              )}
            </div>

            {showErrors && validateStep(step, formData, planCCAAs).length > 0 && (
              <ErrBox show>Completa todos los campos requeridos antes de continuar.</ErrBox>
            )}

            {/* Contenido del paso — scroll interno aquí */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden border border-neutral-100 rounded-xl shadow-sm">
              <div className="shrink-0 px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-primary/6 to-transparent flex items-center gap-2">
                <span className="text-base shrink-0">{STEPS[step].icon}</span>
                <h3 className="text-sm font-bold text-primary">{STEPS[step].title}</h3>
              </div>
              <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4">
                {renderStep()}
              </div>
            </div>
          </form>
        )}
      </SeccionPanel>
    );
  }

  // ── Modo modal (acordeón clásico) ─────────────────────────────────────────────

  const subtitulo = hasData
    ? "Ya tienes datos guardados. Haz clic para revisar o modificar."
    : "Completa este formulario para personalizar tu informe de búsqueda.";

  return (
    <>
      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden"
            style={{ maxHeight: "92vh" }}
          >
            {/* Cabecera del modal */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <div>
                <p className="text-sm font-bold text-primary">Formulario de datos académicos</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Paso {step + 1} / {STEPS.length} — {STEPS[step].title}
                </p>
              </div>
              <button type="button" onClick={handleCerrarConX} disabled={savingX}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-40">
                {savingX
                  ? <span className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                }
              </button>
            </div>

            {/* Advertencia al cerrar con X */}
            {xWarning && (
              <div className="shrink-0 mx-5 mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <span className="text-amber-500 text-base shrink-0 mt-0.5">⚠</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">Tu progreso se ha guardado, pero el formulario está incompleto.</p>
                  <p className="text-xs text-amber-700 mt-0.5">Vuelve cuando puedas para terminar de rellenarlo.</p>
                </div>
                <button type="button" onClick={() => { setXWarning(false); setModalOpen(false); }}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold transition">
                  Cerrar
                </button>
              </div>
            )}

            {/* Barra de progreso */}
            <div className="shrink-0 px-5 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-primary">
                  {Math.round(((step + 1) / STEPS.length) * 100)}% completado
                </span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full">
                <div className="h-1.5 bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>
            </div>

            {/* Círculos de navegación */}
            <div className="shrink-0 hidden sm:flex items-center px-5 pb-3">
              {STEPS.map((s, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <button type="button"
                    onClick={() => { if (i !== step && (i < step || hasData)) setStep(i); }}
                    title={s.title}
                    className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold transition-all active:scale-90 ${
                      i < step   ? "bg-emerald-500 text-white cursor-pointer hover:bg-emerald-400 shadow-sm"
                      : i === step ? "bg-primary text-white shadow-md ring-[3px] ring-primary/25"
                      : hasData    ? "bg-primary-light/15 text-primary-light cursor-pointer hover:bg-primary-light/30"
                      :              "bg-neutral-100 text-neutral-400 cursor-default"
                    }`}>
                    {i < step ? "✓" : i + 1}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < step ? "bg-emerald-300" : "bg-neutral-200"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Contenido del paso (scrolleable) */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-5 py-4">
                {/* Card del paso */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm mb-4">
                  <div className="px-4 py-3 border-b border-neutral-100 bg-gradient-to-r from-primary/6 to-transparent flex items-center gap-2.5">
                    <span className="text-lg shrink-0">{STEPS[step].icon}</span>
                    <h3 className="text-sm font-bold text-primary">{STEPS[step].title}</h3>
                  </div>
                  <div className="px-4 py-5">
                    {renderStep()}
                  </div>
                </div>

                </div>

              {/* Navegación — siempre visible al pie del modal */}
              <div className="shrink-0 border-t border-neutral-100 bg-white px-5 pb-4 pt-3 flex flex-col gap-3">
                {showErrors && validateStep(step, formData).length > 0 && (
                  <ErrBox show>Completa todos los campos requeridos antes de continuar.</ErrBox>
                )}
                <div className="flex items-center justify-between">
                <button type="button"
                  onClick={() => setStep(p => Math.max(0, p - 1))}
                  disabled={step === 0}
                  className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl disabled:opacity-30 hover:bg-neutral-50 transition active:scale-95">
                  ← Anterior
                </button>

                {!isLast && (
                  <button type="button" onClick={handleNext}
                    className="flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light transition-all active:scale-95 shadow-sm">
                    Continuar →
                  </button>
                )}
                {isLast && (
                  <button type="submit" disabled={savingForm}
                    className="inline-flex items-center gap-2 px-7 py-2.5 text-sm font-semibold rounded-xl bg-primary text-white hover:bg-primary-light disabled:opacity-50 transition-all active:scale-95 shadow-sm">
                    {savingForm
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Guardando…</>
                      : "✓ Guardar formulario"
                    }
                  </button>
                )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Sección en el panel (siempre colapsada, abre el modal) ──────── */}
      <SeccionPanel
        numero="3"
        titulo="Formulario de datos académicos"
        subtitulo={subtitulo}
        estado={estado}
        open={false}
        onToggle={() => setModalOpen(true)}
      />
    </>
  );
}
