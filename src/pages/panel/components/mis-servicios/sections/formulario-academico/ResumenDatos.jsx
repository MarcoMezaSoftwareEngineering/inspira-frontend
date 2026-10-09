import { numero } from "../../../../../../lib/formatos";
import { OBJETIVO_LEGADO, OBJETIVO_LABEL, DESCARTE_LABEL } from "./constantes";

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

export default function ResumenDatos({ formData, onEditar }) {
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
    { label: "Máster de referencia", value: Array.isArray(formData.masteres_enlaces) && formData.masteres_enlaces.filter(Boolean).length ? formData.masteres_enlaces.filter(Boolean).join(" · ") : null },
    { label: "Para qué lo quiere", value: OBJETIVO_LABEL[OBJETIVO_LEGADO[formData.objetivo_master] || formData.objetivo_master] || null },
    { label: "No quiere",        value: Array.isArray(formData.descartes) && formData.descartes.length ? formData.descartes.map((d) => DESCARTE_LABEL[d] || d).join(" · ") : null },
    { label: "Temas de interés", value: Array.isArray(formData.especializaciones) && formData.especializaciones.filter(Boolean).length ? formData.especializaciones.filter(Boolean).join(" · ") : null },
    { label: "Rama de interés",  value: formData.area_interes_master },
    { label: "Duración",         value: DUR_LABELS[formData.duracion_preferida] },
    { label: "Prácticas",        value: PRAC_LABELS[formData.practicas_preferencia] },
    { label: "Presupuesto",      value: formData.presupuesto_hasta ? `${numero(Number(formData.presupuesto_hasta))} €/año` : null },
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
