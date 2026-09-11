// src/pages/landing/master2027/Promesa.jsx
// Las tres ideas de la casa (cliente, 11/09/2026), justo después de la barra
// de prueba: portal propio, paquetes accesibles y progresivos, y resultados
// comprobables, con el descargo de admisión al lado.
import Icono from "../../../components/common/Icono";
import { PROMESA } from "../../../config/paqueteMaster2027";
import { Descargo, Entrada, TituloSeccion } from "./comunes";
import { evento, irA } from "./medicion";

export default function Promesa() {
  return (
    <section id="por-que" className="scroll-mt-4 bg-secondary-light px-4 py-14 min-[380px]:px-5 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={PROMESA.eyebrow} titulo={PROMESA.titulo} />

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-6">
          {PROMESA.pilares.map((p, i) => (
            <Entrada key={p.id} retraso={i * 90} className="h-full">
              <article className="flex h-full flex-col rounded-2xl border-t-4 border-accent bg-white p-6 shadow-[0_14px_34px_-26px_rgba(1,52,70,0.45)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sun">
                  <Icono nombre={p.icono} size={22} />
                </span>
                <h3 className="mt-4 font-fraunces text-xl font-bold leading-snug text-primary">{p.titulo}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-700">{p.texto}</p>
                <a
                  href={`#${p.enlace.destino}`}
                  onClick={(e) => {
                    e.preventDefault();
                    evento("ads2027_promesa_enlace", { pilar: p.id });
                    irA(p.enlace.destino);
                  }}
                  className="mt-4 text-sm font-bold text-primary-light underline underline-offset-4 hover:text-primary"
                >
                  {p.enlace.texto} →
                </a>
              </article>
            </Entrada>
          ))}
        </div>

        <Descargo className="mx-auto mt-6 max-w-3xl text-center">{PROMESA.descargo}</Descargo>
      </div>
    </section>
  );
}
