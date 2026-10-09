import { Pill, FLabel, EMsg, FInput, WBtn } from "../Campos";

// ── PASO 5: Inglés ──────────────────────────────────────────────────
export default function PasoIngles({ formData, set, has }) {
  return (
    <div className="space-y-5">
      <div>
        <FLabel>Situación actual de inglés</FLabel>
        <div className={`flex flex-col gap-2 ${has("ingles_situacion") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "intl",          label: "Tengo certificación internacional (IELTS, TOEFL, Cambridge…)" },
            { value: "uni",           label: "Tengo certificación de mi universidad" },
            { value: "instituto",     label: "Tengo inglés de instituto (sin certificación oficial)" },
            { value: "sabe_sin_cert", label: "Sé inglés pero aún no lo he certificado" },
            { value: "no",            label: "No tengo inglés" },
          ].map((o) => (
            <WBtn key={o.value} active={formData.ingles_situacion === o.value}
              onClick={() => set("ingles_situacion", formData.ingles_situacion === o.value ? "" : o.value)}>
              {o.label}
            </WBtn>
          ))}
        </div>
        <EMsg show={has("ingles_situacion")} />
      </div>

      {formData.ingles_situacion === "uni" && (
        <div>
          <FLabel>Nivel certificado por tu universidad</FLabel>
          <div className={`flex flex-wrap gap-2 ${has("ingles_uni_nivel") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
            {["B1","B2","C1","C2","Otro"].map((n) => (
              <Pill key={n} active={formData.ingles_uni_nivel === n}
                onClick={() => set("ingles_uni_nivel", formData.ingles_uni_nivel === n ? "" : n)}>
                {n}
              </Pill>
            ))}
          </div>
          <EMsg show={has("ingles_uni_nivel")} />
        </div>
      )}

      {formData.ingles_situacion === "intl" && (
        <div className="space-y-4">
          <div>
            <FLabel>Tipo de certificación</FLabel>
            <div className={`flex flex-wrap gap-2 ${has("ingles_intl_tipo") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
              {["IELTS","TOEFL","Cambridge","Duolingo English Test","Otro"].map((t) => (
                <Pill key={t} active={formData.ingles_intl_tipo === t}
                  onClick={() => set("ingles_intl_tipo", formData.ingles_intl_tipo === t ? "" : t)}>
                  {t}
                </Pill>
              ))}
            </div>
            <EMsg show={has("ingles_intl_tipo")} />
          </div>
          <div>
            <FLabel>Puntaje o nivel obtenido</FLabel>
            <FInput value={formData.ingles_intl_puntaje || ""}
              onChange={(e) => set("ingles_intl_puntaje", e.target.value)}
              placeholder="Ej: 6.5 (IELTS), 90 (TOEFL), C1 (Cambridge)"
              err={has("ingles_intl_puntaje")} />
            <EMsg show={has("ingles_intl_puntaje")} msg="Ingresa tu puntaje o nivel" />
          </div>
        </div>
      )}
    </div>
  );
}
