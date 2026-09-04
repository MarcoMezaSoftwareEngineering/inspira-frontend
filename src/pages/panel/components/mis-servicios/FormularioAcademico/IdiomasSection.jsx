export default function IdiomasSection({ form, updateField }) {
  const showUniNivel = form.ingles_situacion === "uni";
  const showIntlDetalle = form.ingles_situacion === "intl";

  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.4. Idiomas y certificaciones
      </h4>

      <div className="grid gap-4">
        {/* Situación de inglés */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Situación actual de inglés
          </p>
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="uni"
                checked={form.ingles_situacion === "uni"}
                onChange={(e) =>
                  updateField("ingles_situacion", e.target.value)
                }
                className="mt-1 text-primary"
              />
              <span>Tengo certificación de inglés emitida por mi universidad</span>
            </label>

            {showUniNivel && (
              <div className="ml-6 mt-1">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nivel
                </label>
                <select
                  value={form.ingles_uni_nivel}
                  onChange={(e) =>
                    updateField("ingles_uni_nivel", e.target.value)
                  }
                  className="w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecciona nivel</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="intl"
                checked={form.ingles_situacion === "intl"}
                onChange={(e) =>
                  updateField("ingles_situacion", e.target.value)
                }
                className="mt-1 text-primary"
              />
              <span>
                Tengo certificación internacional (IELTS, TOEFL, Cambridge, etc.)
              </span>
            </label>

            {showIntlDetalle && (
              <div className="ml-6 mt-1 grid gap-3 md:grid-cols-[1fr,1fr]">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tipo de certificación
                  </label>
                  <select
                    value={form.ingles_intl_tipo}
                    onChange={(e) =>
                      updateField("ingles_intl_tipo", e.target.value)
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Selecciona</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="Cambridge">Cambridge</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Puntaje o nivel
                  </label>
                  <input
                    type="text"
                    value={form.ingles_intl_puntaje}
                    onChange={(e) =>
                      updateField("ingles_intl_puntaje", e.target.value)
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ej: 6.5, 90, C1"
                  />
                </div>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="instituto"
                checked={form.ingles_situacion === "instituto"}
                onChange={(e) =>
                  updateField("ingles_situacion", e.target.value)
                }
                className="mt-1 text-primary"
              />
              <span>Tengo inglés de instituto (sin certificación oficial)</span>
            </label>

            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="sin_cert"
                checked={form.ingles_situacion === "sin_cert"}
                onChange={(e) =>
                  updateField("ingles_situacion", e.target.value)
                }
                className="mt-1 text-primary"
              />
              <span>Sé inglés pero aún no lo he certificado</span>
            </label>

            <label className="flex items-start gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="ingles_situacion"
                value="no"
                checked={form.ingles_situacion === "no"}
                onChange={(e) =>
                  updateField("ingles_situacion", e.target.value)
                }
                className="mt-1 text-primary"
              />
              <span>No tengo inglés</span>
            </label>
          </div>
        </div>

        {/* Idioma del máster */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Idioma del máster que prefieres
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.idioma_master_es}
                onChange={(e) =>
                  updateField("idioma_master_es", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>Solo en español</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.idioma_master_bilingue}
                onChange={(e) =>
                  updateField("idioma_master_bilingue", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>Acepto máster bilingüe (español + inglés)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.idioma_master_ingles}
                onChange={(e) =>
                  updateField("idioma_master_ingles", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>Acepto máster totalmente en inglés</span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
