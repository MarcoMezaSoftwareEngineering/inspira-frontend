// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx
import { useEffect, useState } from "react";
import { FIELD_CONFIG, SECTIONS_ORDER } from "./formularioDatosConfig";
import LecturaMotor from "./LecturaMotor";
import { boGET, boPATCH } from "../../../services/backofficeApi";

// ── Configuración visual por sección ─────────────────────────────────────────
const SECTION_CFG = {
  "Perfil académico":          { icon: "🎓", color: "blue"    },
  "Experiencia profesional":   { icon: "💼", color: "violet"  },
  "Investigación y formación": { icon: "🔬", color: "cyan"    },
  "Idiomas":                   { icon: "🗣️",  color: "emerald" },
  "Becas":                     { icon: "💸", color: "amber"   },
  "Preferencias del máster":   { icon: "🎯", color: "orange"  },
  "Comentario especial":       { icon: "💬", color: "pink"    },
  "Otros datos":               { icon: "📋", color: "neutral" },
};

const CLR = {
  blue:    { h: "bg-blue-50 border-blue-100",      bar: "bg-blue-400",    t: "text-blue-700"    },
  violet:  { h: "bg-violet-50 border-violet-100",  bar: "bg-violet-400",  t: "text-violet-700"  },
  cyan:    { h: "bg-cyan-50 border-cyan-100",       bar: "bg-cyan-400",    t: "text-cyan-700"    },
  emerald: { h: "bg-emerald-50 border-emerald-100", bar: "bg-emerald-400", t: "text-emerald-700" },
  amber:   { h: "bg-amber-50 border-amber-100",     bar: "bg-amber-400",   t: "text-amber-700"   },
  orange:  { h: "bg-orange-50 border-orange-100",   bar: "bg-orange-400",  t: "text-orange-700"  },
  pink:    { h: "bg-pink-50 border-pink-100",       bar: "bg-pink-400",    t: "text-pink-700"    },
  neutral: { h: "bg-neutral-50 border-neutral-100", bar: "bg-neutral-300", t: "text-neutral-500" },
};

// ── Helpers de visualización ──────────────────────────────────────────────────
function toBool(v) {
  if (typeof v === "boolean") return v;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (["si","sí","yes","true"].includes(s)) return true;
  if (["no","false"].includes(s)) return false;
  return null;
}

function Badge({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />Sí
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-400 border border-neutral-200">
      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />No
    </span>
  );
}

function Val({ value, field, extra }) {
  if (value === null || value === undefined || value === "")
    return <span className="text-[10px] text-neutral-300 italic">—</span>;

  if (typeof value === "boolean") return <Badge ok={value} />;

  if (field?.format) {
    const formatted = field.format(value, extra);
    if (typeof formatted === "object")
      return <span className="text-[11px] text-neutral-600">{JSON.stringify(formatted)}</span>;
    const str = String(formatted);
    if (/^[\d.,]+/.test(str.trim()))
      return <span className="text-xs font-bold text-neutral-900 tabular-nums">{str}</span>;
    return <span className="text-[11px] font-semibold text-neutral-800 text-right leading-snug">{str}</span>;
  }

  const bool = toBool(value);
  if (bool !== null) return <Badge ok={bool} />;

  const str = String(value);
  if (/^\d+([.,]\d+)?$/.test(str.trim()))
    return <span className="text-xs font-bold text-neutral-900 tabular-nums">{str}</span>;

  return <span className="text-[11px] font-semibold text-neutral-800 text-right leading-snug">{str}</span>;
}

