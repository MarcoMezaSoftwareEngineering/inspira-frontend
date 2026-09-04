export default function SeccionExperiencia({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="space-y-6">

      {/* Años de experiencia — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          Años de experiencia profesional
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "sin", label: "Sin experiencia" },
            { value: "2-3", label: "2–3 años" },
            { value: "3-5", label: "3–5 años" },
            { value: "5-10", label: "5–10 años" },
            { value: "10+", label: "Más de 10 años" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("experiencia_anios", formData.experiencia_anios === opt.value ? "" : opt.value)}
              className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.experiencia_anios === opt.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vinculación con el máster — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿Tu experiencia está vinculada a los másteres que son de tu interés?
        </p>
        <div className="flex gap-2">
          {[
            { value: "si", label: "Sí, está vinculada" },
            { value: "no", label: "No directamente" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("experiencia_vinculada", formData.experiencia_vinculada === opt.value ? "" : opt.value)}
              className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.experiencia_vinculada === opt.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {formData.experiencia_vinculada === "si" && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Cuéntanos brevemente cómo se relaciona tu experiencia con el máster
            </label>
            <textarea
              rows={3}
              value={formData.experiencia_vinculada_detalle || ""}
              onChange={(e) => set("experiencia_vinculada_detalle", e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              placeholder="Describe en 3–4 líneas tu experiencia relevante."
            />
          </div>
        )}
      </div>

    </div>
  );
}
