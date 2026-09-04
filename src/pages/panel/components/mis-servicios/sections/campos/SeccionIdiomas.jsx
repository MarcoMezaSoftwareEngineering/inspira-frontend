export default function SeccionIdiomas({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  const SITUACION_INGLES = [
    { value: "uni",           label: "Certificación de mi universidad" },
    { value: "intl",          label: "Certificación internacional (IELTS, TOEFL, Cambridge…)" },
    { value: "instituto",     label: "Inglés de instituto (sin cert. oficial)" },
    { value: "sabe_sin_cert", label: "Sé inglés pero no lo he certificado" },
    { value: "no",            label: "No tengo inglés" },
  ];

  return (
    <div className="space-y-6">

      {/* Situación de inglés — pills verticales */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          Situación actual de inglés
        </p>
        <div className="flex flex-col gap-2">
          {SITUACION_INGLES.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("ingles_situacion", formData.ingles_situacion === o.value ? "" : o.value)}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                formData.ingles_situacion === o.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Sub-campos si cert. universitaria */}
        {formData.ingles_situacion === "uni" && (
          <div className="mt-3 ml-1">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Nivel</label>
            <div className="flex flex-wrap gap-2">
              {["B1", "B2", "C1", "C2", "Otro"].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set("ingles_uni_nivel", formData.ingles_uni_nivel === n ? "" : n)}
                  className={`px-4 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    formData.ingles_uni_nivel === n
                      ? "bg-primary text-white border-primary"
                      : "border-neutral-200 text-neutral-600 hover:border-primary bg-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-campos si cert. internacional */}
        {formData.ingles_situacion === "intl" && (
          <div className="mt-3 ml-1 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tipo de certificación</label>
              <div className="flex flex-wrap gap-2">
                {["IELTS", "TOEFL", "Cambridge", "Otro"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("ingles_intl_tipo", formData.ingles_intl_tipo === t ? "" : t)}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                      formData.ingles_intl_tipo === t
                        ? "bg-primary text-white border-primary"
                        : "border-neutral-200 text-neutral-600 hover:border-primary bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Puntaje o nivel</label>
              <input
                type="text"
                value={formData.ingles_intl_puntaje || ""}
                onChange={(e) => set("ingles_intl_puntaje", e.target.value)}
                className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="Ej: 6.5, 90, C1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Idioma del máster — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          Idioma del máster que aceptas
        </p>
        <div className="flex flex-col gap-2">
          {[
            { key: "idioma_master_es",       label: "Solo en español" },
            { key: "idioma_master_bilingue",  label: "Bilingüe (español + inglés)" },
            { key: "idioma_master_ingles",    label: "Totalmente en inglés" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (!formData[key]) {
                  set("idioma_master_es", false);
                  set("idioma_master_bilingue", false);
                  set("idioma_master_ingles", false);
                  set(key, true);
                }
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                formData[key]
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {label}
              {formData[key] && <span className="float-right opacity-70">✓</span>}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
