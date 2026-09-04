import { useState, useRef, useEffect } from "react";

const AREAS_CARRERA = [
  { value: "Administración y Negocios", label: "Adm. y Negocios" },
  { value: "Derecho",                   label: "Derecho" },
  { value: "Ingeniería y Tecnología",   label: "Ingeniería / TI" },
  { value: "Ciencias Sociales",         label: "Ciencias Sociales" },
  { value: "Educación",                 label: "Educación" },
  { value: "Salud",                     label: "Salud" },
  { value: "Humanidades",               label: "Humanidades" },
  { value: "Medio Ambiente",            label: "Medio Ambiente / ODS" },
  { value: "Arte y Diseño",             label: "Arte y Diseño" },
  { value: "Otra",                      label: "Otra" },
];

// Lista de sugerencias de autocompletado
const UNIS_SUGERENCIAS = [
  // Perú
  "Universidad Nacional Mayor de San Marcos",
  "Pontificia Universidad Católica del Perú",
  "Universidad de Lima",
  "Universidad Nacional de Ingeniería",
  "Universidad Peruana Cayetano Heredia",
  "Universidad Nacional Agraria La Molina",
  "Universidad del Pacífico",
  "Universidad ESAN",
  "Universidad Peruana de Ciencias Aplicadas",
  "Universidad César Vallejo",
  "Universidad Nacional Federico Villarreal",
  "Universidad Ricardo Palma",
  "Universidad San Ignacio de Loyola",
  // Colombia
  "Universidad Nacional de Colombia",
  "Universidad de los Andes",
  "Universidad de Antioquia",
  "Pontificia Universidad Javeriana",
  "Universidad del Rosario",
  "Universidad de la Sabana",
  "Universidad del Valle",
  "Universidad Industrial de Santander",
  // México
  "Universidad Nacional Autónoma de México",
  "Instituto Politécnico Nacional",
  "Universidad de Guadalajara",
  "Universidad Autónoma de Nuevo León",
  "Benemérita Universidad Autónoma de Puebla",
  "Universidad Iberoamericana",
  "Tecnológico de Monterrey",
  // Argentina
  "Universidad de Buenos Aires",
  "Universidad Nacional de Córdoba",
  "Universidad Nacional de La Plata",
  "Universidad Nacional de Rosario",
  "Universidad Austral",
  "ITBA – Instituto Tecnológico Buenos Aires",
  // Chile
  "Universidad de Chile",
  "Pontificia Universidad Católica de Chile",
  "Universidad Técnica Federico Santa María",
  "Universidad de Concepción",
  // Brasil
  "Universidade de São Paulo",
  "Universidade Federal do Rio de Janeiro",
  "Universidade Estadual de Campinas",
  // Ecuador
  "Universidad Central del Ecuador",
  "ESPOL – Escuela Politécnica del Litoral",
  "Universidad de Cuenca",
  "Universidad San Francisco de Quito",
  // Venezuela
  "Universidad Central de Venezuela",
  "Universidad del Zulia",
  // Bolivia
  "Universidad Mayor de San Andrés",
  // Paraguay
  "Universidad Nacional de Asunción",
  // Uruguay
  "Universidad de la República",
  // Costa Rica
  "Universidad de Costa Rica",
  // Guatemala
  "Universidad de San Carlos de Guatemala",
  // Rep. Dom.
  "Universidad Autónoma de Santo Domingo",
  // Portugal
  "Universidade de Lisboa",
  "Universidade do Porto",
];

