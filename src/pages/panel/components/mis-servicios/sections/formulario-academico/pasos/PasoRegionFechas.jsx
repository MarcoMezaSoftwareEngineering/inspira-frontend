import { Pill, FLabel, EMsg } from "../Campos";
import { COMUNIDAD_INDIFERENTE } from "../constantes";
import { opcionesInicio } from "../utilidades";

// ── PASO 9: Región y fechas ─────────────────────────────────────────
export default function PasoRegionFechas({ formData, set, has, planCCAAs, todasComunidades, comunidades, toggleComunidad }) {
  const opcionesDisponibles = planCCAAs ? planCCAAs.opciones : todasComunidades;

  return (
    <div className="space-y-6">
      <div>
        <FLabel>Comunidad autónoma</FLabel>

        {planCCAAs && (
          <p className="text-xs text-neutral-500 mb-2">
            Tu plan cuenta con estas comunidades. Selecciona tus favoritas o preferenciales.
          </p>
        )}
        <div className={`grid grid-cols-2 gap-2 ${has("comunidades_preferidas") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {opcionesDisponibles.map((c) => (
            <button key={c} type="button" onClick={() => toggleComunidad(c)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                comunidades.includes(c)
                  ? "bg-primary/8 border-primary text-primary"
                  : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
              }`}>
              <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                comunidades.includes(c) ? "bg-primary border-primary" : "border-neutral-300"
              }`}>
                {comunidades.includes(c) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
              {c}
            </button>
          ))}
          {!planCCAAs && (
            <button type="button" onClick={() => toggleComunidad(COMUNIDAD_INDIFERENTE)}
              className={`col-span-2 flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all active:scale-[0.99] ${
                comunidades.includes(COMUNIDAD_INDIFERENTE)
                  ? "bg-primary/8 border-primary text-primary"
                  : "border-neutral-200 text-neutral-700 hover:border-neutral-300 bg-white"
              }`}>
              <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${
                comunidades.includes(COMUNIDAD_INDIFERENTE) ? "bg-primary border-primary" : "border-neutral-300"
              }`}>
                {comunidades.includes(COMUNIDAD_INDIFERENTE) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </span>
              {COMUNIDAD_INDIFERENTE}
            </button>
          )}
        </div>
        <EMsg show={has("comunidades_preferidas")} msg="Selecciona al menos una opción" />
      </div>

      <div>
        <FLabel>¿Cuándo planeas empezar el máster?</FLabel>
        <div className={`flex flex-wrap gap-2 ${has("inicio_previsto") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {opcionesInicio(formData.inicio_previsto).map((o) => (
            <Pill key={o.value} active={formData.inicio_previsto === o.value}
              onClick={() => set("inicio_previsto", formData.inicio_previsto === o.value ? "" : o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("inicio_previsto")} />
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-800 mb-3">Comentario para la IA y tus asesores</p>
        <p className="text-xs text-neutral-400 mb-3">Situación familiar, doctorado, plazos, restricciones… Todo ayuda.</p>
        <textarea rows={4}
          value={formData.comentario_especial || ""}
          onChange={(e) => set("comentario_especial", e.target.value)}
          className="w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          placeholder="Escribe aquí cualquier detalle relevante…" />
      </div>
    </div>
  );
}
