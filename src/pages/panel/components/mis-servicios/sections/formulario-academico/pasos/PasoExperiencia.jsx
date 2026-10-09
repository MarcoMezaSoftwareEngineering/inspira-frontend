import { Pill, FLabel, EMsg, WBtn } from "../Campos";
import ListaExperiencia from "../ListaExperiencia";

// ── PASO 3: Experiencia profesional ─────────────────────────────────
export default function PasoExperiencia({ formData, set, has }) {
  const tieneExp    = formData.experiencia_anios && formData.experiencia_anios !== "sin";

  return (
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

          <div>
            <p className="text-sm font-semibold text-neutral-800 mb-1">Cuéntanos tus puestos de trabajo</p>
            <p className="text-xs text-neutral-400 mb-3">
              Uno por empleador: entidad, cargo, fechas y qué hacías. Es lo que puntúan las universidades y lo que va a tu currículum Europass.
            </p>
            <ListaExperiencia valor={formData.experiencia_detalle} onChange={(v) => set("experiencia_detalle", v)} />
          </div>
        </>
      )}
    </div>
  );
}
