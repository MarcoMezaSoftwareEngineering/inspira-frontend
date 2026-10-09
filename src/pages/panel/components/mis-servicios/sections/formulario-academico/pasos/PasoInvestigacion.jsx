import { FLabel, EMsg, FInput, WBtn } from "../Campos";

// ── PASO 4: Investigación y formación ───────────────────────────────
export default function PasoInvestigacion({ formData, set, has }) {
  return (
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
}