// Keywords de detección AUIP (igual que calculadora)
const AUIP_KEYS = [
  "universidad de lima","universidad lima","universidad nacional mayor de san marcos","san marcos","unmsm",
  "pontificia universidad católica del perú","pucp","católica del perú","universidad nacional de ingeniería","uni peru",
  "universidad peruana cayetano heredia","cayetano heredia","universidad nacional agraria la molina","la molina",
  "universidad de buenos aires","uba","universidad nacional de córdoba","unc argentina","universidad nacional de la plata","unlp",
  "universidad nacional de rosario","universidad de chile","pontificia universidad católica de chile","puc chile",
  "universidad nacional de colombia","unal","universidad de antioquia","universidad del valle","univalle",
  "universidad industrial de santander","uis","universidad de los andes colombia","universidad de costa rica","ucr",
  "universidad central del ecuador","espol","politécnica del litoral","universidad de cuenca",
  "universidad de el salvador","ues","universidad de san carlos","usac","universidad rafael landívar","url guatemala",
  "universidad nacional autónoma de honduras","unah","universidad nacional autónoma de méxico","unam",
  "instituto politécnico nacional","ipn","universidad de guadalajara","udg","universidad autónoma de nuevo León","uanl",
  "benemérita universidad autónoma de puebla","buap","universidad nacional autónoma de nicaragua","unan",
  "universidad de panamá","universidad nacional de asunción","una paraguay","universidad autónoma de santo domingo","uasd",
  "universidad de la república","udelar","universidad central de venezuela","ucv","universidad del zulia","luz",
  "universidade de são paulo","usp","universidade federal do rio de janeiro","ufrj","universidade estadual de campinas","unicamp",
  "universidade de lisboa","universidade do porto",
];

