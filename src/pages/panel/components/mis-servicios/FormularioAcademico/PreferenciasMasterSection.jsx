export default function PreferenciasMasterSection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.6. Preferencias del máster (duración, prácticas, precio)
      </h4>

      <div className="grid gap-4">
        {/* Duración */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Duración máxima que prefieres para el máster
          </label>
          <select
            value={form.duracion_preferida}
            onChange={(e) => updateField("duracion_preferida", e.target.value)}
            className="w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecciona una opción</option>
            <option value="indiferente">Me da igual (1–2 años)</option>
            <option value="1">Máximo 1 año (≈ 60 ECTS)</option>
            <option value="1.5">Máximo 1,5 años</option>
            <option value="2">Máximo 2 años</option>
          </select>
        </div>

        {/* Prácticas curriculares */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Prácticas curriculares
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              {
                value: "imprescindible",
                label: "Es imprescindible que el máster tenga prácticas curriculares",
              },
              {
                value: "deseable",
                label: "Me gustaría que tenga prácticas, pero no es imprescindible",
              },
              {
                value: "no_importante",
                label: "No es un criterio importante para mí",
              },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-2 text-sm text-neutral-800"
              >
                <input
                  type="radio"
                  name="practicas_preferencia"
                  value={opt.value}
                  checked={form.practicas_preferencia === opt.value}
                  onChange={(e) =>
                    updateField("practicas_preferencia", e.target.value)
                  }
                  className="mt-1 text-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Presupuesto */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Presupuesto máximo para la matrícula del máster (solo estudios)
          </p>
          <div className="grid gap-3 md:grid-cols-2 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Desde (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.presupuesto_desde}
                onChange={(e) =>
                  updateField("presupuesto_desde", e.target.value.trim())
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: 3000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Hasta (€)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={form.presupuesto_hasta}
                onChange={(e) =>
                  updateField("presupuesto_hasta", e.target.value.trim())
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: 9000"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-500 max-w-xl">
            Este dato es orientativo y nos ayuda a no proponerte másteres fuera
            de tu realidad económica.
          </p>
        </div>
      </div>
    </section>
  );
}
