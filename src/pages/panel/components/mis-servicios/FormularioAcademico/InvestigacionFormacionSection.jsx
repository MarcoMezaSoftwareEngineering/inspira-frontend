export default function InvestigacionFormacionSection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.3. Investigación y formación complementaria
      </h4>

      <div className="grid gap-4">
        {/* Investigación */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Investigación
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="investigacion_experiencia"
                value="si"
                checked={form.investigacion_experiencia === "si"}
                onChange={(e) =>
                  updateField("investigacion_experiencia", e.target.value)
                }
                className="text-primary"
              />
              <span>
                Tengo publicaciones o he participado en grupos de investigación
              </span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="investigacion_experiencia"
                value="no"
                checked={form.investigacion_experiencia === "no"}
                onChange={(e) =>
                  updateField("investigacion_experiencia", e.target.value)
                }
                className="text-primary"
              />
              <span>No tengo experiencia en investigación</span>
            </label>
          </div>

          {form.investigacion_experiencia === "si" && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Detalla brevemente tus publicaciones o grupos de investigación
                (opcional)
              </label>
              <textarea
                rows={3}
                value={form.investigacion_detalle}
                onChange={(e) =>
                  updateField("investigacion_detalle", e.target.value)
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Formación complementaria */}
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            Formación complementaria relacionada con el máster
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.formacion_otra_maestria}
                onChange={(e) =>
                  updateField("formacion_otra_maestria", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>He cursado otra maestría</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.formacion_diplomados}
                onChange={(e) =>
                  updateField("formacion_diplomados", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>
                Tengo diplomados, cursos o seminarios relacionados con el máster
                de interés
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.formacion_encuentros}
                onChange={(e) =>
                  updateField("formacion_encuentros", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>
                He participado en encuentros, escuelas de verano o congresos
                sobre el tema
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={form.formacion_otros}
                onChange={(e) =>
                  updateField("formacion_otros", e.target.checked)
                }
                className="rounded border-neutral-300"
              />
              <span>Otros (especificar)</span>
            </label>
          </div>

          {form.formacion_otros && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Detalle de otros estudios
              </label>
              <textarea
                rows={2}
                value={form.formacion_otros_detalle}
                onChange={(e) =>
                  updateField("formacion_otros_detalle", e.target.value)
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
