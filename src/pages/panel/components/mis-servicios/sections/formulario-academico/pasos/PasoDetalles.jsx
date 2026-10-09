import { Pill, FLabel, EMsg, WBtn } from "../Campos";
import { DESCARTES, PRES_MIN, PRES_MAX } from "../constantes";
import { numero } from "../../../../../../../lib/formatos";

// ── PASO 8: Duración, prácticas y presupuesto ───────────────────────
export default function PasoDetalles({ formData, set, has }) {
  const presMax  = Number(formData.presupuesto_hasta) || 3000;
  const presPct  = (((presMax - PRES_MIN) / (PRES_MAX - PRES_MIN)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <FLabel>Duración máxima que prefieres</FLabel>
        <div className={`flex flex-wrap gap-2 ${has("duracion_preferida") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "indiferente", label: "Me da igual (1–2 años)" },
            { value: "1",          label: "Máx. 1 año (~60 ECTS)" },
            { value: "1.5",        label: "Máx. 1,5 años" },
            { value: "2",          label: "Máx. 2 años" },
          ].map((o) => (
            <Pill key={o.value} active={formData.duracion_preferida === o.value}
              onClick={() => set("duracion_preferida", formData.duracion_preferida === o.value ? "" : o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("duracion_preferida")} />
      </div>

      <div>
        <FLabel>Prácticas curriculares</FLabel>
        <p className="text-xs text-neutral-400 mb-2">Las prácticas equivalen a tu primera experiencia laboral europea.</p>
        <div className={`flex flex-col gap-2 ${has("practicas_preferencia") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "imprescindible", label: "Imprescindible que tenga prácticas" },
            { value: "deseable",       label: "Me gustaría, pero no es obligatorio" },
            { value: "no_importante",  label: "No es un criterio para mí" },
          ].map((o) => (
            <WBtn key={o.value} active={formData.practicas_preferencia === o.value}
              onClick={() => set("practicas_preferencia", formData.practicas_preferencia === o.value ? "" : o.value)}>
              {o.label}
            </WBtn>
          ))}
        </div>
        <EMsg show={has("practicas_preferencia")} />
      </div>

      <div>
        <FLabel>¿Cuánto puedes invertir en matrícula por año?</FLabel>
        <div className="text-3xl font-bold text-primary mb-4">{numero(presMax)} €</div>
        {/* La sangría de las líneas de este className es parte del atributo:
            se dejó tal cual al mover el paso (09/10/2026). */}
        <input type="range" min={PRES_MIN} max={PRES_MAX} step="250" value={presMax}
          onChange={(e) => set("presupuesto_hasta", e.target.value)}
          className="w-full h-2.5 rounded-lg appearance-none cursor-pointer outline-none
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6
                [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary
                [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          style={{ background: `linear-gradient(to right, #013446 0%, #013446 ${presPct}%, #e5e7eb ${presPct}%, #e5e7eb 100%)` }} />
        <div className="flex justify-between text-xs text-neutral-400 mt-2">
          <span>500 €</span><span>7.500 €</span><span>15.000 €</span>
        </div>
        <p className="text-xs text-neutral-400 mt-1.5">Solo tasas universitarias. No incluye alojamiento ni manutención.</p>
      </div>

      <div>
        <FLabel>Modalidad preferida</FLabel>
        <div className={`flex flex-wrap gap-2 ${has("modalidad_preferida") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "presencial",     label: "Presencial" },
            { value: "semipresencial", label: "Semipresencial" },
            { value: "online",         label: "Online" },
            { value: "indiferente",    label: "Me da igual" },
          ].map((o) => (
            <Pill key={o.value} active={formData.modalidad_preferida === o.value}
              onClick={() => set("modalidad_preferida", formData.modalidad_preferida === o.value ? "" : o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("modalidad_preferida")} />
      </div>

      {/* Lo que NO quiere. Hasta ahora solo se preguntaba lo que sí, y
          los descartes son lo que más rápido limpia una lista. */}
      <div>
        <FLabel>¿Hay algo que descartes de entrada? <span className="font-normal text-neutral-400">(opcional)</span></FLabel>
        <p className="text-xs text-neutral-400 mb-3">Marca lo que no quieres ver en tu informe.</p>
        <div className="flex flex-wrap gap-2">
          {DESCARTES.map((o) => {
            const lista = Array.isArray(formData.descartes) ? formData.descartes : [];
            const on = lista.includes(o.value);
            return (
              <Pill key={o.value} active={on}
                onClick={() => set("descartes", on ? lista.filter((x) => x !== o.value) : [...lista, o.value])}>
                {o.label}
              </Pill>
            );
          })}
        </div>
        <input type="text" value={formData.descartes_nota || ""}
          onChange={(e) => set("descartes_nota", e.target.value)}
          placeholder="Otra cosa que no quieras (ciudades, universidades, temas…)"
          className="mt-3 w-full rounded-xl border border-neutral-200 px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
      </div>
    </div>
  );
}