function norm(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function detectarAuip(texto) {
  const val = norm(texto);
  if (val.length < 4) return null;
  const found = AUIP_KEYS.some((k) => {
    const kn = norm(k);
    if (kn.length < 5) return false;
    const esc = kn.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|\\s)" + esc + "(\\s|$)").test(val);
  });
  if (found) return "si";
  if (val.length >= 6) return "no_detectado";
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────

export default function SeccionPerfilCuantitativo({ formData, setFormData }) {
  function set(key, val) {
    setFormData((p) => ({ ...p, [key]: val }));
  }

  // Universidad: búsqueda + autocomplete + AUIP
  const [uniQ, setUniQ]         = useState(formData.universidad_origen || "");
  const [showSugg, setShowSugg] = useState(false);
  const [auip, setAuip]         = useState(() => detectarAuip(formData.universidad_origen || ""));
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClickOut(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowSugg(false);
    }
    document.addEventListener("mousedown", onClickOut);
    return () => document.removeEventListener("mousedown", onClickOut);
  }, []);

  const suggestions = uniQ.length >= 2
    ? UNIS_SUGERENCIAS.filter(u => norm(u).includes(norm(uniQ))).slice(0, 7)
    : [];

  function handleUniChange(val) {
    setUniQ(val);
    set("universidad_origen", val);
    const det = detectarAuip(val);
    setAuip(det);
    if (det === "si")           set("es_auip", "si");
    else if (det === "no_detectado") set("es_auip", "");
  }

  function selectSugerencia(uni) {
    setUniQ(uni);
    set("universidad_origen", uni);
    const det = detectarAuip(uni);
    setAuip(det === "no_detectado" ? "no_detectado" : det);
    if (det === "si") set("es_auip", "si");
    setShowSugg(false);
  }

  function confirmarAuip(valor) {
    setAuip(valor);
    set("es_auip", valor === "si" ? "si" : "no");
  }

  return (
    <div className="space-y-6">

      {/* Carrera */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">
          Carrera o título universitario
        </label>
        <input
          type="text"
          value={formData.carrera_titulo || ""}
          onChange={(e) => set("carrera_titulo", e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          placeholder="Ej: Ingeniería Industrial, Derecho, Psicología…"
        />
      </div>

      {/* Área de la carrera — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿A qué área pertenece tu carrera?
        </p>
        <div className="flex flex-wrap gap-2">
          {AREAS_CARRERA.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => set("area_carrera", formData.area_carrera === a.value ? "" : a.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.area_carrera === a.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Universidad con autocomplete + detección AUIP */}
      <div ref={wrapRef} className="relative">
        <label className="block text-xs font-semibold text-neutral-700 mb-2">
          Universidad de origen
        </label>
        <input
          type="text"
          value={uniQ}
          onChange={(e) => { handleUniChange(e.target.value); setShowSugg(true); }}
          onFocus={() => { if (uniQ.length >= 2) setShowSugg(true); }}
          className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          placeholder="Empieza a escribir… (PUCP, UNMSM, UBA, UNAM…)"
          autoComplete="off"
        />
        <p className="mt-1 text-[10px] text-neutral-400">
          Puedes usar la abreviatura o el nombre completo.
        </p>

        {/* Dropdown sugerencias */}
        {showSugg && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map((u) => (
              <li key={u}>
                <button
                  type="button"
                  onMouseDown={() => selectSugerencia(u)}
                  className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  {u}
                </button>
              </li>
            ))}
            <li className="px-4 py-2 text-[10px] text-neutral-400 border-t border-neutral-100 italic">
              No aparece → escribe el nombre completo y continúa
            </li>
          </ul>
        )}

        {/* Badge AUIP — detectada */}
        {(auip === "si") && (
          <div className="mt-2 flex items-start gap-2.5 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
            <span className="text-emerald-500 font-bold mt-0.5">✓</span>
            <div>
              <span className="font-semibold">Universidad afiliada a AUIP.</span>
              <span className="text-emerald-700"> Esto amplía tus opciones de becas y másteres.</span>
            </div>
          </div>
        )}

        {/* Badge AUIP — no detectada, pedir confirmación */}
        {auip === "no_detectado" && (
          <div className="mt-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <div className="flex-1">
                <span>No encontramos tu universidad en nuestra lista AUIP. </span>
                <span className="font-semibold">¿Está afiliada?</span>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => confirmarAuip("si")}
                    className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition text-xs">
                    Sí, está afiliada
                  </button>
                  <button type="button" onClick={() => confirmarAuip("no")}
                    className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-600 font-semibold hover:bg-neutral-200 transition text-xs">
                    No está afiliada
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Badge AUIP — confirmada manualmente como no */}
        {auip === "no" && (
          <div className="mt-2 flex items-center gap-2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-500">
            <span>ℹ️</span>
            <span>Universidad no afiliada a AUIP.
              <button type="button" onClick={() => setAuip("no_detectado")} className="ml-2 underline hover:text-neutral-700">Cambiar</button>
            </span>
          </div>
        )}
      </div>

      {/* Promedio + Escala */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">
          Promedio universitario
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.promedio_peru || ""}
            onChange={(e) => set("promedio_peru", e.target.value.trim())}
            className="flex-1 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            placeholder="Ej: 15.75"
          />
          <select
            value={formData.promedio_escala || "20"}
            onChange={(e) => set("promedio_escala", e.target.value)}
            className="w-44 rounded-xl border border-neutral-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          >
            <option value="20">Escala /20 — Perú</option>
            <option value="10">Escala /10</option>
            <option value="5">Escala /5 — Colombia</option>
            <option value="4">GPA 0–4.0</option>
            <option value="100">Porcentaje %</option>
          </select>
        </div>
      </div>

      {/* Ranking — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">
          ¿Estuviste en tercio, quinto o décimo superior?
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "tercio",  label: "Tercio superior" },
            { value: "quinto",  label: "Quinto superior" },
            { value: "decimo",  label: "Décimo superior" },
            { value: "ninguno", label: "No estuve en ninguno" },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => set("ubicacion_grupo", formData.ubicacion_grupo === o.value ? "" : o.value)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.ubicacion_grupo === o.value
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Otra maestría — pills */}
      <div>
        <p className="text-xs font-semibold text-neutral-700 mb-2">¿Cuentas con otra maestría?</p>
        <div className="flex gap-2">
          {["si", "no"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => set("otra_maestria_tiene", v)}
              className={`px-5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                formData.otra_maestria_tiene === v
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "border-neutral-200 text-neutral-600 hover:border-primary hover:text-primary bg-white"
              }`}
            >
              {v === "si" ? "Sí" : "No"}
            </button>
          ))}
        </div>
        {formData.otra_maestria_tiene === "si" && (
          <div className="mt-3">
            <label className="block text-xs font-medium text-neutral-600 mb-1.5">
              Nombre de la maestría y universidad
            </label>
            <input
              type="text"
              value={formData.otra_maestria_detalle || ""}
              onChange={(e) => set("otra_maestria_detalle", e.target.value)}
              className="w-full border border-neutral-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona"
            />
          </div>
        )}
      </div>

    </div>
  );
}
