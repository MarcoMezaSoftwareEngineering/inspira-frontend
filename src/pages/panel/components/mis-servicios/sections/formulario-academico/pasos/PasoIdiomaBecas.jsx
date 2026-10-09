import { Pill, FLabel, EMsg, WBtn } from "../Campos";

// ── PASO 6: Idioma del máster y becas ───────────────────────────────
export default function PasoIdiomaBecas({ formData, set, has }) {
  return (
    <div className="space-y-6">
      <div>
        <FLabel>Idioma del máster que aceptas</FLabel>
        <div className={`flex flex-col gap-2 ${has("idioma_master") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { key: "idioma_master_es",       label: "Solo en español" },
            { key: "idioma_master_bilingue",  label: "Bilingüe (español + inglés)" },
            { key: "idioma_master_ingles",    label: "Totalmente en inglés" },
          ].map(({ key, label }) => (
            <WBtn key={key} active={!!formData[key]} onClick={() => {
              if (!formData[key]) {
                set("idioma_master_es", false);
                set("idioma_master_bilingue", false);
                set("idioma_master_ingles", false);
                set(key, true);
              }
            }}>
              {label}
            </WBtn>
          ))}
        </div>
        <EMsg show={has("idioma_master")} msg="Selecciona al menos un idioma" />
      </div>

      <div>
        <FLabel>¿Deseas postular a una beca o ayuda económica?</FLabel>
        <div className={`flex gap-2 ${has("beca_desea") ? "p-2 rounded-xl bg-red-50 border border-red-200" : ""}`}>
          {[
            { value: "si", label: "Sí, me interesa" },
            { value: "no", label: "No por ahora" },
          ].map((o) => (
            <Pill key={o.value} active={formData.beca_desea === o.value}
              onClick={() => set("beca_desea", formData.beca_desea === o.value ? "" : o.value)}>
              {o.label}
            </Pill>
          ))}
        </div>
        <EMsg show={has("beca_desea")} />
        {formData.beca_desea === "si" && (
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-neutral-500 mb-1">¿Qué tipo de becas te interesan?</p>
            {[
              { key: "beca_completa",  label: "🎓 Becas completas (matrícula cubierta)" },
              { key: "beca_parcial",   label: "💸 Becas parciales / descuentos" },
              { key: "beca_ayuda_uni", label: "🏛️ Ayudas de la propia universidad" },
              { key: "beca_auip",      label: "🌐 Becas AUIP (si aplica)" },
            ].map(({ key, label }) => (
              <WBtn key={key} active={!!formData[key]} onClick={() => set(key, !formData[key])}>
                {label}
              </WBtn>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
