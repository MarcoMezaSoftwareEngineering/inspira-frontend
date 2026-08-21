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
    <section className="py-24 px-6" style={{ background: "#F3F7F8" }}>
      <div className="max-w-5xl mx-auto">
        <Reveal className="text-center mb-11">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#F49E4B" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F49E4B" }} />
            Decisión
          </span>
          <h2 className="font-fraunces text-3xl md:text-5xl font-bold text-primary mt-3 tracking-tight">
            Hacerlo solo vs. hacerlo con un sistema.
          </h2>
          <p className="text-neutral-500 mt-4 max-w-xl mx-auto leading-relaxed">
            La diferencia no es "tener ayuda"; es reducir incertidumbre, errores repetidos
            y semanas perdidas comparando información dispersa.
          </p>
        </Reveal>

        <div className="flex justify-center mb-6">
          <div className="flex p-1.5 rounded-2xl gap-1" style={{ background: "#edf3f4" }}>
            {[
              ["both", "Comparar"],
              ["solo", "Solo"],
              ["inspira", "Con Inspira"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`px-4.5 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                  view === key ? "bg-white text-primary shadow-[0_5px_14px_rgba(18,52,61,.08)]" : "text-[#678087]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Reveal className="bg-white border border-neutral-200 rounded-[28px] overflow-hidden" delay={120}>
          <div className={`grid ${view === "both" ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {showSolo && (
              <div className={`p-9 ${view === "both" ? "md:border-r border-neutral-200" : ""}`}>
                <h3 className="text-2xl font-bold mb-5">Hacerlo solo</h3>
                <div className="grid gap-3">
                  {solo.map(([title, desc]) => (
                    <div key={title} className="flex gap-3 items-start p-3 rounded-2xl bg-[#f8fbfb] text-sm">
                      <span className="text-neutral-400">✕</span>
                      <div>
                        <b className="block mb-0.5">{title}</b>
                        <span className="text-neutral-500">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showInspira && (
              <div className="p-9">
                <h3 className="text-2xl font-bold mb-5">Con Inspira</h3>
                <div className="grid gap-3">
                  {inspira.map(([title, desc]) => (
                    <div key={title} className="flex gap-3 items-start p-3 rounded-2xl bg-[#f8fbfb] text-sm">
                      <span className="font-black" style={{ color: "#1d6a4a" }}>✓</span>
                      <div>
                        <b className="block mb-0.5">{title}</b>
                        <span className="text-neutral-500">{desc}</span>
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
