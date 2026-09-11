// src/pages/landing/master2027/Fechas.jsx
// A11: calendario 2027-28, siempre estimado.
import Icono from "../../../components/common/Icono";
import { DESCARGOS, FECHAS } from "../../../config/paqueteMaster2027";
import { CierreCta, Descargo, TituloSeccion } from "./comunes";

export default function Fechas() {
  return (
    <section id="fechas" className="scroll-mt-4 bg-white px-4 py-16 min-[380px]:px-5 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-[1100px]">
        <TituloSeccion eyebrow={FECHAS.eyebrow} titulo={FECHAS.titulo} />
        <p className="mx-auto mt-4 max-w-3xl text-center font-semibold leading-relaxed text-primary sm:text-lg">
          {FECHAS.mensaje}
        </p>

        <ol className="relative mx-auto mt-10 max-w-3xl space-y-5 border-l-2 border-primary/15 pl-6 sm:pl-8">
          {FECHAS.hitos.map((h, i) => {
            const primero = i === 0;
            return (
              <li key={h.titulo} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[33px] top-6 h-4 w-4 rounded-full ring-4 ring-white sm:-left-[41px] ${
                    primero ? "bg-accent" : "bg-primary-light"
                  }`}
                />
                <div
                  className={`rounded-2xl p-5 ${
                    primero ? "border-2 border-accent bg-accent/[0.06]" : "border border-neutral-200 bg-white"
                  }`}
                >
                  {primero && (
                    <span className="mb-2 inline-flex rounded-full bg-sun px-2.5 py-0.5 text-xs font-bold text-primary">
                      {FECHAS.etiquetaPrimero}
                    </span>
                  )}
                  <h3 className="font-fraunces text-base font-bold leading-snug text-primary sm:text-lg">{h.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-700">{h.texto}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl bg-sun/30 p-5">
          <span className="mt-0.5 shrink-0 text-primary">
            <Icono nombre="estrella" size={20} />
          </span>
          <p className="text-sm font-semibold leading-relaxed text-primary">{FECHAS.consejo}</p>
        </div>

        <Descargo className="mx-auto mt-5 max-w-3xl">{DESCARGOS.fechas}</Descargo>

        <CierreCta contexto={FECHAS.contexto} ubicacion="fechas" />
      </div>
    </section>
  );
}
