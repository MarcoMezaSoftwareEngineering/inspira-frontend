// src/pages/landing/master2027/MasElegidos.jsx
// A4: los seis planes más elegidos en 2026/2027, por orden, con los precios
// de 2027/2028. Sin porcentajes: el número de orden ya lo dice todo.
import { MAS_ELEGIDOS, eur, planPorId } from "../../../config/paqueteMaster2027";
import { CierreCta, TituloSeccion } from "./comunes";
import { irA } from "./medicion";
import ilusBirretes from "../../../assets/images/landing/master-2027/ilus-birretes-graduacion.webp";

export default function MasElegidos({ onAbrirLista }) {
  return (
    <section id="mas-elegidos" className="scroll-mt-4 bg-secondary-light px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <div className="relative">
          <img
            src={ilusBirretes}
            alt=""
            width={900}
            height={900}
            loading="lazy"
            decoding="async"
            className="pointer-events-none mx-auto mb-3 h-auto w-24 opacity-30 lg:absolute lg:right-0 lg:top-1/2 lg:mb-0 lg:w-40 lg:-translate-y-1/2"
          />
          <TituloSeccion titulo={MAS_ELEGIDOS.titulo} intro={MAS_ELEGIDOS.subtitulo} />
        </div>

        <div
          role="region"
          aria-label={MAS_ELEGIDOS.titulo}
          tabIndex={0}
          className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] min-[380px]:-mx-5 min-[380px]:px-5 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {MAS_ELEGIDOS.tarjetas.map((t, i) => {
            const plan = planPorId(t.plan);
            const primero = i === 0;
            return (
              <div key={t.orden} className="w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-auto">
                <article
                  className={`flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm ${
                    primero ? "ring-2 ring-accent" : "ring-1 ring-neutral-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-fraunces text-4xl font-bold leading-none text-accent-dark">{t.orden}</span>
                    {primero && (
                      <span className="rounded-full bg-sun px-2.5 py-1 text-xs font-bold text-primary">
                        {MAS_ELEGIDOS.etiquetaPrimero}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-fraunces text-lg font-bold leading-snug text-primary">{t.titulo}</h3>
                  <p className="mt-1 text-xs leading-snug text-neutral-600">{plan.nombreCompleto}</p>
                  <p className="mt-3 font-fraunces text-3xl font-bold text-primary">{eur(plan.precio)}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-700">{t.texto}</p>
                  <div className="mt-4 space-y-1.5">
                    <a
                      href={plan.lista ? "#planes" : "#avanzados"}
                      onClick={(e) => {
                        e.preventDefault();
                        if (plan.lista) onAbrirLista(plan.lista);
                        else irA("avanzados");
                      }}
                      className="block text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
                    >
                      {plan.lista ? MAS_ELEGIDOS.verLista : MAS_ELEGIDOS.verAvanzado}
                    </a>
                    {t.conAlternativa && (
                      <a
                        href="#planes"
                        onClick={(e) => {
                          e.preventDefault();
                          onAbrirLista(planPorId(MAS_ELEGIDOS.alternativa.plan).lista, MAS_ELEGIDOS.alternativa.plan);
                        }}
                        className="block text-sm text-primary-light underline underline-offset-4 hover:text-primary"
                      >
                        {MAS_ELEGIDOS.alternativa.texto}
                      </a>
                    )}
                  </div>
                </article>
              </div>
            );
          })}
        </div>


        <CierreCta contexto={MAS_ELEGIDOS.contexto} ubicacion="mas_elegidos" />
      </div>
    </section>
  );
}
