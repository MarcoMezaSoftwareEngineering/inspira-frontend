import { Pill, FLabel, EMsg, FInput } from "../Campos";

// ── PASO 2: Universidad y promedio ──────────────────────────────────
export default function PasoUniversidad({
  formData, set, has, uniWrap, uniQ, handleUniChange, setShowSugg, showSugg, suggestions,
  selectSugerencia, auip, confirmarAuip, setAuip,
}) {
  return (
    <div className="space-y-5">
      <div ref={uniWrap} className="relative">
        <FLabel>Universidad de origen</FLabel>
        <FInput value={uniQ}
          onChange={(e) => { handleUniChange(e.target.value); setShowSugg(true); }}
          onFocus={() => { if (uniQ.length >= 2) setShowSugg(true); }}
          placeholder="Empieza a escribir… PUCP, UNMSM, UBA, UNAM…"
          autoComplete="off" err={has("universidad_origen")} />
        <p className="text-xs text-neutral-400 mt-1.5">Puedes usar abreviaturas. Si no aparece, escribe el nombre completo.</p>
        <EMsg show={has("universidad_origen")} msg="Escribe el nombre de tu universidad" />

        {showSugg && suggestions.length > 0 && (
          <ul className="absolute z-30 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden">
            {suggestions.map((u) => (
              <li key={u}>
                <button type="button" onMouseDown={() => selectSugerencia(u)}
                  className="w-full text-left px-4 py-3 text-sm text-neutral-700 hover:bg-primary/5 hover:text-primary transition-colors">
                  {u}
                </button>
              </li>
            ))}
            <li className="px-4 py-2 text-xs text-neutral-400 border-t italic">No aparece → escribe el nombre y continúa</li>
          </ul>
        )}
        {auip === "si" && (
          <div className="mt-2 flex items-start gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
            <span className="font-bold">✓</span>
            <span><strong>Universidad afiliada a AUIP.</strong> Amplía tus opciones de becas.</span>
          </div>
        )}
        {auip === "no_detectado" && (
          <div className="mt-2 px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <p className="mb-2">⚠️ No encontramos tu universidad en AUIP. <strong>¿Está afiliada?</strong></p>
            <div className="flex gap-2">
              <button type="button" onClick={() => confirmarAuip("si")}
                className="px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition text-sm">Sí</button>
              <button type="button" onClick={() => confirmarAuip("no")}
                className="px-4 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 font-semibold hover:bg-neutral-200 transition text-sm">No</button>
            </div>
          </div>
        )}
        {auip === "no" && (
          <div className="mt-2 flex items-center gap-2 px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-500">
            ℹ️ No afiliada a AUIP.
            <button type="button" onClick={() => setAuip("no_detectado")} className="underline ml-1">Cambiar</button>
          </div>
        )}
      </div>

      <div>
        <FLabel>Promedio universitario</FLabel>
        <div className="flex gap-2">
          <FInput type="number" step="0.01" min="0"
            value={formData.promedio_peru || ""}
            onChange={(e) => set("promedio_peru", e.target.value.trim())}
            placeholder="Ej: 15.75" err={has("promedio_peru") || has("promedio_rango")} />
          <select value={formData.promedio_escala || "20"}
            onChange={(e) => set("promedio_escala", e.target.value)}
            className="w-44 sm:w-52 shrink-0 rounded-xl border border-neutral-200 px-3 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition">
            <option value="20">Escala /20 — Perú</option>
            <option value="10">Escala /10</option>
            <option value="5">Escala /5 — Colombia</option>
            <option value="4">GPA 0–4.0</option>
            <option value="100">Porcentaje %</option>
          </select>
        </div>
        <EMsg show={has("promedio_peru")} msg="Ingresa tu promedio universitario" />
        {has("promedio_rango") && (() => {
          const maxMap = { "20": 20, "10": 10, "5": 5, "4": 4, "100": 100 };
          const max = maxMap[formData.promedio_escala || "20"] || 20;
          return <EMsg show msg={`El promedio debe estar entre 0 y ${max} para la escala seleccionada`} />;
        })()}
      </div>

      <div>
        <FLabel>¿Estuviste en tercio, quinto o décimo superior?</FLabel>
        <div className={`flex flex-wrap gap-2 p-2 rounded-xl transition ${has("ubicacion_grupo") ? "bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "tercio",  label: "Tercio superior" },
            { value: "quinto",  label: "Quinto superior" },
            { value: "decimo",  label: "Décimo superior" },
            { value: "ninguno", label: "No estuve en ninguno" },
          ].map((o) => (
            <Pill key={o.value} active={formData.ubicacion_grupo === o.value}
              onClick={() => set("ubicacion_grupo", formData.ubicacion_grupo === o.value ? "" : o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("ubicacion_grupo")} />
      </div>

      <div>
        <FLabel>¿Cuentas con otra maestría?</FLabel>
        <div className={`flex gap-2 ${has("otra_maestria_tiene") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {["si","no"].map((v) => (
            <Pill key={v} active={formData.otra_maestria_tiene === v}
              onClick={() => set("otra_maestria_tiene", v)}>
              {v === "si" ? "Sí" : "No"}
            </Pill>
          ))}
        </div>
        <EMsg show={has("otra_maestria_tiene")} />
        {formData.otra_maestria_tiene === "si" && (
          <div className="mt-3">
            <FInput value={formData.otra_maestria_detalle || ""}
              onChange={(e) => set("otra_maestria_detalle", e.target.value)}
              placeholder="Ej: Máster en Enfermería Pediátrica – U. Barcelona" />
          </div>
        )}
      </div>
    </div>
  );
}
