// src/pages/backoffice/solicitudes/FormularioDatosAcademicosAdmin.jsx
import { useState } from "react";
import { FIELD_CONFIG, SECTIONS_ORDER } from "./formularioDatosConfig";
import LecturaMotor from "./LecturaMotor";
import { boPATCH } from "../../../services/backofficeApi";
import { dialog } from "../../../services/dialogService";
import IconoPaso from "../../../components/common/IconoPaso";
import FormularioDatosAcademicos from "../../panel/components/mis-servicios/sections/FormularioDatosAcademicos";
import { SeccionSiempreAbiertoCtx } from "../../panel/components/mis-servicios/sections/SeccionPanel";

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

export default function FormularioDatosAcademicosAdmin({ datos, idSolicitud, onActualizado, onIrAInforme = null, nombreCliente = null, planCCAAs = null }) {
  const [editing, setEditing] = useState(false);
  // El borrador del asesor: el mismo formulario por secciones que ve el
  // asesorado, guardado en la solicitud con cada «Guardar y seguir».
  const [borrador, setBorrador] = useState({});
  const [guardando, setGuardando] = useState(false);
  const nombreCorto = (nombreCliente || "el asesorado").split(" ")[0];

  function abrirEditor() {
    setBorrador({ ...(datos || {}) });
    setEditing(true);
  }

  async function guardarBorrador({ cerrar = false, avisar = true } = {}) {
    setGuardando(true);
    try {
      const res = await boPATCH(`/backoffice/solicitudes/${idSolicitud}/formulario`, { datos_formulario: borrador });
      if (!res?.ok) { dialog.toast(res?.msg || "No se pudo guardar el formulario", "error"); return false; }
      onActualizado?.(res.datos_formulario ?? borrador);
      if (avisar) dialog.toast("Formulario guardado", "success");
      if (cerrar) setEditing(false);
      return true;
    } catch {
      dialog.toast("Error de conexión", "error");
      return false;
    } finally {
      setGuardando(false);
    }
  }

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
        onEditar={idSolicitud && !editing ? abrirEditor : null}
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

      {/* El mismo formulario que el asesorado, rellenado por el asesor */}
      {editing && (
        <div style={{ marginTop: 14 }}>
          <div className="ex-tranquila" style={{ marginBottom: 10 }}>
            <span className="ico"><IconoPaso nombre="edit" /></span>
            <div><b>Editando el formulario de {nombreCorto}.</b> Cada cambio queda guardado en la solicitud.</div>
            <button type="button" className="ex-btn sec" style={{ marginLeft: "auto" }} onClick={() => setEditing(false)}>
              <IconoPaso nombre="x" /> Cerrar
            </button>
          </div>
          <SeccionSiempreAbiertoCtx.Provider value={true}>
            <FormularioDatosAcademicos
              lado="asesor"
              formData={borrador}
              setFormData={setBorrador}
              handleSubmitFormulario={(e) => { e?.preventDefault?.(); return guardarBorrador({ cerrar: true }); }}
              onGuardarProgreso={() => guardarBorrador({ avisar: false })}
              savingForm={guardando}
              hasData={!isEmpty}
              planCCAAs={planCCAAs}
            />
          </SeccionSiempreAbiertoCtx.Provider>
        </div>
      )}
    </>
  );
}