function SectionCard({ nombre, fields, extra }) {
  const cfg = SECTION_CFG[nombre] || SECTION_CFG["Otros datos"];
  const clr = CLR[cfg.color] || CLR.neutral;

  const inline    = fields.filter((f) => !f.fullWidth);
  const fullWidth = fields.filter((f) =>  f.fullWidth);

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-sm bg-white break-inside-avoid mb-3">
      <div className={`flex items-center gap-2 px-3 py-1.5 border-b ${clr.h}`}>
        <span className={`w-0.5 h-3.5 rounded-full ${clr.bar} shrink-0`} />
        <span className="text-sm leading-none shrink-0">{cfg.icon}</span>
        <span className={`text-[9px] font-extrabold uppercase tracking-widest ${clr.t}`}>{nombre}</span>
        <span className="ml-auto text-[9px] text-neutral-400 tabular-nums">{fields.length}</span>
      </div>

      {inline.length > 0 && (
        <div className="divide-y divide-neutral-50">
          {inline.map((f) => (
            <div key={f.key} className="flex items-center justify-between gap-2 px-3 py-1.5 min-h-0">
              <span className="text-[10px] text-neutral-400 leading-tight flex-1 min-w-0">{f.label}</span>
              <div className="shrink-0 max-w-[56%] text-right">
                <Val value={f.value} field={f} extra={extra} />
              </div>
            </div>
          ))}
        </div>
      )}

      {fullWidth.map((f) => (
        <div key={f.key} className={`px-3 py-1.5 ${inline.length > 0 ? "border-t border-neutral-50" : ""}`}>
          <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider mb-0.5">{f.label}</p>
          {f.value ? (
            <p className="text-[11px] font-medium text-neutral-800 leading-relaxed whitespace-pre-line">
              {String(f.format ? f.format(f.value, extra) : f.value)}
            </p>
          ) : (
            <span className="text-[10px] text-neutral-300 italic">—</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

const BOOL_FIELDS = [
  "investigacion_experiencia","formacion_diplomados","formacion_encuentros",
  "formacion_otros","formacion_ninguna","otra_maestria_tiene",
  "beca_desea","beca_completa","beca_parcial","beca_ayuda_uni","beca_auip",
  "idioma_master_es","idioma_master_bilingue","idioma_master_ingles",
];

const TODAS_CCAA = [
  "Andalucía","Aragón","Asturias","Cantabria","Castilla-La Mancha",
  "Castilla y León","Cataluña","Comunidad de Madrid","Comunidad Valenciana",
  "Extremadura","Galicia","La Rioja","Murcia","Navarra","País Vasco",
  "Me da igual / No tengo preferencia",
];

function normalizeDraft(datos) {
  const d = { ...(datos || {}) };
  for (const key of BOOL_FIELDS) {
    const v = d[key];
    if (typeof v === "boolean") continue;
    if (typeof v === "string") {
      d[key] = ["si","sí","yes","true"].includes(v.toLowerCase());
    } else {
      d[key] = false;
    }
  }
  if (!Array.isArray(d.comunidades_preferidas)) d.comunidades_preferidas = [];
  return d;
}

const inputCls = "border border-neutral-200 rounded-lg px-2 py-1.5 text-[12px] text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#1D6A4A]/40 focus:border-[#1D6A4A]/60 bg-white w-full";
const selectCls = inputCls + " cursor-pointer";
const textareaCls = "border border-neutral-200 rounded-lg px-2 py-1.5 text-[12px] text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#1D6A4A]/40 focus:border-[#1D6A4A]/60 bg-white w-full resize-none";

function FLabel({ children }) {
  return <label className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wide">{children}</label>;
}

function FField({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <FLabel>{label}</FLabel>
      {children}
    </div>
  );
}

function BoolToggle({ value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
        value
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-neutral-100 text-neutral-400 border-neutral-200"
      }`}
    >
      <span className={`w-2 h-2 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-neutral-300"}`} />
      {value ? "Sí" : "No"}
    </button>
  );
}

function EditSection({ title, icon, color, children }) {
  const clr = CLR[color] || CLR.neutral;
  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <div className={`flex items-center gap-2 px-3 py-2 border-b ${clr.h}`}>
        <span className={`w-0.5 h-3.5 rounded-full ${clr.bar} shrink-0`} />
        <span className="text-sm leading-none shrink-0">{icon}</span>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${clr.t}`}>{title}</span>
      </div>
      <div className="p-4 space-y-3 bg-white">
        {children}
      </div>
    </div>
  );
}

function EditModal({ datos, idSolicitud, onClose, onSaved }) {
  const [draft, setDraft] = useState(() => normalizeDraft(datos));
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ramas, setRamas] = useState([]);
  const [subramas, setSubramas] = useState([]);

  useEffect(() => {
    boGET("/backoffice/catalogo/ramas").then(r => { if (r.ok) setRamas(r.ramas.filter(x => x.activo)); });
  }, []);

  useEffect(() => {
    if (!draft.area_interes_master) { setSubramas([]); return; }
    boGET(`/backoffice/catalogo/subareas?rama=${draft.area_interes_master}`)
      .then(r => { if (r.ok) setSubramas(r.subareas.filter(s => s.activo)); });
  }, [draft.area_interes_master]);

  function set(key, val) {
    setDraft(prev => ({ ...prev, [key]: val }));
  }

  function handleRamaChange(val) {
    setDraft(prev => ({ ...prev, area_interes_master: val, sub_area_interes: "" }));
  }

  function toggleCCaa(c) {
    const prev = Array.isArray(draft.comunidades_preferidas) ? draft.comunidades_preferidas : [];
    set("comunidades_preferidas", prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function handleSave() {
    setSaving(true);
    setErrorMsg(null);
    try {
      const res = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/formulario`, {
        datos_formulario: draft,
      });
      if (res.ok) {
        onSaved(res.datos_formulario ?? draft);
        onClose();
      } else {
        setErrorMsg(res.msg || "Error al guardar");
      }
    } catch {
      setErrorMsg("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  const ccaaSeleccionadas = draft.comunidades_preferidas || [];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel lateral derecho */}
      <div className="relative ml-auto w-full max-w-xl bg-[#F4F6F9] flex flex-col shadow-2xl h-full">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 bg-white shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-bold text-[#1A3557]">Editar formulario académico</h2>
            <p className="text-[10px] text-neutral-400 mt-0.5">Cambios guardados directamente en la solicitud</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {/* ── Perfil académico ── */}
          <EditSection title="Perfil académico" icon="🎓" color="blue">
            <FField label="Carrera / título">
              <input className={inputCls} value={draft.carrera_titulo || ""} onChange={e => set("carrera_titulo", e.target.value)} />
            </FField>
            <FField label="Área de la carrera">
              <input className={inputCls} value={draft.area_carrera || ""} onChange={e => set("area_carrera", e.target.value)} />
            </FField>
            <FField label="Universidad de origen">
              <input className={inputCls} value={draft.universidad_origen || ""} onChange={e => set("universidad_origen", e.target.value)} />
            </FField>
            <FField label="Afiliada a AUIP">
              <select className={selectCls} value={draft.es_auip || ""} onChange={e => set("es_auip", e.target.value)}>
                <option value="">—</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </FField>
            <div className="grid grid-cols-2 gap-3">
              <FField label="Promedio">
                <input className={inputCls} type="number" step="0.01" min="0" value={draft.promedio_peru ?? ""} onChange={e => set("promedio_peru", e.target.value)} />
              </FField>
              <FField label="Escala">
                <select className={selectCls} value={draft.promedio_escala || "20"} onChange={e => set("promedio_escala", e.target.value)}>
                  <option value="20">Sobre 20</option>
                  <option value="10">Sobre 10</option>
                  <option value="5">Sobre 5</option>
                  <option value="4">Sobre 4</option>
                  <option value="100">Sobre 100</option>
                </select>
              </FField>
            </div>
            <FField label="Posición académica">
              <select className={selectCls} value={draft.ubicacion_grupo || ""} onChange={e => set("ubicacion_grupo", e.target.value)}>
                <option value="">—</option>
                <option value="tercio">Tercio superior</option>
                <option value="quinto">Quinto superior</option>
                <option value="decimo">Décimo superior</option>
                <option value="ninguno">No estuvo en ninguno</option>
              </select>
            </FField>
            <div className="flex items-center gap-3">
              <FLabel>Tiene otra maestría</FLabel>
              <BoolToggle value={!!draft.otra_maestria_tiene} onChange={v => set("otra_maestria_tiene", v)} />
            </div>
            {draft.otra_maestria_tiene && (
              <FField label="Detalle maestría">
                <textarea className={textareaCls} rows={3} value={draft.otra_maestria_detalle || ""} onChange={e => set("otra_maestria_detalle", e.target.value)} />
              </FField>
            )}
          </EditSection>

          {/* ── Experiencia profesional ── */}
          <EditSection title="Experiencia profesional" icon="💼" color="violet">
            <FField label="Años de experiencia">
              <select className={selectCls} value={draft.experiencia_anios || ""} onChange={e => set("experiencia_anios", e.target.value)}>
                <option value="">—</option>
                <option value="sin">Sin experiencia</option>
                <option value="1-2">1–2 años</option>
                <option value="2-3">2–3 años</option>
                <option value="3-5">3–5 años</option>
                <option value="5-10">5–10 años</option>
                <option value="10+">Más de 10 años</option>
              </select>
            </FField>
            <FField label="Vinculada al área del máster">
              <select className={selectCls} value={draft.experiencia_vinculada || ""} onChange={e => set("experiencia_vinculada", e.target.value)}>
                <option value="">—</option>
                <option value="si">Sí, directamente</option>
                <option value="parcial">Parcialmente</option>
                <option value="no">No directamente</option>
              </select>
            </FField>
            <FField label="Descripción de la experiencia">
              <textarea className={textareaCls} rows={4} value={draft.experiencia_vinculada_detalle || ""} onChange={e => set("experiencia_vinculada_detalle", e.target.value)} />
            </FField>
          </EditSection>

          {/* ── Investigación y formación ── */}
          <EditSection title="Investigación y formación" icon="🔬" color="cyan">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {[
                { key: "investigacion_experiencia", label: "Tiene investigación" },
                { key: "formacion_diplomados",      label: "Diplomados / cursos" },
                { key: "formacion_encuentros",      label: "Encuentros / congresos" },
                { key: "formacion_otros",           label: "Otras certificaciones" },
                { key: "formacion_ninguna",         label: "Sin formación complementaria" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <BoolToggle value={!!draft[key]} onChange={v => set(key, v)} />
                  <span className="text-[11px] text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
            {draft.investigacion_experiencia && (
              <FField label="Publicaciones / grupos">
                <textarea className={textareaCls} rows={2} value={draft.investigacion_detalle || ""} onChange={e => set("investigacion_detalle", e.target.value)} />
              </FField>
            )}
            {draft.formacion_otros && (
              <FField label="Detalle otras formaciones">
                <textarea className={textareaCls} rows={2} value={draft.formacion_otros_detalle || ""} onChange={e => set("formacion_otros_detalle", e.target.value)} />
              </FField>
            )}
          </EditSection>

          {/* ── Idiomas ── */}
          <EditSection title="Idiomas" icon="🗣️" color="emerald">
            <FField label="Situación inglés">
              <select className={selectCls} value={draft.ingles_situacion || ""} onChange={e => set("ingles_situacion", e.target.value)}>
                <option value="">—</option>
                <option value="intl">Cert. internacional (IELTS/TOEFL…)</option>
                <option value="uni">Cert. universitaria</option>
                <option value="instituto">Instituto (sin cert.)</option>
                <option value="sabe_sin_cert">Inglés sin certificar</option>
                <option value="no">Sin inglés</option>
              </select>
            </FField>
            {draft.ingles_situacion === "uni" && (
              <FField label="Nivel cert. universitaria">
                <input className={inputCls} value={draft.ingles_uni_nivel || ""} onChange={e => set("ingles_uni_nivel", e.target.value)} />
              </FField>
            )}
            {draft.ingles_situacion === "intl" && (
              <>
                <FField label="Tipo cert. internacional">
                  <input className={inputCls} value={draft.ingles_intl_tipo || ""} onChange={e => set("ingles_intl_tipo", e.target.value)} />
                </FField>
                <FField label="Puntaje / nivel">
                  <input className={inputCls} value={draft.ingles_intl_puntaje || ""} onChange={e => set("ingles_intl_puntaje", e.target.value)} />
                </FField>
              </>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
              {[
                { key: "idioma_master_es",       label: "Acepta en español" },
                { key: "idioma_master_bilingue",  label: "Acepta bilingüe" },
                { key: "idioma_master_ingles",    label: "Acepta en inglés" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <BoolToggle value={!!draft[key]} onChange={v => set(key, v)} />
                  <span className="text-[11px] text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
          </EditSection>

          {/* ── Becas ── */}
          <EditSection title="Becas" icon="💸" color="amber">
            <div className="flex items-center gap-2">
              <BoolToggle value={!!draft.beca_desea} onChange={v => set("beca_desea", v)} />
              <span className="text-[11px] text-neutral-600">Desea beca / ayuda</span>
            </div>
            {draft.beca_desea && (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {[
                  { key: "beca_completa",   label: "Becas completas" },
                  { key: "beca_parcial",    label: "Becas parciales / descuentos" },
                  { key: "beca_ayuda_uni",  label: "Ayudas de la universidad" },
                  { key: "beca_auip",       label: "Becas AUIP" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <BoolToggle value={!!draft[key]} onChange={v => set(key, v)} />
                    <span className="text-[11px] text-neutral-600">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </EditSection>

          {/* ── Preferencias del máster ── */}
          <EditSection title="Preferencias del máster" icon="🎯" color="orange">
            <FField label="Rama del máster">
              <select className={selectCls} value={draft.area_interes_master || ""} onChange={e => handleRamaChange(e.target.value)}>
                <option value="">—</option>
                {ramas.map(r => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
              </select>
            </FField>
            {draft.area_interes_master && (
              <FField label="Sub-área de interés">
                <select className={selectCls} value={draft.sub_area_interes || ""} onChange={e => set("sub_area_interes", e.target.value)}>
                  <option value="">— Sin especificar —</option>
                  {subramas.map(s => <option key={s.valor} value={s.valor}>{s.etiqueta}</option>)}
                </select>
              </FField>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FField label="Duración">
                <select className={selectCls} value={draft.duracion_preferida || ""} onChange={e => set("duracion_preferida", e.target.value)}>
                  <option value="">—</option>
                  <option value="indiferente">Me da igual</option>
                  <option value="1">Máx. 1 año</option>
                  <option value="1.5">Máx. 1,5 años</option>
                  <option value="2">Máx. 2 años</option>
                </select>
              </FField>
              <FField label="Prácticas">
                <select className={selectCls} value={draft.practicas_preferencia || ""} onChange={e => set("practicas_preferencia", e.target.value)}>
                  <option value="">—</option>
                  <option value="imprescindible">Imprescindible</option>
                  <option value="deseable">Deseable</option>
                  <option value="no_importante">No es criterio</option>
                </select>
              </FField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FField label="Modalidad">
                <select className={selectCls} value={draft.modalidad_preferida || ""} onChange={e => set("modalidad_preferida", e.target.value)}>
                  <option value="">—</option>
                  <option value="presencial">Presencial</option>
                  <option value="semipresencial">Semipresencial</option>
                  <option value="online">Online</option>
                  <option value="indiferente">Me da igual</option>
                </select>
              </FField>
              <FField label="Inicio previsto">
                <select className={selectCls} value={draft.inicio_previsto || ""} onChange={e => set("inicio_previsto", e.target.value)}>
                  <option value="">—</option>
                  <option value="sep_2025">Sep 2025</option>
                  <option value="ene_2026">Ene 2026</option>
                  <option value="sep_2026">Sep 2026</option>
                  <option value="ene_2027">Ene 2027</option>
                  <option value="flexible">Flexible / No sé</option>
                </select>
              </FField>
            </div>
            <FField label="Presupuesto hasta (€/año)">
              <input
                className={inputCls}
                type="number"
                min="0"
                step="100"
                value={draft.presupuesto_hasta ?? ""}
                onChange={e => set("presupuesto_hasta", e.target.value === "" ? "" : Number(e.target.value))}
              />
            </FField>
            <FField label="Comunidades autónomas preferidas">
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {TODAS_CCAA.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCCaa(c)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all ${
                      ccaaSeleccionadas.includes(c)
                        ? "bg-[#1D6A4A] text-white border-[#1D6A4A]"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </FField>
          </EditSection>

          {/* ── Comentario especial ── */}
          <EditSection title="Comentario especial" icon="💬" color="pink">
            <FField label="Comentario para IA / asesores">
              <textarea className={textareaCls} rows={4} value={draft.comentario_especial || ""} onChange={e => set("comentario_especial", e.target.value)} />
            </FField>
          </EditSection>

        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-white px-5 py-3 flex items-center gap-3 shrink-0">
          {errorMsg && <p className="text-[11px] text-red-500 flex-1">{errorMsg}</p>}
          {!errorMsg && <div className="flex-1" />}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-[12px] font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-[12px] font-semibold bg-[#1D6A4A] text-white rounded-lg hover:bg-[#155a3d] disabled:opacity-50 transition-colors"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function FormularioDatosAcademicosAdmin({ datos, idSolicitud, onActualizado, onIrAInforme = null }) {
  const [editing, setEditing] = useState(false);

  const isEmpty = !datos || Object.keys(datos).length === 0;
  const extra = { escala: datos?.promedio_escala };

  const knownKeys = new Set(Object.keys(FIELD_CONFIG));
  knownKeys.add("promedio_escala");

  const grouped = {};
  Object.entries(FIELD_CONFIG).forEach(([key, cfg]) => {
    if (!grouped[cfg.section]) grouped[cfg.section] = [];
    grouped[cfg.section].push({ key, ...cfg, value: datos?.[key] ?? null });
  });

  const extras = datos
    ? Object.entries(datos).filter(([k]) => !knownKeys.has(k))
    : [];
  if (extras.length) {
    if (!grouped["Otros datos"]) grouped["Otros datos"] = [];
    extras.forEach(([key, value]) =>
      grouped["Otros datos"].push({ key, label: key.replace(/_/g, " "), section: "Otros datos", value })
    );
  }

  const sections = SECTIONS_ORDER.filter((s) => grouped[s]);

  return (
    <>
      <LecturaMotor
        datos={datos}
        idSolicitud={idSolicitud}
        onEditar={idSolicitud ? () => setEditing(true) : null}
        onIrAInforme={onIrAInforme}
      />
      {!isEmpty && <p className="ex-sub" style={{ marginTop: 4 }}>Todas las respuestas</p>}

      {/* Vista vacía */}
      {isEmpty ? (
        <div className="flex flex-col items-center py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-neutral-600">Formulario pendiente</p>
          <p className="text-xs text-neutral-400 mt-1">El cliente aún no ha completado el formulario académico.</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 xl:columns-3 gap-3">
          {sections.map((nombre) => (
            <SectionCard key={nombre} nombre={nombre} fields={grouped[nombre]} extra={extra} />
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {editing && (
        <EditModal
          datos={datos || {}}
          idSolicitud={idSolicitud}
          onClose={() => setEditing(false)}
          onSaved={(nuevosDatos) => {
            onActualizado?.(nuevosDatos);
            setEditing(false);
          }}
        />
      )}
    </>
  );
}
