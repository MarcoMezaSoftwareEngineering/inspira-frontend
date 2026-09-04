export default function PerfilAcademicoSection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.1. Perfil académico cuantitativo
      </h4>

      <div className="grid gap-4">
        {/* Promedio 0-20 Perú */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Promedio ponderado (escala 0–20, Perú)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={form.promedio_peru}
            onChange={(e) =>
              updateField("promedio_peru", e.target.value.trim())
            }
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ej: 15.75"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Campo opcional. Si lo completas, debe estar entre 0 y 20.
          </p>
        </div>

        {/* Otra escala (checkbox + bloque) */}
        <div className="border border-neutral-200 rounded-lg p-3">
          <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              className="rounded border-neutral-300"
              checked={form.otra_escala_activa}
              onChange={(e) =>
                updateField("otra_escala_activa", e.target.checked)
              }
            />
            <span>También quiero indicar mi promedio en otra escala</span>
          </label>

          {form.otra_escala_activa && (
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr,220px]">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Promedio (otra escala)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.promedio_otra_escala_valor}
                  onChange={(e) =>
                    updateField(
                      "promedio_otra_escala_valor",
                      e.target.value.trim()
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ej: 8.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Tipo de escala
                </label>
                <select
                  value={form.promedio_otra_escala_tipo}
                  onChange={(e) =>
                    updateField("promedio_otra_escala_tipo", e.target.value)
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona escala</option>
                  <option value="0-10">0–10</option>
                  <option value="0-4">0–4</option>
                  <option value="porcentaje">Porcentaje (0–100)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ubicación en el grupo */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Estuviste en tercio, quinto o décimo superior?
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { value: "tercio", label: "Tercio superior" },
              { value: "quinto", label: "Quinto superior" },
              { value: "decimo", label: "Décimo superior" },
              { value: "ninguno", label: "No estuve en ninguno" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm text-neutral-800"
              >
                <input
                  type="radio"
                  name="ubicacion_grupo"
                  value={opt.value}
                  checked={form.ubicacion_grupo === opt.value}
                  onChange={(e) => updateField("ubicacion_grupo", e.target.value)}
                  className="text-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Otra maestría */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Cuentas con otra maestría?
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
                  name="otra_maestria_tiene"
                  value={opt.value}
                  checked={form.otra_maestria_tiene === opt.value}
                  onChange={(e) =>
                    updateField("otra_maestria_tiene", e.target.value)
                  }
                  className="text-primary"
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>

          {form.otra_maestria_tiene === "si" && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Nombre de la maestría y universidad
              </label>
              <input
                type="text"
                value={form.otra_maestria_detalle}
                onChange={(e) =>
                  updateField("otra_maestria_detalle", e.target.value)
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: Máster en Enfermería Pediátrica – Universidad de Barcelona"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
