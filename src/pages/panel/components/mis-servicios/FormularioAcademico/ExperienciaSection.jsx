export default function ExperienciaSection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.2. Experiencia profesional y vinculación
      </h4>

      <div className="grid gap-4">
        {/* Años de experiencia */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Años de experiencia profesional
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { value: "sin", label: "Sin experiencia" },
              { value: "2-3", label: "2–3 años" },
              { value: "3-5", label: "3–5 años" },
              { value: "5-10", label: "5–10 años" },
              { value: "10+", label: "Más de 10 años" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-neutral-800"
              >
                <input
                  type="radio"
                  name="experiencia_anios"
                  value={opt.value}
                  checked={form.experiencia_anios === opt.value}
                  onChange={(e) =>
                    updateField("experiencia_anios", e.target.value)
                  }
                  className="text-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Vinculación con el máster */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Tu experiencia está vinculada a los másteres que son de tu interés?
          </p>
          <div className="flex flex-wrap gap-4">
            {[
              { value: "si", label: "Sí" },
              { value: "no", label: "No" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="inline-flex items-center gap-2 text-sm text-neutral-800"
              >
                <input
                  type="radio"
                  name="experiencia_vinculada"
                  value={opt.value}
                  checked={form.experiencia_vinculada === opt.value}
                  onChange={(e) =>
                    updateField("experiencia_vinculada", e.target.value)
                  }
                  className="text-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {form.experiencia_vinculada === "si" && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Cuéntanos brevemente cómo se relaciona tu experiencia con estos
                másteres
              </label>
              <textarea
                rows={3}
                value={form.experiencia_vinculada_detalle}
                onChange={(e) =>
                  updateField(
                    "experiencia_vinculada_detalle",
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe en 3–4 líneas tu experiencia relevante."
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
