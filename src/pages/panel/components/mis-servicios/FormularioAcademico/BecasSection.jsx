export default function BecasSection({ form, updateField }) {
  return (
    <section>
      <h4 className="text-base font-semibold text-neutral-900 mb-3">
        3.5. Becas y ayudas económicas
      </h4>

      <div className="grid gap-4">
        <div>
          <p className="block text-sm font-medium text-neutral-700 mb-2">
            ¿Deseas postular a una beca o ayuda económica?
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="beca_desea"
                value="si"
                checked={form.beca_desea === "si"}
                onChange={(e) => updateField("beca_desea", e.target.value)}
                className="text-primary"
              />
              <span>Sí</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="beca_desea"
                value="no"
                checked={form.beca_desea === "no"}
                onChange={(e) => updateField("beca_desea", e.target.value)}
                className="text-primary"
              />
              <span>No</span>
            </label>
          </div>

          {form.beca_desea === "si" && (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={form.beca_completa}
                  onChange={(e) =>
                    updateField("beca_completa", e.target.checked)
                  }
                  className="rounded border-neutral-300"
                />
                <span>Becas completas</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={form.beca_parcial}
                  onChange={(e) =>
                    updateField("beca_parcial", e.target.checked)
                  }
                  className="rounded border-neutral-300"
                />
                <span>Becas parciales / descuentos</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-800">
                <input
                  type="checkbox"
                  checked={form.beca_ayuda_uni}
                  onChange={(e) =>
                    updateField("beca_ayuda_uni", e.target.checked)
                  }
                  className="rounded border-neutral-300"
                />
                <span>Ayudas de la propia universidad</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
