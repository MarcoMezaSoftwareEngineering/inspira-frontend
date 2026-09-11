// src/pages/landing/master2027/Faq.jsx
// A13: preguntas frecuentes. Una abierta por defecto (la primera).
import { useState } from "react";
import { FAQ } from "../../../config/paqueteMaster2027";
import { EnlaceWhatsapp, TituloSeccion } from "./comunes";
import { evento, irA } from "./medicion";
import ilusLupa from "../../../assets/images/landing/master-2027/ilus-persona-lupa-web.webp";

function abrirDesplegable(id) {
  const el = document.getElementById(id);
  if (el && el.tagName === "DETAILS") el.open = true;
  irA(id);
}

function Respuesta({ partes, onAbrirOtros }) {
  return partes.map((parte, i) =>
    typeof parte === "string" ? (
      <span key={i}>{parte}</span>
    ) : (
      <a
        key={i}
        href={`#${parte.destino}`}
        aria-haspopup={parte.destino === "otros-servicios" && onAbrirOtros ? "dialog" : undefined}
        onClick={(e) => {
          e.preventDefault();
          // En la landing, parciales, individuales y asesorías viven en una
          // ventana; en /servicios/master, en su sección (se baja hasta ella).
          if (parte.destino === "otros-servicios" && onAbrirOtros) onAbrirOtros(e.currentTarget, "faq");
          else abrirDesplegable(parte.destino);
        }}
        className="font-semibold text-primary-light underline underline-offset-4 hover:text-primary"
      >
        {parte.enlace}
      </a>
    )
  );
}

// `preguntasExtra`: se insertan tras la primera (solo /servicios/master).
export default function Faq({ onAbrirOtros, preguntasExtra = [] }) {
  const preguntas = [FAQ.preguntas[0], ...preguntasExtra, ...FAQ.preguntas.slice(1)];
  const [abierta, setAbierta] = useState(FAQ.preguntas[0].id);

  function alternar(p) {
    const abrir = abierta !== p.id;
    setAbierta(abrir ? p.id : null);
    if (abrir) evento("ads2027_faq_abrir", { pregunta: p.q });
  }

  return (
    <section id="faq" className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_180px]">
          <TituloSeccion centrado={false} eyebrow={FAQ.eyebrow} titulo={FAQ.titulo} />
          <img
            src={ilusLupa}
            alt=""
            width={754}
            height={900}
            loading="lazy"
            decoding="async"
            className="hidden h-auto w-[180px] md:block"
          />
        </div>

        <div className="mt-8 space-y-3">
          {preguntas.map((p) => {
            const abiertaEsta = abierta === p.id;
            return (
              <div key={p.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
                <h3>
                  <button
                    type="button"
                    id={`faq-${p.id}-boton`}
                    aria-expanded={abiertaEsta}
                    aria-controls={`faq-${p.id}`}
                    onClick={() => alternar(p)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-sky"
                  >
                    <span className="font-bold leading-snug text-primary">{p.q}</span>
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-light text-lg leading-none text-primary transition-transform ${
                        abiertaEsta ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={`faq-${p.id}`}
                  role="region"
                  aria-labelledby={`faq-${p.id}-boton`}
                  hidden={!abiertaEsta}
                  className="px-5 pb-5 text-sm leading-relaxed text-neutral-700"
                >
                  <Respuesta partes={p.a} onAbrirOtros={onAbrirOtros} />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center">
          <EnlaceWhatsapp ubicacion="faq" />
        </p>
      </div>
    </section>
  );
}
