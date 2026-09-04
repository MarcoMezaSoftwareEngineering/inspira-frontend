export default function SeccionBecas({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  return (
    <div className="space-y-4">

      {/* Pregunta principal — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿Deseas postular a una beca o ayuda económica?
        </p>
        <div className="flex gap-2">
          {[
            { value: "si", label: "Sí, me interesa" },
            { value: "no", label: "No por ahora" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set("beca_desea", formData.beca_desea === opt.value ? "" : opt.value)}
              className={`px-5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.beca_desea === opt.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipos de beca — solo si marcó "sí" */}
      {formData.beca_desea === "si" && (
        <div>
          <p className="text-xs font-medium text-neutral-600 mb-2">¿Qué tipo de ayuda te interesa?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { key: "beca_completa",  label: "🎓 Becas completas" },
              { key: "beca_parcial",   label: "💸 Becas parciales / descuentos" },
              { key: "beca_ayuda_uni", label: "🏛️ Ayudas de la propia universidad" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, !formData[key])}
                className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                  formData[key]
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
