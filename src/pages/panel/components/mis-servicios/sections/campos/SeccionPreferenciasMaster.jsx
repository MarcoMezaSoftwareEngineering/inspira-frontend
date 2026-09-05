const MASTERS_INTERES = [
  { value: "Administración de Empresas / MBA",  label: "Administración / MBA" },
  { value: "Marketing Digital y Comunicación",  label: "Marketing Digital" },
  { value: "Gestión de Proyectos",              label: "Gestión de Proyectos" },
  { value: "Recursos Humanos y Organización",   label: "Recursos Humanos" },
  { value: "Finanzas y Banca",                  label: "Finanzas y Banca" },
  { value: "Comercio Internacional",            label: "Comercio Internacional" },
  { value: "Derecho Internacional y RRII",      label: "Derecho Internacional" },
  { value: "Derecho de Empresa",                label: "Derecho de Empresa" },
  { value: "Inteligencia Artificial y Data",    label: "IA / Data Science" },
  { value: "Ciberseguridad",                    label: "Ciberseguridad" },
  { value: "Ingeniería y Tecnología",           label: "Ingeniería" },
  { value: "Arquitectura y Urbanismo",          label: "Arquitectura / Urbanismo" },
  { value: "Salud Pública y Epidemiología",     label: "Salud Pública" },
  { value: "Psicología y Salud Mental",         label: "Psicología" },
  { value: "Educación y Docencia",              label: "Educación" },
  { value: "Medio Ambiente y Sostenibilidad",   label: "Medio Ambiente" },
  { value: "Ciencias Sociales y Cooperación",   label: "Ciencias Sociales" },
  { value: "Arte, Diseño y Comunicación Visual",label: "Arte y Diseño" },
  { value: "Humanidades e Historia",            label: "Humanidades" },
  { value: "No sé todavía / Estoy explorando",  label: "🤔 Aún explorando" },
];

const COMUNIDADES = [
  "Andalucía", "Madrid", "Cataluña", "Valencia",
  "Galicia", "Castilla y León", "País Vasco", "Navarra",
];

const PRESUPUESTO_MIN = 500;
const PRESUPUESTO_MAX = 15000;

export default function SeccionPreferenciasMaster({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  function toggleComunidad(c) {
    const current = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];
    const next = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    set("comunidades_preferidas", next);
  }

  const comunidades = Array.isArray(formData.comunidades_preferidas) ? formData.comunidades_preferidas : [];

  const presMax = Number(formData.presupuesto_hasta) || 3000;
  const pct = (((presMax - PRESUPUESTO_MIN) / (PRESUPUESTO_MAX - PRESUPUESTO_MIN)) * 100).toFixed(1);

  // Lo más directo: qué máster busca, con nombre. Con eso el informe encuentra
  // ese y los parecidos; el área y la subárea de abajo solo acotan. Hasta tres
  // másteres y dos especializaciones.
  const deseados = Array.isArray(formData.masteres_deseados) ? formData.masteres_deseados : [];
  const especialidades = Array.isArray(formData.especializaciones) ? formData.especializaciones : [];
  const ponerLista = (key, lista, largo, i, valor) => {
    const next = [...lista]; while (next.length < largo) next.push("");
    next[i] = valor; set(key, next);
  };
  const campo = "w-full text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary";

  return (
    <div className="space-y-7">

      {/* Qué máster busca, con nombre */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-1.5">
          ¿Qué máster estás buscando?
        </p>
        <p className="text-[11px] text-neutral-400 mb-2.5">
          Escribe hasta tres, con el nombre que conozcas —aunque no sepas la universidad—.
          Buscaremos esos y los parecidos. Ej.: «Máster en Marketing Digital».
        </p>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <input key={i} type="text" className={campo} value={deseados[i] || ""}
              placeholder={["Primera opción", "Segunda opción (opcional)", "Tercera opción (opcional)"][i]}
              onChange={(e) => ponerLista("masteres_deseados", deseados, 3, i, e.target.value)} />
          ))}
        </div>
      </div>

      {/* Especialización */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-1.5">
          ¿Cuál es tu especialización, o en qué quieres profundizar?
        </p>
        <p className="text-[11px] text-neutral-400 mb-2.5">
          Hasta dos. Ej.: «finanzas corporativas», «educación inclusiva», «ciberseguridad».
        </p>
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <input key={i} type="text" className={campo} value={especialidades[i] || ""}
              placeholder={["Especialización principal", "Otra (opcional)"][i]}
              onChange={(e) => ponerLista("especializaciones", especialidades, 2, i, e.target.value)} />
          ))}
        </div>
      </div>

      {/* Tipo de máster — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-1.5">
          ¿Qué tipo de máster te interesa estudiar?
        </p>
        <p className="text-[11px] text-neutral-400 mb-2.5">
          Puede ser diferente a tu carrera. Ej: Ingeniería → Gestión de Proyectos.
        </p>
        <div className="flex flex-wrap gap-2">
          {MASTERS_INTERES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => set("area_interes_master", formData.area_interes_master === m.value ? "" : m.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.area_interes_master === m.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duración — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          Duración máxima que prefieres para el máster
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "indiferente", label: "Me da igual (1–2 años)" },
            { value: "1",          label: "Máx. 1 año (~60 ECTS)" },
            { value: "1.5",        label: "Máx. 1,5 años" },
            { value: "2",          label: "Máx. 2 años" },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("duracion_preferida", formData.duracion_preferida === o.value ? "" : o.value)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.duracion_preferida === o.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Prácticas — pills card */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">Prácticas curriculares</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { value: "imprescindible", label: "Imprescindible que tenga prácticas" },
            { value: "deseable",       label: "Me gustaría, pero no es obligatorio" },
            { value: "no_importante",  label: "No es un criterio para mí" },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("practicas_preferencia", formData.practicas_preferencia === o.value ? "" : o.value)}
              className={`px-3 py-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                formData.practicas_preferencia === o.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Presupuesto — slider */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿Cuánto puedes invertir en matrícula por año? <span className="font-normal text-neutral-400">(solo estudios)</span>
        </p>
        <div className="text-2xl font-bold text-primary mb-3">
          {presMax.toLocaleString("es-ES")} €
        </div>
        <input
          type="range"
          min={PRESUPUESTO_MIN}
          max={PRESUPUESTO_MAX}
          step="250"
          value={presMax}
          onChange={(e) => set("presupuesto_hasta", e.target.value)}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer outline-none
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, #013446 0%, #013446 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1.5">
          <span>500 €</span>
          <span>7.500 €</span>
          <span>15.000 €</span>
        </div>
        <p className="mt-1.5 text-[10px] text-neutral-400">
          Solo tasas universitarias. No incluye alojamiento ni manutención.
        </p>
      </div>

      {/* Comunidades autónomas */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿Tienes alguna comunidad autónoma preferida en España?{" "}
          <span className="font-normal text-neutral-400">(opcional)</span>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMUNIDADES.map((c) => (
            <label
              key={c}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-medium transition-all ${
                comunidades.includes(c)
                  ? "bg-primary/8 border-primary text-primary"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-white"
              }`}
            >
              <input type="checkbox" className="hidden" checked={comunidades.includes(c)} onChange={() => toggleComunidad(c)} />
              <span className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border ${
                comunidades.includes(c) ? "bg-primary border-primary" : "border-neutral-300"
              }`}>
                {comunidades.includes(c) && (
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
              {c}
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
