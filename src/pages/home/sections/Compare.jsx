import { useState } from "react";
import Reveal from "../../../components/common/Reveal";

const solo = [
  ["Cientos de programas", "Revisas requisitos uno por uno."],
  ["Fechas y documentos", "Calendarios, apostillas, traducciones y plazos separados."],
  ["Seguimiento manual", "Emails, portales y estados en distintas plataformas."],
];

const inspira = [
  ["Shortlist filtrada", "Opciones priorizadas por tu perfil y objetivos."],
  ["Checklist centralizado", "Sabes qué falta, qué vence y qué ya está listo."],
  ["Un proceso visible", "Seguimiento y acompañamiento en cada etapa."],
];

export default function Compare() {
  const [view, setView] = useState("both");
  const showSolo = view === "both" || view === "solo";
  const showInspira = view === "both" || view === "inspira";

  return (
    <section className="compare">
      <div className="v4-container">
        <Reveal className="section-head">
          <div>
            <span className="eyebrow"><span className="dot" />Decisión</span>
            <h2>Hacerlo solo vs. hacerlo con un sistema.</h2>
          </div>
          <p>
            La diferencia no es “tener ayuda”; es reducir incertidumbre, errores
            repetidos y semanas perdidas comparando información dispersa.
          </p>
        </Reveal>

        <Reveal className="compare-box" delay={120}>
          <div className="compare-toggle">
            {[
              ["both", "Comparar"],
              ["solo", "Solo"],
              ["inspira", "Con Inspira"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={view === key ? "active" : undefined}
                onClick={() => setView(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={`compare-content${view === "both" ? "" : " single"}`}>
            {showSolo && (
              <div className="compare-side">
                <h3>Hacerlo solo</h3>
                <div className="compare-list">
                  {solo.map(([title, desc]) => (
                    <div className="compare-row" key={title}>
                      ◯
                      <div>
                        <b>{title}</b>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showInspira && (
              <div className="compare-side">
                <h3>Con Inspira</h3>
                <div className="compare-list">
                  {inspira.map(([title, desc]) => (
                    <div className="compare-row" key={title}>
                      ✓
                      <div>
                        <b>{title}</b>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
