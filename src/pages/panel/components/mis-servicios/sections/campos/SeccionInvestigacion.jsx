// src/pages/panel/components/mis-servicios/sections/campos/SeccionInvestigacion.jsx

export default function SeccionInvestigacion({ formData, setFormData }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-neutral-900 mb-2">
        3.3. Investigación y formación complementaria
      </h4>

      <div className="grid gap-3">

        {/* Investigación */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Investigación
          </p>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="investigacion_experiencia"
                value="si"
                checked={formData.investigacion_experiencia === "si"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    investigacion_experiencia: e.target.value,
                  }))
                }
                className="text-primary"
              />
              <span>
                Tengo publicaciones o he participado en grupos de investigación
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="radio"
                name="investigacion_experiencia"
                value="no"
                checked={formData.investigacion_experiencia === "no"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    investigacion_experiencia: e.target.value,
                  }))
                }
                className="text-primary"
              />
              <span>No tengo experiencia en investigación</span>
            </label>
          </div>

          {formData.investigacion_experiencia === "si" && (
            <div className="mt-2">
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Detalla brevemente tus publicaciones o grupos de investigación
                (opcional)
              </label>
              <textarea
                rows={3}
                value={formData.investigacion_detalle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    investigacion_detalle: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

        {/* Formación complementaria */}
        <div>
          <p className="block text-xs font-medium text-neutral-700 mb-1">
            Formación complementaria relacionada con el máster
          </p>

          <div className="grid gap-1 md:grid-cols-2">

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.formacion_otra_maestria}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formacion_otra_maestria: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>He cursado otra maestría</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.formacion_diplomados}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formacion_diplomados: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>
                Tengo diplomados, cursos o seminarios relacionados con el máster
                de interés
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.formacion_encuentros}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formacion_encuentros: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>
                He participado en encuentros, escuelas de verano o congresos
                sobre el tema
              </span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={!!formData.formacion_otros}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formacion_otros: e.target.checked,
                  }))
                }
                className="rounded border-neutral-300"
              />
              <span>Otros (especificar)</span>
            </label>

          </div>

          {formData.formacion_otros && (
            <div className="mt-2">
              <label className="block text-[10px] font-medium text-neutral-700 mb-1">
                Detalle de otros estudios
              </label>
              <textarea
                rows={2}
                value={formData.formacion_otros_detalle || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    formacion_otros_detalle: e.target.value,
                  }))
                }
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-xs resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
